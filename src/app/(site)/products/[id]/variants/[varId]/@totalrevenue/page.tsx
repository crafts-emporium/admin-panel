import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchaseItems, variants } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { initializeDB } from "@/lib/db";
import { and, eq, sql, sum } from "drizzle-orm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; varId: string }>;
}) {
  const { id, varId } = await params;
  const { db, client } = await initializeDB();
  const data = await db
    .select({
      revenue: sum(purchaseItems.discountedPrice),
    })
    .from(purchaseItems)
    .innerJoin(variants, eq(purchaseItems.variantId, variants.id))
    .where(eq(variants.id, varId));
  await client.end();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <h1 className="sm:text-4xl text-3xl font-semibold">
          ₹{formatNumber(Number(data[0].revenue))}
        </h1>
      </CardContent>
    </Card>
  );
}
