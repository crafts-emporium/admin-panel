import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchases } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { db } from "@/lib/db";
import { eq, sql, sum } from "drizzle-orm";
import { BadgeDollarSign } from "lucide-react";

export default async function Page() {
  const totalRevenueThisMonth = await db
    .select({ purchases: sum(purchases.discountedPrice) })
    .from(purchases)
    .where(
      eq(
        sql`EXTRACT(MONTH FROM ${purchases.createdAt})`,
        sql`EXTRACT(MONTH FROM CURRENT_DATE)`,
      ),
    );
  const totalRevenueThisDay = await db
    .select({ purchases: sum(purchases.discountedPrice) })
    .from(purchases)
    .where(
      eq(
        sql`EXTRACT(DAY FROM ${purchases.createdAt})`,
        sql`EXTRACT(DAY FROM CURRENT_DATE)`,
      ),
    );

  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Total Revenue</CardTitle>
        <BadgeDollarSign />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">
          ₹{formatNumber(Number(totalRevenueThisMonth[0].purchases))}
        </h1>
        <p className="text-muted-foreground">
          <span className="text-green-500">
            ₹{formatNumber(Number(totalRevenueThisDay[0].purchases))}
          </span>{" "}
          today
        </p>
      </CardContent>
    </Card>
  );
}
