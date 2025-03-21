import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchases, variants } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { initializeDB } from "@/lib/db";
import { eq, sql, sum } from "drizzle-orm";
import { BadgeDollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { client, db } = await initializeDB();
  const totalInventoryWorth = await db
    .select({
      worth: sum(sql<number>`${variants.quantity} * ${variants.costPrice}`),
    })
    .from(variants);

  //   const totalInventoryAddedThisDay = await db
  //     .select({ worth: sum(sql<number>`${variants.quantity} * ${variants.costPrice}`) })
  //     .from(variants)
  //     .where(
  //       eq(
  //         sql`EXTRACT(DAY FROM ${purchases.createdAt})`,
  //         sql`EXTRACT(DAY FROM CURRENT_DATE)`,
  //       ),
  //     );

  await client.end();
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Inventory Worth</CardTitle>
        <BadgeDollarSign />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">
          ₹{formatNumber(Number(totalInventoryWorth[0].worth))}
        </h1>
        <p className="text-muted-foreground">
          {/* <span className="text-green-500">
            ₹{formatNumber(Number(totalInventoryAddedThisDay[0].worth))}
          </span>{" "}
          today */}
        </p>
      </CardContent>
    </Card>
  );
}
