import {
  boolean,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 40 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  address: text("address"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  isDeleted: boolean("is_deleted").default(false),
  image: text("image"),
});

export const variants = pgTable("variants", {
  id: varchar("id", { length: 30 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  size: smallint("size").notNull(),
  isDeleted: boolean("is_deleted").default(false),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"),
  variantId: integer("variant_id"),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export type TDBCustomer = typeof customers.$inferSelect;
export type TDBProduct = typeof products.$inferSelect;
export type TDBVariant = typeof variants.$inferSelect;
export type TDBPurchase = typeof purchases.$inferSelect;
