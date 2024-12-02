"use server";

import {
  products,
  purchaseItems,
  TDBProduct,
  TDBVariant,
  variants,
} from "@/db/schema";
import { ProductsCache, ProductsCountCache } from "@/lib/cache/products";
import { initializeDB } from "@/lib/db";
import { ServerActionResponse } from "@/lib/utils";
import { productSchema, TProduct } from "@/schema/products";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  isNull,
  or,
  sql,
  sum,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  ProductSale,
  TDBProductWithVariants,
  TDBProductWithVariantsForSale,
  TDBVariantsForSale,
} from "@/types/product";

const defaultLimit = 10;

const getProductsFromDBWithoutQuery = async (
  offset: number = 0,
  limit: number = defaultLimit,
) => {
  const { db, client } = await initializeDB();
  const res = await db
    .select({
      id: products.id,
      title: products.title,
      description: products.description,
      image: products.image,
      deletedAt: products.deletedAt,
      createdAt: products.createdAt,
      variants: sql<Omit<TDBVariant, "productId">[]>`json_agg(
        json_build_object(
          'id', ${variants.id}, 
          'price', ${variants.price}, 
          'quantity', ${variants.quantity}, 
          'inch', ${variants.inch},
          'feet', ${variants.feet}, 
          'deletedAt', ${variants.deletedAt}
        )
      )`,
    })
    .from(products)
    .innerJoin(variants, eq(variants.productId, products.id))
    .groupBy(products.id)
    .orderBy(desc(products.id))
    .where(and(isNull(products.deletedAt), isNull(variants.deletedAt)))
    .limit(limit)
    .offset(offset * limit);

  await client.end();
  return res;
};

export const getProductsCountFromDB = async () => {
  const { db, client } = await initializeDB();
  const res = await db
    .select({ count: count(products.id) })
    .from(products)
    .where(isNull(products.deletedAt));

  await client.end();
  return res[0].count;
};

export const createProduct = async (
  data: TProduct,
): Promise<
  ServerActionResponse<{
    data: TDBProduct & { variants: TDBVariant[] };
    total: number;
  }>
> => {
  const { db, client } = await initializeDB();
  try {
    // validate the data
    const { error } = productSchema.safeParse(data);
    if (error) throw new Error(error.message);

    // insert the product data and variants into db within a single transaction
    const res = await db.transaction(async (trx) => {
      const product = await trx
        .insert(products)
        .values({
          title: data.title,
          description: data.description,
          image: data.imageId,
        })
        .returning();

      const variantsDB = await Promise.all(
        data.variants.map(async (variant) => {
          return (
            await trx
              .insert(variants)
              .values({
                productId: product[0].id,
                price: Number(variant.price),
                quantity: Number(variant.quantity),
                inch: Number(variant.inch),
                feet: Number(variant.feet),
              })
              .returning()
          )[0];
        }),
      );

      return { data: { ...product[0], variants: variantsDB } };
    });

    // update the products cache if total number of cached products count is less than limit
    await ProductsCache.set(await getProductsFromDBWithoutQuery());

    let total = await ProductsCountCache.get();
    if (!total) {
      total = await getProductsCountFromDB();
      await ProductsCountCache.set(total);
    } else {
      total = await ProductsCountCache.incr();
    }

    // revalidate the path
    revalidatePath("/products");

    return {
      data: res.data,
      total: (await ProductsCountCache.get()) || 0,
    };
  } catch (error) {
    console.log(error);
    return { error: "Error creating product" };
  } finally {
    await client.end();
  }
};

export const getProducts = async (
  query?: string,
  offset: number = 0,
  limit: number = defaultLimit,
): Promise<
  ServerActionResponse<{
    data: TDBProductWithVariants[];
    total: number;
  }>
> => {
  const { db, client } = await initializeDB();
  try {
    // get cached products count
    let total = await ProductsCountCache.get();
    if (!total) {
      total = await getProductsCountFromDB();
      await ProductsCountCache.set(Number(total));
    }

    if (query?.trim() === "") {
      if (offset !== 0 || limit !== defaultLimit) {
        return {
          data: await getProductsFromDBWithoutQuery(offset, limit),
          total: Number(total),
        };
      }
      // get cached products
      const cachedProducts = await ProductsCache.get();

      // if  products are empty, get initial products from db
      const productsDataDB = cachedProducts?.length
        ? cachedProducts
        : await getProductsFromDBWithoutQuery();

      // update the products cache if its empty
      !cachedProducts && (await ProductsCache.set(productsDataDB));

      return {
        data: productsDataDB,
        total: Number(total),
      };
    }

    // const totalCount

    // get products from db if not cached using fuzzy search
    const productsData = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        image: products.image,
        deletedAt: products.deletedAt,
        createdAt: products.createdAt,
        total: sql<number>`count(*) over()`,
        variants: sql<Omit<TDBVariant, "productId">[]>`
          json_agg(
            json_build_object(
              'id', ${variants.id}, 
              'price', ${variants.price}, 
              'quantity', ${variants.quantity}, 
              'inch', ${variants.inch}, 
              'feet', ${variants.feet},
              'deletedAt', ${variants.deletedAt}
            )
          )`,
      })
      .from(products)
      .innerJoin(variants, eq(variants.productId, products.id))
      .where(
        and(
          gt(sql`SIMILARITY(title, ${query})`, 0.3),
          isNull(products.deletedAt),
          isNull(variants.deletedAt),
        ),
      )
      .orderBy(desc(sql`SIMILARITY(title, ${query})`))
      .groupBy(products.id)
      .limit(limit)
      .offset(offset * limit);

    // console.log(productsData);

    return {
      data: productsData,
      total: Number(productsData[0]?.total || 0),
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error getting products",
    };
  } finally {
    await client.end();
  }
};

export const getProduct = async (
  id: string,
): Promise<ServerActionResponse<{ data: TDBProductWithVariants }>> => {
  const { db, client } = await initializeDB();
  try {
    const product = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        image: products.image,
        deletedAt: products.deletedAt,
        createdAt: products.createdAt,
        variants: sql<Omit<TDBVariant, "productId">[]>`json_agg(
            json_build_object(
              'id', ${variants.id}, 
              'price', ${variants.price}, 
              'quantity', ${variants.quantity}, 
              'inch', ${variants.inch},
              'feet', ${variants.feet}, 
              'msp', ${variants.msp},
              'costPrice', ${variants.costPrice},
              'deletedAt', ${variants.deletedAt}
            )
          )`,
      })
      .from(products)
      .innerJoin(variants, eq(variants.productId, products.id))
      .where(and(eq(products.id, Number(id)), isNull(variants.deletedAt)))
      .groupBy(products.id);

    return {
      data: product[0],
    };
  } catch (error) {
    return {
      error: "Error getting product",
    };
  } finally {
    await client.end();
  }
};

export const updateProduct = async ({
  data,
  id,
}: {
  data: Partial<TProduct>;
  id: number;
}): Promise<ServerActionResponse<{ message: string }>> => {
  const { db, client } = await initializeDB();
  try {
    await db.transaction(async (trx) => {
      const prevVariants = await trx
        .select()
        .from(variants)
        .where(eq(variants.productId, id));

      const currentVariants = data.variants || [];

      const removedVariants = prevVariants.filter(
        (prevVariant) =>
          !currentVariants.some(
            (currentVariant) =>
              Number(currentVariant.inch) === Number(prevVariant.inch) &&
              Number(currentVariant.feet) === Number(prevVariant.feet),
          ),
      );
      const addedVariants = currentVariants.filter(
        (currentVariant) =>
          !prevVariants.some(
            (prevVariant) =>
              Number(currentVariant.inch) === Number(prevVariant.inch) &&
              Number(currentVariant.feet) === Number(prevVariant.feet),
          ),
      );

      const updatedVariants = currentVariants.filter((currentVariant) => {
        const prevVariant = prevVariants.find(
          (prevVariant) =>
            Number(currentVariant.inch) === Number(prevVariant.inch) &&
            Number(currentVariant.feet) === Number(prevVariant.feet),
        );
        return (
          prevVariant &&
          (prevVariant.price !== Number(currentVariant.price) ||
            prevVariant.quantity !== Number(currentVariant.quantity) ||
            prevVariant.msp !== Number(currentVariant.msp) ||
            prevVariant.costPrice !== Number(currentVariant.costPrice) ||
            prevVariant.description !== currentVariant.description)
        );
      });

      console.log({
        updatedVariants,
        addedVariants,
        removedVariants,
      });

      await trx
        .update(products)
        .set({
          ...(data.imageId ? { image: data.imageId } : {}),
          ...(data.title ? { title: data.title } : {}),
          ...(data.description ? { description: data.description } : {}),
        })
        .where(eq(products.id, id));

      await Promise.all(
        addedVariants.map(async (addedVariant) => {
          await trx.insert(variants).values({
            inch: Number(addedVariant.inch || ""),
            feet: Number(addedVariant.feet || ""),
            quantity: Number(addedVariant.quantity),
            price: Number(addedVariant.price),
            msp: Number(addedVariant.msp),
            costPrice: Number(addedVariant.costPrice),
            description: addedVariant.description,
            productId: id,
          });
        }),
      );

      await Promise.all(
        updatedVariants.map(async (updatedVariant) => {
          await trx
            .update(variants)
            .set({
              inch: Number(updatedVariant.inch || ""),
              feet: Number(updatedVariant.feet || ""),
              quantity: Number(updatedVariant.quantity),
              price: Number(updatedVariant.price),
              msp: Number(updatedVariant.msp),
              costPrice: Number(updatedVariant.costPrice),
              description: updatedVariant.description,
              deletedAt: sql`NULL`,
            })
            .where(
              and(
                or(
                  eq(variants.inch, Number(updatedVariant.inch)),
                  isNull(variants.inch),
                ),
                or(
                  eq(variants.feet, Number(updatedVariant.feet)),
                  isNull(variants.feet),
                ),
                eq(variants.productId, Number(id)),
              ),
            );
        }),
      );

      await Promise.all(
        removedVariants.map(async (removedVariant) => {
          await trx
            .update(variants)
            .set({
              deletedAt: sql`CURRENT_DATE`,
            })
            .where(
              and(
                or(
                  eq(variants.inch, Number(removedVariant.inch)),
                  isNull(variants.inch),
                ),
                or(
                  eq(variants.feet, Number(removedVariant.feet)),
                  isNull(variants.feet),
                ),
                eq(variants.productId, Number(id)),
              ),
            );
        }),
      );
    });

    await ProductsCache.set(await getProductsFromDBWithoutQuery());
    revalidatePath("/products");

    return { message: "Product updated successfully" };
  } catch (error) {
    console.log(error);
    return {
      error: "Error updating product",
    };
  } finally {
    await client.end();
  }
};

export const deleteProduct = async (
  id: number,
): Promise<ServerActionResponse<{ message: string }>> => {
  const { db, client } = await initializeDB();
  try {
    await db
      .update(products)
      .set({ deletedAt: sql`CURRENT_DATE` })
      .where(eq(products.id, id));
    await ProductsCache.set(await getProductsFromDBWithoutQuery());
    await ProductsCountCache.decr();
    revalidatePath("/products");
    return { message: "Product deleted successfully" };
  } catch (error) {
    return {
      error: "Error deleting product",
    };
  } finally {
    await client.end();
  }
};

export const getProductWithVariants = async (
  query: string,
  offset: number = 0,
  limit: number = 10,
): Promise<ServerActionResponse<{ data: TDBProductWithVariantsForSale[] }>> => {
  const { db, client } = await initializeDB();
  try {
    if (query.trim() === "") return { data: [] };
    const res = await db
      .select({
        id: products.id,
        title: products.title,
        image: products.image,
        variants: sql<TDBVariantsForSale[]>`
          json_agg(
            json_build_object(
              'id', ${variants.id}, 
              'price', ${variants.price}, 
              'quantity', ${variants.quantity}, 
              'inch', ${variants.inch},
              'feet', ${variants.feet},
              'costPrice', ${variants.costPrice},
              'msp', ${variants.msp}
            )
          )  
        `,
      })
      .from(products)
      .innerJoin(variants, eq(variants.productId, products.id))
      .where(
        and(
          gt(sql`SIMILARITY(title, ${query})`, 0.2),
          isNull(products.deletedAt),
          isNull(variants.deletedAt),
        ),
      )
      .groupBy(products.id)
      .orderBy(desc(sql`SIMILARITY(title, ${query})`))
      .limit(limit)
      .offset(offset);

    // console.dir(res);

    return {
      data: res,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error getting products",
    };
  } finally {
    await client.end();
  }
};

export const getProductVariants = async (
  id: string,
): Promise<ServerActionResponse<{ data: ProductSale[] }>> => {
  const { db, client } = await initializeDB();
  try {
    const res = await db
      .select({
        id: variants.id,
        inch: variants.inch,
        feet: variants.feet,
        stock: variants.quantity,
        price: variants.price,
        costPrice: variants.costPrice,
        msp: variants.msp,
        sold: sum(purchaseItems.quantity),
        revenue: sum(
          sql<number>`${purchaseItems.quantity} * ${purchaseItems.price}`,
        ),
      })
      .from(variants)
      .leftJoin(purchaseItems, eq(purchaseItems.variantId, variants.id))
      .where(eq(variants.productId, Number(id)))
      .groupBy(variants.id)
      .orderBy(asc(sql`${variants.feet}::int * 12 + ${variants.inch}`));

    return { data: res };
  } catch (error) {
    return { error: "Error getting product sale details" };
  } finally {
    await client.end();
  }
};
