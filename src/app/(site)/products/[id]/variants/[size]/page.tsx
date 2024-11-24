import AdvancedImage from "@/components/custom/advanced-image";
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";
import { products, variants } from "@/db/schema";
import { formatNumber } from "@/functions/format-number";
import { initializeDB } from "@/lib/db";
import { and, eq, isNull } from "drizzle-orm";
import { Dot, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; size: string }>;
}) {
  const { id, size } = await params;
  const { db, client } = await initializeDB();
  const product = await db
    .select({
      id: products.id,
      image: products.image,
      title: products.title,
      description: products.description,
    })
    .from(products)
    .where(eq(products.id, Number(id)));
  const variant = await db
    .select()
    .from(variants)
    .where(
      and(
        eq(variants.productId, Number(id)),
        eq(variants.size, Number(size)),
        isNull(variants.deletedAt),
      ),
    );

  await client.end();

  if (variant.length === 0) return notFound();

  return (
    <header className="flex justify-start items-center gap-4">
      <AdvancedImage
        imageId={product[0].image ?? ""}
        alt={product[0].title}
        height={100}
        width={100}
        className="h-24 w-24 object-contain rounded-md shrink-0"
      />
      <PageHeader>
        <PageTitle className="group flex items-baseline justify-start gap-5">
          {product[0].title}
          <Link href={`/products/${id}/edit`} className="inline-block">
            <Pencil size={18} className="hidden group-hover:block" />
          </Link>
        </PageTitle>
        <PageDescription>
          {product[0].description || <i>no description</i>}
        </PageDescription>
        <PageDescription className="flex items-center justify-start [&>*]:text-foreground">
          <span className="text-base">{variant[0].size} inch</span>
          <Dot className="shrink-0" />
          <span>₹{formatNumber(variant[0].price)}</span>
        </PageDescription>
      </PageHeader>
    </header>
  );
}
