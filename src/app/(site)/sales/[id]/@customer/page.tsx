import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";
import { customers, purchases } from "@/db/schema";
import { initializeDB } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db, client } = await initializeDB();
  const customer = await db
    .selectDistinct({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
    })
    .from(purchases)
    .leftJoin(customers, eq(purchases.customerId, customers.id))
    .where(eq(purchases.id, Number(id)));
  await client.end();

  return (
    <header>
      <Link href={`/customers/${customer[0]?.id}`}>
        <PageHeader>
          <PageTitle>{customer[0]?.name}</PageTitle>
          <PageDescription>{customer[0]?.phone}</PageDescription>
        </PageHeader>
      </Link>
    </header>
  );
}
