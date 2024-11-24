import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchaseItems, purchases, variants } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { db } from "@/lib/db";
import { and, count, eq, sql } from "drizzle-orm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; size: string }>;
}) {
  const { id, size } = await params;
  const data = await db
    .select({ count: count(sql`DISTINCT ${purchases.customerId}`) })
    .from(purchaseItems)
    .innerJoin(variants, eq(purchaseItems.variantId, variants.id))
    .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
    .where(
      and(eq(variants.productId, Number(id)), eq(variants.size, Number(size))),
    );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <h1 className="sm:text-4xl text-3xl font-semibold">
          {formatNumber(Number(data[0].count))}
        </h1>
      </CardContent>
    </Card>
  );
}
