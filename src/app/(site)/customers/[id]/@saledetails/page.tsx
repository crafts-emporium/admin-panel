import { getCustomerSaleDetails } from "@/actions/customer";
import AdvancedImage from "@/components/custom/advanced-image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/functions/format-number";
import { isActionError } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resp = await getCustomerSaleDetails(id as string);

  if (isActionError(resp))
    return <p className="text-destructive">{resp.error}</p>;

  const totalPrice = resp.data.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalDiscountedPrice = resp.data.reduce(
    (acc, curr) => acc + curr.totalDiscountedPrice,
    0,
  );

  const totalItems = resp.data.reduce((acc, curr) => {
    return acc + curr.items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, 0);

  return (
    <Card>
      <CardContent className="rounded-xl overflow-hidden border p-0">
        <Table>
          <TableHeader className="border-b">
            <TableRow className="border-none hover:bg-background">
              <TableHead rowSpan={2} className="whitespace-nowrap p-5">
                Sale Id
              </TableHead>
              <TableHead rowSpan={2} className="whitespace-nowrap">
                Total Price
              </TableHead>
              <TableHead rowSpan={2} className="whitespace-nowrap">
                Discounted Price
              </TableHead>
              <TableHead rowSpan={2} className="whitespace-nowrap border-r">
                Date
              </TableHead>
              <TableHead colSpan={3} className="text-center px-5 border-b">
                Items
              </TableHead>
            </TableRow>
            <TableRow className="hover:bg-background">
              {/* <TableHead colSpan={4} className="border-r"></TableHead> */}
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resp.data.map((sale, saleIdx) =>
              sale.items.map((item, itemIdx) => (
                <TableRow key={`${saleIdx}-${itemIdx}`}>
                  {itemIdx === 0 && (
                    <TableCell
                      rowSpan={sale.items.length || 1}
                      className="px-4"
                    >
                      {sale.id}
                    </TableCell>
                  )}
                  {itemIdx === 0 && (
                    <TableCell rowSpan={sale.items.length || 1}>
                      ₹{formatNumber(sale.totalPrice)}
                    </TableCell>
                  )}
                  {itemIdx === 0 && (
                    <TableCell rowSpan={sale.items.length || 1}>
                      ₹{formatNumber(sale.totalDiscountedPrice)}
                    </TableCell>
                  )}
                  {itemIdx === 0 && (
                    <TableCell
                      rowSpan={sale.items.length || 1}
                      className="border-r"
                    >
                      {format(new Date(sale.createdAt), "PPP")}
                    </TableCell>
                  )}

                  <TableCell className="p-3 min-w-[200px]">
                    <Link
                      href={`/products/${item.productId}`}
                      className="block"
                    >
                      <div className="flex justify-start items-start gap-2">
                        <AdvancedImage
                          imageId={item.image ?? ""}
                          alt={item.title}
                          height={50}
                          width={50}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div>
                          <p className="text-base">{item.title}</p>
                          <p className="text-muted-foreground">
                            {item.feet ? <span>{item.feet} ft&nbsp;</span> : ""}
                            {item.inch ? <span>{item.inch} in</span> : ""}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{formatNumber(item.price)}</TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="py-6"></TableCell>
              <TableCell>₹{formatNumber(totalPrice)}</TableCell>
              <TableCell>₹{formatNumber(totalDiscountedPrice)}</TableCell>
              <TableCell colSpan={2}></TableCell>
              <TableCell>{totalItems} pcs</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
