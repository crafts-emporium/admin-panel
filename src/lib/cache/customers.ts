import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
enum keys {
  customersCount = "customers_count",
  customers = "customers_data",
}
const defaultTtl = 600;

export class CustomersCountCache {
  static async get(): Promise<any> {
    return await redis.get(keys.customersCount);
  }
  static async set(count: number): Promise<any> {
    return await redis.set(keys.customersCount, count, { ex: defaultTtl });
  }
  static async incr(): Promise<any> {
    return await redis.incr(keys.customersCount);
  }
  static async decr(): Promise<any> {
    return await redis.decr(keys.customersCount);
  }
}

export class CustomersCache {
  static async get(): Promise<any> {
    return await redis.get(keys.customers);
  }
  static async set(data: any): Promise<any> {
    return await redis.set(keys.customers, data, { ex: defaultTtl });
  }
}
