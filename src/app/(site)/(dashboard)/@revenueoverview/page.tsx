import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign } from "lucide-react";
import { ChartData, RevenueChart } from "./_components/bar-chart";
import { subDays } from "date-fns";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

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

  const revenueData = await db.execute(
    sql<{ date: string; revenue: number }[]>`
      WITH date_series AS (
        SELECT generate_series(
          ${startDateFormattedToTimezone}::DATE, 
          ${endDateFormattedToTimezone}::DATE, 
          '1 day'::INTERVAL
        ) AS day
      )
      SELECT 
        ds.day AS date,
        COALESCE(SUM(p.discounted_price), 0) AS revenue
      FROM date_series ds
      LEFT JOIN purchases p ON EXTRACT(DAY FROM p.created_at) = EXTRACT(DAY FROM ds.day)
      GROUP BY ds.day
      ORDER BY ds.day;
    `,
  );

  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Revenue Overview</CardTitle>
        <BadgeDollarSign />
      </CardHeader>
      <CardContent>
        <RevenueChart data={revenueData.rows as ChartData[]} />
      </CardContent>
    </Card>
  );
}