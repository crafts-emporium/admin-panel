import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchaseItems, variants } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { initializeDB } from "@/lib/db";
import { eq, sum } from "drizzle-orm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db, client } = await initializeDB();
  const data = await db
    .select({ count: sum(purchaseItems.quantity) })
    .from(purchaseItems)
    .innerJoin(variants, eq(variants.id, purchaseItems.variantId))
    .where(eq(variants.productId, Number(id)));
  await client.end();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Sold</CardTitle>
      </CardHeader>
      <CardContent>
        <h1 className="sm:text-4xl text-3xl font-semibold">
          {formatNumber(Number(data[0].count))}
        </h1>
      </CardContent>
    </Card>
  );
}
