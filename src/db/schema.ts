import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 40 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  address: text("address"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  deletedAt: date("deleted_at").default(sql`NULL`),
  image: text("image"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const variants = pgTable("variants", {
  id: varchar("id", { length: 30 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  size: smallint("size").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  deletedAt: timestamp("deleted_at").default(sql`NULL`),
});

export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  variantId: varchar("variant_id", { length: 30 }).references(
    () => variants.id,
  ),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"),
  price: integer("price").notNull(),
  discountedPrice: integer("discounted_price").notNull(),
  deletedAt: timestamp("deleted_at").default(sql`NULL`),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type TDBCustomer = typeof customers.$inferSelect;
export type TDBProduct = typeof products.$inferSelect;
export type TDBVariant = typeof variants.$inferSelect;
export type TDBPurchase = typeof purchases.$inferSelect;
