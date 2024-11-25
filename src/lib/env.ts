import * as z from "zod";

const env = z.object({
  DATABASE_URL: z.string(),
  NEXT_PUBLIC_CLOUDFLARE_BUCKET_NAME: z.string(),
  NEXT_PUBLIC_CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  NEXT_PUBLIC_CLOUDFLARE_ACCESS_KEY: z.string(),
  NEXT_PUBLIC_CLOUDFLARE_ENDPOINT: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
});

env.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof env> {}
  }
}
