import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { variants } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { initializeDB } from "@/lib/db";
import { and, eq, sum } from "drizzle-orm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; size: string }>;
}) {
  const { id, size } = await params;
  const { db, client } = await initializeDB();
  const data = await db
    .select({
      count: sum(variants.quantity),
    })
    .from(variants)
    .where(
      and(eq(variants.productId, Number(id)), eq(variants.size, Number(size))),
    );
  await client.end();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Count</CardTitle>
      </CardHeader>
      <CardContent>
        <h1 className="sm:text-4xl text-3xl font-semibold">
          {formatNumber(Number(data[0].count))}
        </h1>
      </CardContent>
    </Card>
  );
}
