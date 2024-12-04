import { initializeDB } from "@/lib/db";
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
import { purchaseItems, variants } from "@/db/schema";
import { and, asc, eq, isNull, sql, sum } from "drizzle-orm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db, client } = await initializeDB();
  const productVariants = await db
    .select({
      id: variants.id,
      inch: variants.inch,
      feet: variants.feet,
      stock: variants.quantity,
      price: variants.price,
      costPrice: variants.costPrice,
      msp: variants.msp,
      sold: sum(purchaseItems.quantity),
      revenue: sum(purchaseItems.discountedPrice),
    })
    .from(variants)
    .leftJoin(purchaseItems, eq(purchaseItems.variantId, variants.id))
    .where(and(eq(variants.productId, Number(id)), isNull(variants.deletedAt)))
    .groupBy(variants.id)
    .orderBy(
      asc(
        sql<number>`coalesce(${variants.feet}, 0) * 12 + coalesce(${variants.inch}, 0)`,
      ),
    );

  await client.end();
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
              <TableHead>MSP</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead className="">Revenue</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productVariants.map((productVariant) => (
              <TableRow key={productVariant.id}>
                <TableCell className="p-5 px-6">
                  {productVariant.feet ? (
                    <span>
                      {productVariant.feet}
                      <span className="ml-0.5">ft</span>
                    </span>
                  ) : (
                    ""
                  )}
                  {productVariant.inch ? (
                    <span>
                      {productVariant.inch}
                      <span className="ml-0.5">in</span>
                    </span>
                  ) : (
                    ""
                  )}
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
                <TableCell>₹{formatNumber(productVariant.msp || 0)}</TableCell>
                <TableCell>
                  ₹{formatNumber(productVariant.costPrice || 0)}
                </TableCell>
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
                        href={`/products/${id}/variants/${productVariant.id}`}
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
