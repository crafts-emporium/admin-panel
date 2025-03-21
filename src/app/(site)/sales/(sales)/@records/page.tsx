import { Button } from "@/components/ui/button";
import { Info, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { getSales } from "@/actions/sale";
import { isActionError } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { formatNumber } from "@/functions/format-number";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const query = (params.query || "") as string;

  const res = await getSales(query, 10, 10 * (page - 1));
  if (isActionError(res)) {
    return <p>{res.error}</p>;
  }

  const { data: sales, total: total_records } = res;

  // console.log(sales);

  const prev_page = page > 1 ? page - 1 : 1;

  const next_page =
    (page < Math.ceil(total_records / 10)
      ? page + 1
      : Math.ceil(total_records / 10)) || 1;

  const record_count_start = (page - 1) * 10 + (sales.length ? 1 : 0);
  const record_count_end = Math.min(page * 10, total_records);

  const next_page_url = `/sales?${new URLSearchParams({
    ...(params || {}),
    page: next_page.toString(),
  }).toString()}`;

  const prev_page_url = `/sales?${new URLSearchParams({
    ...(params || {}),
    page: prev_page.toString(),
  }).toString()}`;

  return (
    <Card className="overflow-hidden @container">
      <CardContent className="px-0">
        <Table className="border-b">
          <TableHeader>
            <TableRow>
              <TableHead className="p-5 whitespace-nowrap">Sale Id</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Discounted Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="px-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="p-5">{sale.id}</TableCell>
                <TableCell>
                  <Link
                    href={
                      sale.customer?.id ? `/customers/${sale.customer?.id}` : ""
                    }
                  >
                    {sale.customer?.name}
                  </Link>
                </TableCell>
                <TableCell>₹{formatNumber(sale.totalPrice)}</TableCell>
                <TableCell>
                  ₹{formatNumber(sale.totalDiscountedPrice)}
                </TableCell>
                <TableCell>
                  {sale.createdAt && format(new Date(sale.createdAt), "PPP")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={"outline"} className="px-3">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/sales/${sale.id}`}>
                        <DropdownMenuItem>
                          <Info className="mr-2 h-4 w-4" />
                          <span>Info</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
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
  );
}
