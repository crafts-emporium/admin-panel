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
import { initializeDB } from "@/lib/db";
import { and, desc, eq, isNull, sql, sum } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db, client } = await initializeDB();

  const data = await db
    .select({
      id: purchaseItems.id,
      product: {
        id: products.id,
        title: products.title,
        image: products.image,
        inch: variants.inch,
        feet: variants.feet,
      },
      quantity: purchaseItems.quantity,
      price: purchaseItems.price,
      subTotalPrice: sql<number>`${purchaseItems.quantity} * ${purchaseItems.price}`,
      discountedPrice: purchaseItems.discountedPrice,
      totalDiscountedPrice: purchases.discountedPrice,
    })
    .from(purchases)
    .leftJoin(purchaseItems, eq(purchases.id, purchaseItems.purchaseId))
    .leftJoin(variants, eq(purchaseItems.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .where(and(eq(purchases.id, Number(id)), isNull(purchases.deletedAt)))
    .orderBy(
      desc(sql<number>`${purchaseItems.quantity} * ${purchaseItems.price}`),
    )
    .groupBy(
      purchaseItems.id,
      purchaseItems.variantId,
      products.id,
      variants.inch,
      variants.feet,
      purchaseItems.quantity,
      purchaseItems.price,
      purchases.discountedPrice,
    );

  await client.end();

  const totalPrice = data.reduce((total, item) => {
    return total + Number(item.subTotalPrice);
  }, 0);

  if (!data.length) return notFound();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-5">Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Discounted Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-5">
                  <Link href={`/products/${item.product?.id}`}>
                    <div className="min-w-[200px] flex justify-start items-center gap-3">
                      <AdvancedImage
                        alt={item.product.title}
                        height={50}
                        width={50}
                        imageId={item.product.image ?? ""}
                        className="rounded-md h-12 w-12 object-cover"
                      />
                      <div>
                        <h2 className="text-base">{item.product.title}</h2>
                        <p className="text-muted-foreground">
                          {item.product.feet ? (
                            <span>{item.product.feet} ft&nbsp;</span>
                          ) : (
                            ""
                          )}

                          {item.product.inch ? (
                            <span> {item.product.inch} in</span>
                          ) : (
                            ""
                          )}
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
                <TableCell>
                  ₹{formatNumber(Number(item.discountedPrice))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="p-6"></TableCell>
              <TableCell>₹{formatNumber(totalPrice)}</TableCell>
              <TableCell>
                ₹{formatNumber(Number(data[0]?.totalDiscountedPrice))}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
