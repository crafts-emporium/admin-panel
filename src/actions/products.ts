"use server";

import {
  products,
  purchaseItems,
  TDBProduct,
  TDBVariant,
  variants,
} from "@/db/schema";
import { ProductsCache, ProductsCountCache } from "@/lib/cache/products";
import { db } from "@/lib/db";
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
  TDBVariantWithProduct,
} from "@/types/product";

const defaultLimit = 10;

const getProductsFromDBWithoutQuery = async (
  offset: number = 0,
  limit: number = defaultLimit,
) => {
  return await db
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
          'size', ${variants.size}, 
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
};

export const getProductsCountFromDB = async () => {
  return (
    await db
      .select({ count: count(products.id) })
      .from(products)
      .where(isNull(products.deletedAt))
  )[0].count;
};

export const createProduct = async (
  data: TProduct,
): Promise<
  ServerActionResponse<{
    data: TDBProduct & { variants: TDBVariant[] };
    total: number;
  }>
> => {
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
                size: Number(variant.size),
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
              'size', ${variants.size}, 
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
  }
};

export const getProduct = async (
  id: string,
): Promise<ServerActionResponse<{ data: TDBProductWithVariants }>> => {
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
              'size', ${variants.size}, 
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
  }
};

export const updateProduct = async ({
  data,
  id,
}: {
  data: Partial<TProduct>;
  id: number;
}): Promise<ServerActionResponse<{ message: string }>> => {
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
              Number(currentVariant.size) === prevVariant.size,
          ),
      );
      const addedVariants = currentVariants.filter(
        (currentVariant) =>
          !prevVariants.some(
            (prevVariant) => prevVariant.size === Number(currentVariant.size),
          ),
      );

      const updatedVariants = currentVariants.filter((currentVariant) => {
        const prevVariant = prevVariants.find(
          (prevVariant) => prevVariant.size === Number(currentVariant.size),
        );
        return (
          prevVariant &&
          (prevVariant.price !== Number(currentVariant.price) ||
            prevVariant.quantity !== Number(currentVariant.quantity))
        );
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
            size: Number(addedVariant.size),
            quantity: Number(addedVariant.quantity),
            price: Number(addedVariant.price),
            productId: id,
          });
        }),
      );

      await Promise.all(
        updatedVariants.map(async (updatedVariant) => {
          await trx.update(variants).set({
            size: Number(updatedVariant.size),
            quantity: Number(updatedVariant.quantity),
            price: Number(updatedVariant.price),
          });
        }),
      );

      await Promise.all(
        removedVariants.map(async (removedVariant) => {
          await trx
            .update(variants)
            .set({
              deletedAt: sql`CURRENT_DATE`,
            })
            .where(eq(variants.id, removedVariant.id));
        }),
      );
    });

    await ProductsCache.set(await getProductsFromDBWithoutQuery());
    revalidatePath("/products");

    return { message: "Product updated successfully" };
  } catch (error) {
    return {
      error: "Error updating product",
    };
  }
};

export const deleteProduct = async (
  id: number,
): Promise<ServerActionResponse<{ message: string }>> => {
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
  }
};

export const getVariantsWithproductInfo = async (
  query: string,
  offset: number = 0,
  limit: number = 10,
): Promise<ServerActionResponse<{ data: TDBVariantWithProduct[] }>> => {
  try {
    if (query.trim() === "") return { data: [] };
    const res = await db
      .select({
        id: variants.id,
        productId: products.id,
        title: products.title,
        size: variants.size,
        price: variants.price,
        quantity: variants.quantity,
        image: products.image,
      })
      .from(products)
      .innerJoin(variants, eq(variants.productId, products.id))
      .where(
        and(
          or(
            gt(sql`SIMILARITY(title, ${query})`, 0.3),
            gt(sql`SIMILARITY(size::TEXT, ${query})`, 0.3),
          ),
          isNull(products.deletedAt),
          isNull(variants.deletedAt),
        ),
      )
      .groupBy(products.id, variants.id)
      .orderBy(
        desc(sql`
          GREATEST(
            SIMILARITY(title, ${query}),
            SIMILARITY(size::TEXT, ${query})
          )
        `),
      )
      .limit(limit)
      .offset(offset);

    // console.log(res);

    return {
      data: res,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error getting products",
    };
  }
};

export const getProductVariants = async (
  id: string,
): Promise<ServerActionResponse<{ data: ProductSale[] }>> => {
  try {
    const res = await db
      .select({
        id: variants.id,
        size: variants.size,
        stock: variants.quantity,
        price: variants.price,
        sold: sum(purchaseItems.quantity),
        revenue: sum(
          sql<number>`${purchaseItems.quantity} * ${purchaseItems.price}`,
        ),
      })
      .from(variants)
      .leftJoin(purchaseItems, eq(purchaseItems.variantId, variants.id))
      .where(eq(variants.productId, Number(id)))
      .groupBy(variants.id)
      .orderBy(asc(variants.size));

    return { data: res };
  } catch (error) {
    return { error: "Error getting product sale details" };
  }
};
