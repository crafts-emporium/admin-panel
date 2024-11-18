import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SearchInput from "./_components/search-input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomers } from "@/actions/customer";
import { isActionError } from "@/lib/utils";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = Number(params.page || "1");
  const query = (params.query || "") as string;

  const res = await getCustomers(query, page - 1);
  if (isActionError(res)) {
    return <p>{res.error}</p>;
  }

  const { data: customers, total: total_records } = res;

  const prev_page = page > 1 ? page - 1 : 1;
  const next_page =
    page < Math.ceil(total_records / 10)
      ? page + 1
      : Math.ceil(total_records / 10);

  const record_count_start = (page - 1) * 10 + (customers.length ? 1 : 0);
  const record_count_end = Math.min(page * 10, total_records);

  const next_page_url = `/customers?${new URLSearchParams({
    ...(params || {}),
    page: next_page.toString(),
  }).toString()}`;

  const prev_page_url = `/customers?${new URLSearchParams({
    ...(params || {}),
    page: prev_page.toString(),
  }).toString()}`;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <PageHeader>
          <PageTitle>Customers</PageTitle>
          <PageDescription>View and manage your customers</PageDescription>
        </PageHeader>
        <Link href={"/customers/add"}>
          <Button className="px-3">
            <Plus />
            <span className="sm:inline hidden">Add Customer</span>
          </Button>
        </Link>
      </header>
      <div>
        <Suspense>
          <SearchInput />
        </Suspense>
      </div>
      <Card>
        <CardContent className="px-0">
          <Table className="border-b">
            <TableHeader>
              <TableRow>
                <TableHead className="p-5">Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="p-4 whitespace-nowrap">
                    {customer.name}
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2">
          <p className="w-full">
            {record_count_start} to {record_count_end} of&nbsp;
            <span className="font-semibold">{total_records}</span> entries
          </p>
          <Link href={prev_page_url}>
            <Button variant={"secondary"} className="h-8 px-3">
              Prev
            </Button>
          </Link>
          <Link href={next_page_url}>
            <Button className="h-8 px-3">Next</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
