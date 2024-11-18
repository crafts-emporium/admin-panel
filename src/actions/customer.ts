"use server";

import { customers, TDBCustomer } from "@/db/schema";
import { db } from "@/lib/db";
import { ServerActionResponse } from "@/lib/utils";
import { customerSchema, TCustomer } from "@/schema/customer";
import { asc, desc, eq, gt, sql } from "drizzle-orm";
import { Redis } from "@upstash/redis";
import { revalidatePath } from "next/cache";

const redis = Redis.fromEnv();
const defaultLimit = 10;

const getCachedCustomersCount = async () => {
  const total = await redis.get("customers");
  return Number(total || 0);
};

const incrementCachedCustomersCount = async () => {
  return await redis.incr("customers");
};

const decrementCachedCustomersCount = async () => {
  await redis.decr("customers");
};

const getCachedCustomers = async () => {
  const customers = await redis.get("customers_data");
  return (customers as TDBCustomer[]) || [];
};

const setCachedCustomers = async (data: any) => {
  try {
    await redis.set("customers_data", data);
  } catch (error) {}
};

const getCustomersFromDBWithoutQuery = async (
  offset: number = 0,
  limit: number = defaultLimit,
) => {
  return await db
    .select()
    .from(customers)
    .limit(limit)
    .orderBy(asc(customers.id))
    .offset(offset * limit);
};

export const createCustomer = async (
  data: TCustomer,
): Promise<ServerActionResponse<{ data: TDBCustomer; total: number }>> => {
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
    //increment the count in cache
    const total = await incrementCachedCustomersCount();

    //update the customers data cache
    await setCachedCustomers(await getCustomersFromDBWithoutQuery());
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
  }
};

export const updateCustomer = async (
  data: TCustomer,
  id: number,
): Promise<ServerActionResponse<{ data: TDBCustomer; total: number }>> => {
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
    await setCachedCustomers(await getCustomersFromDBWithoutQuery());

    const total = await getCachedCustomersCount();

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
  }
};

export const deleteCustomer = async (
  id: number,
): Promise<ServerActionResponse<{ status: boolean; total: number }>> => {
  try {
    // delete from db
    await db.delete(customers).where(eq(customers.id, id));
    // decrement the count in cache
    const total = await decrementCachedCustomersCount();
    // update the customers data cache
    await setCachedCustomers(await getCustomersFromDBWithoutQuery());
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
  }
};

export const getCustomers = async (
  name?: string,
  offset: number = 0,
  limit: number = defaultLimit,
): Promise<ServerActionResponse<{ data: TDBCustomer[]; total: number }>> => {
  try {
    // get cached customers count
    const total = await getCachedCustomersCount();
    if (name?.trim() === "") {
      // get cached customers
      const customerData =
        offset !== 0 || limit !== defaultLimit
          ? await getCustomersFromDBWithoutQuery(offset, limit)
          : await getCachedCustomers();

      // if cached customers are empty, get initial customers from db
      const customersDataDB = customerData.length
        ? customerData
        : await getCustomersFromDBWithoutQuery();
      return {
        data: customersDataDB,
        total: Number(total),
      };
    }

    // get customers from db if not cached using fuzzy search
    const customerData = await db
      .select()
      .from(customers)
      .where(gt(sql`SIMILARITY(name, ${name})`, 0.3))
      .orderBy(desc(sql`SIMILARITY(name, ${name})`))
      .limit(limit)
      .offset(offset * limit);

    return {
      data: customerData,
      total: Number(total),
    };
  } catch (error) {
    return {
      error: "Error getting customers",
    };
  }
};
