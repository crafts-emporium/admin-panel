import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ChartData, RevenueChart } from "./_components/bar-chart";
import { initializeDB } from "@/lib/db";
import { sql } from "drizzle-orm";
import { format, subDays } from "date-fns";

export default async function Page() {
  const statDate = subDays(new Date(), 6);
  const endDate = new Date();

  const startDateFormattedToTimezone = new Date(statDate).toLocaleDateString(
    "en-US",
    { timeZone: "Asia/Kolkata" },
  );

  const endDateFormattedToTimezone = new Date(endDate).toLocaleDateString(
    "en-US",
    { timeZone: "Asia/Kolkata" },
  );

  const { db, client } = await initializeDB();
  const res = await db.execute(
    sql<{ date: string; quantity: string }[]>`
      WITH date_series AS (
        SELECT generate_series(
          ${startDateFormattedToTimezone}::DATE,
          ${endDateFormattedToTimezone}::DATE,
          '1 day'::INTERVAL
        ) as day
      )
      SELECT 
        ds.day as date,
        COALESCE(SUM(pi.quantity),0) as quantity
      FROM date_series ds
      LEFT JOIN purchases p ON ds.day = DATE_TRUNC('day', p.created_at)
      LEFT JOIN purchase_items pi ON pi.purchase_id = p.id
      GROUP BY ds.day
      ORDER BY ds.day;  
    `,
  );

  await client.end();

  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Sales Overview</CardTitle>
        <TrendingUp />
      </CardHeader>
      <CardContent>
        <RevenueChart data={res.rows as ChartData[]} />
      </CardContent>
    </Card>
  );
}
