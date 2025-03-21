import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customers, purchases } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { initializeDB } from "@/lib/db";
import { count, desc, eq, sum } from "drizzle-orm";
import { UsersRound } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const { db, client } = await initializeDB();
  const topCustomers = await db
    .select({
      details: {
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
      },
      orders: count(purchases.id),
      revenue: sum(purchases.discountedPrice),
    })
    .from(purchases)
    .innerJoin(customers, eq(purchases.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(desc(sum(purchases.discountedPrice)))
    .limit(5);
  await client.end();
  const totalOrders = topCustomers.reduce(
    (total, current) => total + current.orders,
    0,
  );
  const totalRevenue = topCustomers.reduce(
    (total, current) => total + Number(current.revenue),
    0,
  );
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Top Customers</CardTitle>
        <UsersRound />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCustomers.map((customer, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Link href={`/customers/${customer.details.id}`}>
                    <div className="space-y-0.5 py-1.5">
                      <p className="text-base">{customer.details.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.details.phone}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell>₹{formatNumber(Number(customer.revenue))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={1}></TableCell>
              <TableCell className="text-base">
                {formatNumber(totalOrders)}
              </TableCell>
              <TableCell className="font-semibold text-base">
                ₹{formatNumber(totalRevenue)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
