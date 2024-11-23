import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
enum keys {
  productsCount = "products_count",
  products = "products_data",
}
const defaultTtl = 600;

export class ProductsCountCache {
  static async get(): Promise<any> {
    return await redis.get(keys.productsCount);
  }
  static async set(count: number): Promise<any> {
    return await redis.set(keys.productsCount, count, { ex: defaultTtl });
  }
  static async incr(): Promise<any> {
    return await redis.incr(keys.productsCount);
  }
  static async decr(): Promise<any> {
    return await redis.decr(keys.productsCount);
  }
}

export class ProductsCache {
  static async get(): Promise<any> {
    return await redis.get(keys.products);
  }
  static async set(data: any): Promise<any> {
    return await redis.set(keys.products, data, { ex: defaultTtl });
  }
}
