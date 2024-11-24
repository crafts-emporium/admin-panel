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
import { Amphora } from "lucide-react";
import Image from "next/image";
import handcraft from "@/../public/istockphoto.jpg";
import { initializeDB } from "@/lib/db";
import { products, purchaseItems, variants } from "@/db/schema";
import { desc, eq, isNull, sql, sum } from "drizzle-orm";
import AdvancedImage from "@/components/custom/advanced-image";
import { formatNumber } from "@/functions/format-number";
import Link from "next/link";

export default async function Page() {
  const { db, client } = await initializeDB();
  const topProducts = await db
    .select({
      variantId: variants.id,
      productId: products.id,
      title: products.title,
      image: products.image,
      size: variants.size,
      quantity: sum(purchaseItems.quantity),
      revenue: sum(sql`${purchaseItems.quantity} * ${variants.price}`),
    })
    .from(purchaseItems)
    .innerJoin(variants, eq(variants.id, purchaseItems.variantId))
    .innerJoin(products, eq(products.id, variants.productId))
    .where(isNull(variants.deletedAt))
    .orderBy(desc(sum(purchaseItems.quantity)))
    .groupBy(
      variants.id,
      products.title,
      products.image,
      variants.size,
      products.id,
    )
    .limit(5);
  await client.end();

  const totalQuantity = topProducts.reduce(
    (total, current) => total + Number(current.quantity),
    0,
  );
  const totalRevenue = topProducts.reduce(
    (total, current) => total + Number(current.revenue),
    0,
  );
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Top Sold Products</CardTitle>
        <Amphora />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((topProduct, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Link href={`/products/${topProduct.productId}`}>
                    <div className="flex items-center gap-2">
                      <AdvancedImage
                        alt="product-image"
                        imageId={topProduct.image || ""}
                        width={50}
                        height={50}
                        className="rounded-md sm:inline-block hidden h-12 w-12 object-cover"
                      />
                      <p>{topProduct.title}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/products/${topProduct.productId}/variants/${topProduct.size}`}
                  >
                    {topProduct.size} inch
                  </Link>
                </TableCell>
                <TableCell>
                  {formatNumber(Number(topProduct.quantity))}
                </TableCell>
                <TableCell>
                  ₹{formatNumber(Number(topProduct.revenue))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}></TableCell>
              <TableCell className="text-base">
                {formatNumber(totalQuantity)}
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
