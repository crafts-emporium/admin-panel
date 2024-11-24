import { getProductVariants } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/functions/format-number";
import { cn, isActionError } from "@/lib/utils";
import { Info, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productVariants = await getProductVariants(id);

  if (isActionError(productVariants)) {
    return <p className="text-destructive">{productVariants.error}</p>;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-5">Size</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="">Revenue</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productVariants.data.map((productVariant) => (
              <TableRow key={productVariant.id}>
                <TableCell className="p-5 px-6">
                  {productVariant.size}{" "}
                  <span className="text-muted-foreground italic">inch</span>
                </TableCell>
                <TableCell>
                  {productVariant.sold || "0"}&nbsp;
                  <span className={cn("text-muted-foreground italic")}>
                    pcs
                  </span>
                </TableCell>
                <TableCell>
                  {productVariant.stock || "0"}&nbsp;
                  <span className={cn("text-muted-foreground italic")}>
                    pcs
                  </span>
                </TableCell>
                <TableCell>₹{formatNumber(productVariant.price)}</TableCell>
                <TableCell>
                  ₹{formatNumber(Number(productVariant.revenue))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={"outline"} className="px-3">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link
                        href={`/products/${id}/variants/${productVariant.size}`}
                      >
                        <DropdownMenuItem>
                          <Info className="mr-2 h-4 w-4" />
                          <span>Details</span>
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
    </Card>
  );
}
