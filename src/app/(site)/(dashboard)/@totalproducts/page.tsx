import { getProductsCountFromDB } from "@/actions/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { products } from "@/db/schema";
import { ProductsCountCache } from "@/lib/cache/products";
import { db } from "@/lib/db";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { Amphora } from "lucide-react";

export default async function Page() {
  let totalProducts = await ProductsCountCache.get();
  if (!totalProducts) {
    totalProducts = await getProductsCountFromDB();
    await ProductsCountCache.set(totalProducts);
  }
  const newProductsThisMonth = await db
    .select({ count: count(products.id) })
    .from(products)
    .where(
      and(
        eq(
          sql`EXTRACT(MONTH FROM ${products.createdAt})`,
          sql`EXTRACT(MONTH FROM CURRENT_DATE)`,
        ),
        isNull(products.deletedAt),
      ),
    );

  return (
    <Card>
      <CardHeader className="font-semibold flex-row space-y-0 justify-between items-center">
        <CardTitle>Total Products</CardTitle>
        <Amphora />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">{totalProducts}</h1>
        <p className="text-muted-foreground">
          <span className="text-green-500">
            +{newProductsThisMonth[0].count}
          </span>{" "}
          new products
        </p>
      </CardContent>
    </Card>
  );
}
