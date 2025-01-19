import { getCustomersCountFromDB } from "@/actions/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customers } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
// import { CustomersCountCache } from "@/lib/cache/customers";
import { initializeDB } from "@/lib/db";
import { count, eq, sql } from "drizzle-orm";
import { UsersRound } from "lucide-react";

export default async function Page() {
  const { client, db } = await initializeDB();
  // let customersCount = await CustomersCountCache.get();
  // if (!customersCount) {
  //   customersCount = await getCustomersCountFromDB();
  //   await CustomersCountCache.set(customersCount);
  // }

  const customersCount = await db
    .select({ count: count(customers.id) })
    .from(customers);

  const newCustomersToday = await db
    .select({ count: count(customers.id) })
    .from(customers)
    .where(
      eq(
        sql`EXTRACT(DAY FROM ${customers.createdAt})`,
        sql`EXTRACT(DAY FROM CURRENT_DATE)`,
      ),
    );
  await client.end();
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Total Customers</CardTitle>
        <UsersRound />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">
          {formatNumber(customersCount[0].count)}
        </h1>
        <p>
          <span className="text-green-500">
            +{formatNumber(newCustomersToday[0].count)}
          </span>{" "}
          new customers
        </p>
      </CardContent>
    </Card>
  );
}
