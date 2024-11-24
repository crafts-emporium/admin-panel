import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { variants } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { initializeDB } from "@/lib/db";
import { eq, sql, sum } from "drizzle-orm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db, client } = await initializeDB();
  const data = await db
    .select({
      worth: sum(sql<number>`${variants.quantity} * ${variants.price}`),
    })
    .from(variants)
    .where(eq(variants.productId, Number(id)));
  await client.end();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Worth</CardTitle>
      </CardHeader>
      <CardContent>
        <h1 className="sm:text-4xl text-3xl font-semibold">
          ₹{formatNumber(Number(data[0]?.worth))}
        </h1>
      </CardContent>
    </Card>
  );
}
