"use server";

import {
  customers,
  products,
  purchaseItems,
  purchases,
  TDBCustomer,
  variants,
} from "@/db/schema";
import { initializeDB } from "@/lib/db";
import { ServerActionResponse } from "@/lib/utils";
import { customerSchema, TCustomer } from "@/schema/customer";
import { count, desc, eq, gt, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CustomersCache, CustomersCountCache } from "@/lib/cache/customers";
import { CustomerSale, CustomerSaleItem } from "@/types/customer";

const defaultLimit = 10;

const getCustomersFromDBWithoutQuery = async (
  offset: number = 0,
  limit: number = defaultLimit,
) => {
  const { db, client } = await initializeDB();
  return await db
    .select()
    .from(customers)
    .limit(limit)
    .orderBy(desc(customers.id))
    .offset(offset * limit);
};

export const getCustomersCountFromDB = async () => {
  const { db, client } = await initializeDB();
  const res = await db.select({ count: count(customers.id) }).from(customers);
  await client.end();
  return res[0].count;
};

export const createCustomer = async (
  data: TCustomer,
): Promise<ServerActionResponse<{ data: TDBCustomer; total: number }>> => {
  const { db, client } = await initializeDB();
  try {
    // validate the data
    const { error } = customerSchema.safeParse(data);
    if (error) throw new Error(error.message);

    //insert into db
    const customer = await db
      .insert(customers)
      .values({
        name: data.name,
        phone: data.phone,
        address: data.address,
      })
      .returning();
    // check the cached customers count
    let total = await CustomersCountCache.get();
    if (!total) {
      total = await getCustomersCountFromDB();
      await CustomersCountCache.set(total);
    } else {
      //increment the count in cache
      total = await CustomersCountCache.incr();
    }

    //update the customers data cache
    await CustomersCache.set(await getCustomersFromDBWithoutQuery());
    //revalidate the path
    revalidatePath("/customers");

    return {
      data: customer[0],
      total: Number(total),
    };
  } catch (error) {
    return {
      error: "Error creating customer",
    };
  } finally {
    await client.end();
  }
};

export const updateCustomer = async (
  data: TCustomer,
  id: number,
): Promise<ServerActionResponse<{ data: TDBCustomer; total: number }>> => {
  const { db, client } = await initializeDB();
  try {
    // validate the data
    const { error } = customerSchema.safeParse(data);
    if (error) throw new Error(error.message);

    //update into db
    const customer = await db
      .update(customers)
      .set({
        name: data.name,
        phone: data.phone,
        address: data.address,
      })
      .where(eq(customers.id, id))
      .returning();

    //update the customers data cache
    await CustomersCache.set(await getCustomersFromDBWithoutQuery());

    let total = await CustomersCountCache.get();
    if (!total) {
      total = await getCustomersCountFromDB();
      await CustomersCountCache.set(total);
    }

    //revalidate the path
    revalidatePath("/customers");

    return {
      data: customer[0],
      total: Number(total),
    };
  } catch (error) {
    return {
      error: "Error updating customer",
    };
  } finally {
    await client.end();
  }
};

export const deleteCustomer = async (
  id: number,
): Promise<ServerActionResponse<{ status: boolean; total: number }>> => {
  const { db, client } = await initializeDB();
  try {
    // delete from db
    await db.delete(customers).where(eq(customers.id, id));
    let total = await CustomersCountCache.get();
    if (!total) {
      total = await getCustomersCountFromDB();
      await CustomersCountCache.set(total);
    } else {
      total = await CustomersCountCache.decr();
    }

    // update the customers data cache
    await CustomersCache.set(await getCustomersFromDBWithoutQuery());
    // revalidate the path
    revalidatePath("/customers");

    return {
      status: true,
      total: Number(total),
    };
  } catch (error) {
    return {
      error: "Error deleting customer",
    };
  } finally {
    await client.end();
  }
};

export const getCustomers = async (
  query?: string,
  offset: number = 0,
  limit: number = defaultLimit,
): Promise<ServerActionResponse<{ data: TDBCustomer[]; total: number }>> => {
  const { db, client } = await initializeDB();
  try {
    // get cached customers count
    let total = await CustomersCountCache.get();
    if (!total) {
      total = await getCustomersCountFromDB();
      await CustomersCountCache.set(Number(total));
    }
    if (query?.trim() === "") {
      // get cached customers
      const customerData =
        offset !== 0 || limit !== defaultLimit
          ? await getCustomersFromDBWithoutQuery(offset, limit)
          : await CustomersCache.get();

      // if cached customers are empty, get initial customers from db
      const customersDataDB = customerData?.length
        ? customerData
        : await getCustomersFromDBWithoutQuery();
      await CustomersCache.set(customersDataDB);

      return {
        data: customersDataDB,
        total: Number(total),
      };
    }

    // get customers from db if not cached using fuzzy search
    const customerData = await db
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
        address: customers.address,
        createdAt: customers.createdAt,
        total: sql`count(*) over()`,
      })
      .from(customers)
      .where(
        or(
          gt(sql`SIMILARITY(${customers.name}, ${query})`, 0.1),
          gt(sql`SIMILARITY(${customers.phone}, ${query})`, 0.1),
        ),
      )
      .orderBy(
        desc(sql`
          GREATEST(
            SIMILARITY(${customers.name}, ${query}),
            SIMILARITY(${customers.phone}, ${query})
          )`),
      )
      .limit(limit)
      .offset(offset * limit);

    return {
      data: customerData,
      total: Number(customerData[0]?.total),
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error getting customers",
    };
  } finally {
    await client.end();
  }
};

export const getCustomer = async (
  id: string,
): Promise<ServerActionResponse<{ data: TDBCustomer }>> => {
  const { db, client } = await initializeDB();
  try {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, Number(id)));
    return { data: customer[0] };
  } catch (error) {
    return {
      error: "Error getting customer",
    };
  } finally {
    await client.end();
  }
};

export const getCustomerSaleDetails = async (
  id: string,
): Promise<ServerActionResponse<{ data: CustomerSale[] }>> => {
  const { db, client } = await initializeDB();
  try {
    const data = await db
      .select({
        id: purchases.id,
        totalPrice: purchases.price,
        totalDiscountedPrice: purchases.discountedPrice,
        createdAt: purchases.createdAt,
        items: sql<CustomerSaleItem[]>`
      json_agg(
        json_build_object(
          'productId', ${products.id},
          'title', ${products.title},
          'image', ${products.image},
          'inch', ${variants.inch},
          'feet', ${variants.feet},
          'quantity', ${purchaseItems.quantity},
          'price', ${purchaseItems.price}
        )          
      )`,
      })
      .from(purchases)
      .innerJoin(purchaseItems, eq(purchases.id, purchaseItems.purchaseId))
      .innerJoin(variants, eq(variants.id, purchaseItems.variantId))
      .innerJoin(products, eq(products.id, variants.productId))
      .where(eq(purchases.customerId, Number(id)))
      .groupBy(purchases.id)
      .orderBy(desc(purchases.createdAt));
    return { data };
  } catch (error) {
    console.log(error);
    return {
      error: "Error getting customer sale details",
    };
  } finally {
    await client.end();
  }
};
