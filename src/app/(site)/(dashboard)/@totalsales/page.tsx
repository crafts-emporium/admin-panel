import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchaseItems, purchases } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { initializeDB } from "@/lib/db";
import { count, eq, sql, sum } from "drizzle-orm";
import { TrendingUp } from "lucide-react";

export default async function Page() {
  const { client, db } = await initializeDB();
  const totalSalesThisMonth = await db
    .select({ saleCount: sum(purchaseItems.quantity) })
    .from(purchaseItems)
    .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
    .where(
      eq(
        sql`EXTRACT(MONTH FROM ${purchases.createdAt})`,
        sql`EXTRACT(MONTH FROM CURRENT_DATE)`,
      ),
    );

  const totalSalesThisDay = await db
    .select({ saleCount: sum(purchaseItems.quantity) })
    .from(purchaseItems)
    .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
    .where(
      eq(
        sql`EXTRACT(DAY FROM ${purchases.createdAt})`,
        sql`EXTRACT(DAY FROM CURRENT_DATE)`,
      ),
    );

  await client.end();
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Total Sales</CardTitle>
        <TrendingUp />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">
          {formatNumber(Number(totalSalesThisMonth[0].saleCount))}
        </h1>
        <p className="text-muted-foreground">
          <span className="text-green-500">
            {formatNumber(Number(totalSalesThisDay[0].saleCount))}
          </span>{" "}
          today
        </p>
      </CardContent>
    </Card>
  );
}
