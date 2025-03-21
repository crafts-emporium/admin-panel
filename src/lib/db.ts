import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export const initializeDB = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const db = drizzle(client);

  return { db, client };
};
