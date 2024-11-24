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
import {
  customers,
  products,
  purchaseItems,
  purchases,
  variants,
} from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { db } from "@/lib/db";
import { desc, eq, sql, sum } from "drizzle-orm";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await db
    .select({
      id: purchaseItems.id,
      product: {
        id: products.id,
        title: products.title,
        image: products.image,
        size: variants.size,
      },
      quantity: purchaseItems.quantity,
      price: purchaseItems.price,
      subTotalPrice: sql<number>`${purchaseItems.quantity} * ${purchaseItems.price}`,
      totalDiscountedPrice: purchases.discountedPrice,
    })
    .from(purchases)
    .leftJoin(purchaseItems, eq(purchases.id, purchaseItems.purchaseId))
    .leftJoin(variants, eq(purchaseItems.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .where(eq(purchases.id, Number(id)))
    .orderBy(
      desc(sql<number>`${purchaseItems.quantity} * ${purchaseItems.price}`),
    )
    .groupBy(
      purchaseItems.id,
      purchaseItems.variantId,
      products.id,
      variants.size,
      purchaseItems.quantity,
      purchaseItems.price,
      purchases.discountedPrice,
    );

  const totalPrice = data.reduce((total, item) => {
    return total + Number(item.subTotalPrice);
  }, 0);

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-5">Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sub Total</TableHead>
              <TableHead>Discounted Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-5">
                  <Link href={`/products/${item.product.id}`}>
                    <div className="min-w-[200px] flex justify-start items-center gap-3">
                      <AdvancedImage
                        alt={item.product.title}
                        height={50}
                        width={50}
                        imageId={item.product.image ?? ""}
                        className="rounded-md h-12 w-12 object-contain"
                      />
                      <div>
                        <h2 className="text-base">{item.product.title}</h2>
                        <p className="text-muted-foreground">
                          {item.product.size}
                        </p>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>₹{formatNumber(Number(item.price))}</TableCell>
                <TableCell>
                  ₹{formatNumber(Number(item.subTotalPrice))}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="p-6"></TableCell>
              <TableCell>₹{formatNumber(totalPrice)}</TableCell>
              <TableCell>
                ₹{formatNumber(data[0].totalDiscountedPrice)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
