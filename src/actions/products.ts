"use server";

import { products, TDBProduct, TDBVariant, variants } from "@/db/schema";
import { db } from "@/lib/db";
import { ServerActionResponse } from "@/lib/utils";
import { productSchema, TProduct } from "@/schema/products";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Redis } from "@upstash/redis";
import { desc, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type TProductWithVariants = TDBProduct & {
  variants: Omit<TDBVariant, "productId">[];
};

const client = new S3Client({
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_ACCESS_KEY,
  },
});

const redis = Redis.fromEnv();
const defaultLimit = 10;

const incrementCachedProductsCount = async () => {
  return await redis.incr("products");
};

const decrementCachedProductsCount = async () => {
  await redis.decr("products");
};

const getCachedProductsCount = async () => {
  return Number(await redis.get("products"));
};

const getCachedProducts = async () => {
  const products = await redis.get("products_data");
  return (products as (TDBProduct & { variants: TDBVariant[] })[]) || [];
};

const setCachedProducts = async (data: TProductWithVariants[]) => {
  await redis.set("products_data", data);
};

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
      isDeleted: products.isDeleted,
      variants: sql<Omit<TDBVariant, "productId">[]>`json_agg(
        json_build_object(
          'id', ${variants.id}, 
          'price', ${variants.price}, 
          'quantity', ${variants.quantity}, 
          'size', ${variants.size}, 
          'isDeleted', ${variants.isDeleted}
        )
      )`,
    })
    .from(products)
    .innerJoin(variants, eq(variants.productId, products.id))
    .groupBy(products.id)
    .limit(limit)
    .offset(offset * limit);
};

export const getPreSignedMediaUrl = async (
  key: string,
  contentType: string,
): Promise<ServerActionResponse<{ url: string }>> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const preSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 600,
    });

    return { url: preSignedUrl };
  } catch (error) {
    return { error: "Error generating pre-signed URL" };
  }
};

export const getSignedMediaUrl = async (
  key: string,
): Promise<ServerActionResponse<{ url: string }>> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    });

    const preSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 600,
    });

    return { url: preSignedUrl };
  } catch (error) {
    return { error: "Error generating signed URL" };
  }
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
    await setCachedProducts(await getProductsFromDBWithoutQuery());
    // revalidate the path
    revalidatePath("/products");
    // increment the count in cache
    await incrementCachedProductsCount();

    return {
      data: res.data,
      total: (await getCachedProductsCount()) || 0,
    };
  } catch (error) {
    console.log(error);
    return { error: "Error creating product" };
  }
};

export const getProducts = async (
  title?: string,
  offset: number = 0,
  limit: number = defaultLimit,
): Promise<
  ServerActionResponse<{
    data: TProductWithVariants[];
    total: number;
  }>
> => {
  try {
    // get cached products count
    const total = await getCachedProductsCount();
    if (title?.trim() === "") {
      // get cached products
      const productsData =
        offset !== 0 || limit !== defaultLimit
          ? await getProductsFromDBWithoutQuery(offset, limit)
          : await getCachedProducts();

      // if  products are empty, get initial products from db
      const productsDataDB = productsData.length
        ? productsData
        : await getProductsFromDBWithoutQuery();
      return {
        data: productsDataDB,
        total: Number(total),
      };
    }

    // get products from db if not cached using fuzzy search
    const productsData = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        image: products.image,
        isDeleted: products.isDeleted,
        variants: sql<Omit<TDBVariant, "productId">[]>`json_agg(
            json_build_object(
              'id', ${variants.id}, 
              'price', ${variants.price}, 
              'quantity', ${variants.quantity}, 
              'size', ${variants.size}, 
              'isDeleted', ${variants.isDeleted}
            )
          )`,
      })
      .from(products)
      .innerJoin(variants, eq(variants.productId, products.id))
      .where(gt(sql`SIMILARITY(title, ${title})`, 0.3))
      .orderBy(desc(sql`SIMILARITY(title, ${title})`))
      .groupBy(products.id)
      .limit(limit)
      .offset(offset * limit);

    return {
      data: productsData,
      total: Number(total),
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error getting products",
    };
  }
};
