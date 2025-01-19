// import { TDBSale } from "@/types/sale";
// import { Redis } from "@upstash/redis";

// const redis = Redis.fromEnv();
// enum Keys {
//   salesCount = "sales_count",
//   sales = "sales_data",
// }
// const defaultTtl = 600;

// export class SalesCountCache {
//   static async get(): Promise<any> {
//     return await redis.get(Keys.salesCount);
//   }

//   static async set(count: number): Promise<any> {
//     return await redis.set(Keys.salesCount, count, { ex: defaultTtl });
//   }

//   static async incr(): Promise<any> {
//     return await redis.incr(Keys.salesCount);
//   }

//   static async decr(): Promise<any> {
//     return await redis.decr(Keys.salesCount);
//   }
// }

// export class SalesCache {
//   static async set(data: any): Promise<TDBSale[]> {
//     return await redis.set(Keys.sales, data, { ex: defaultTtl });
//   }

//   static async get(): Promise<TDBSale[] | null> {
//     return (await redis.get(Keys.sales)) as TDBSale[];
//   }
// }
