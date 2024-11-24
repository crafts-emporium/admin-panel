"use server";

import { customers, purchaseItems, purchases, variants } from "@/db/schema";
import { SalesCache, SalesCountCache } from "@/lib/cache/sales";
import { initializeDB } from "@/lib/db";
import { ServerActionResponse } from "@/lib/utils";
import { saleSchema, TSale } from "@/schema/sale";
import { TDBSale } from "@/types/sale";
import { and, count, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const defaultLimit = 10;

async function getSalesFromDBWithoutQuery(
  limit: number = defaultLimit,
  offset: number = 0,
): Promise<TDBSale[]> {
  const { db, client } = await initializeDB();
  const res = await db
    .select({
      id: purchases.id,
      customer: {
        id: customers.id,
        name: customers.name,
      },
      totalPrice: purchases.price,
      totalDiscountedPrice: purchases.discountedPrice,
      createdAt: purchases.createdAt,
    })
    .from(purchases)
    .leftJoin(customers, eq(purchases.customerId, customers.id))
    .orderBy(desc(purchases.id))
    .limit(limit)
    .offset(offset);
  await client.end();
  return res;
}

async function getSalesCountFromDB() {
  const { db, client } = await initializeDB();
  const res = await db.select({ total: count(purchases.id) }).from(purchases);
  await client.end();
  return res[0]?.total;
}

export async function createSale(
  e: TSale,
): Promise<ServerActionResponse<{ message: string }>> {
  const { db, client } = await initializeDB();
  try {
    const { success } = saleSchema.safeParse(e);
    if (!success) return { error: "Invalid data" };

    console.dir(e);

    await db.transaction(async (trx) => {
      //insert purchase data
      const purchase = await trx
        .insert(purchases)
        .values({
          price: Number(e.totalPrice),
          discountedPrice: Number(e.totalDiscountedPrice || e.totalPrice),
          ...(e.customerId ? { customerId: Number(e.customerId) } : {}),
        })
        .returning();

      //reduce the quantity of the variants after checking if there is enough in stock
      await Promise.all(
        e.saleItems.map(async (item) => {
          const variant = await trx
            .select({ quantity: variants.quantity })
            .from(variants)
            .where(eq(variants.id, item.variantId));

          if (variant[0].quantity < Number(item.quantity)) {
            throw new Error("Out of stock", { cause: variant[0] });
          }

          await trx
            .update(variants)
            .set({ quantity: variant[0].quantity - Number(item.quantity) })
            .where(eq(variants.id, item.variantId));
        }),
      );
      // console.log(purchase);

      //insert purchase items
      await Promise.all(
        e.saleItems.map(async (item) => {
          await trx.insert(purchaseItems).values({
            price: Number(item.price),
            quantity: Number(item.quantity),
            purchaseId: purchase[0].id,
            variantId: item.variantId,
          });
        }),
      );

      //   return purchase[0];
    });

    //update the sales data cache
    await SalesCache.set(await getSalesFromDBWithoutQuery(10, 0));
    //update the sales count cache
    await SalesCountCache.set(await getSalesCountFromDB());

    // revalidate the path
    revalidatePath("/sales");
    return {
      message: "Sale created successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Something went wrong",
    };
  } finally {
    await client.end();
  }
}

export async function getSales(
  query: string = "",
  limit: number = defaultLimit,
  offset: number = 0,
): Promise<ServerActionResponse<{ data: TDBSale[]; total: number }>> {
  const { db, client } = await initializeDB();
  try {
    let total = await SalesCountCache.get();
    if (!total) {
      total = await getSalesCountFromDB();
      await SalesCountCache.set(total);
    }
    if (query.trim() === "") {
      if (offset !== 0 || limit !== defaultLimit) {
        return {
          data: await getSalesFromDBWithoutQuery(limit, offset),
          total: Number(total),
        };
      }

      const cachedSales = await SalesCache.get();
      const salesData = cachedSales?.length
        ? cachedSales
        : await getSalesFromDBWithoutQuery();

      !cachedSales && (await SalesCache.set(salesData));

      return {
        data: salesData,
        total: Number(total),
      };
    }

    const salesData = await db
      .select({
        id: purchases.id,
        customer: {
          id: customers.id,
          name: customers.name,
        },
        totalPrice: purchases.price,
        totalDiscountedPrice: purchases.discountedPrice,
        createdAt: purchases.createdAt,
        total: sql<number>`count(*) over()`,
      })
      .from(purchases)
      .leftJoin(customers, eq(purchases.customerId, customers.id))
      .where(
        and(
          or(
            gt(sql`SIMILARITY(${purchases.id}::TEXT, ${query})`, 0),
            gt(sql`SIMILARITY(${customers.name}, ${query})`, 0),
          ),
          isNull(purchases.deletedAt),
        ),
      )
      .orderBy(
        sql`
            GREATEST(
                SIMILARITY(${purchases.id}::TEXT, ${query}),
                SIMILARITY(${customers.name}, ${query})
            )
        `,
      )
      .groupBy(purchases.id, customers.id)
      .limit(limit)
      .offset(offset);

    return {
      data: salesData,
      total: Number(total[0]?.total),
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Something went wrong",
    };
  } finally {
    await client.end();
  }
}
