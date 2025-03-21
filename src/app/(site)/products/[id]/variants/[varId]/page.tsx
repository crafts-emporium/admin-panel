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
  params: Promise<{ id: string; varId: string }>;
}) {
  const { id, varId } = await params;
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
    .where(and(eq(variants.id, varId), isNull(variants.deletedAt)));

  await client.end();

  if (variant.length === 0) return notFound();

  return (
    <header className="flex justify-start items-center gap-4">
      <AdvancedImage
        imageId={product[0].image ?? ""}
        alt={product[0].title}
        height={100}
        width={100}
        className="h-24 w-24 object-cover rounded-md shrink-0"
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
          <span className="text-base">
            {variant[0].feet ? (
              <span>
                {variant[0].feet}
                <span className="ml-0.5">ft</span>
              </span>
            ) : (
              ""
            )}
            {variant[0].inch ? (
              <span>
                {variant[0].inch}
                <span className="ml-0.5">in</span>
              </span>
            ) : (
              ""
            )}
          </span>
          <Dot className="shrink-0" />
          <span>₹{formatNumber(variant[0].price)}</span>
          <Dot className="shrink-0" />
          <span>₹{formatNumber(variant[0].msp || 0)}</span>
          <Dot className="shrink-0" />
          <span>₹{formatNumber(variant[0].costPrice || 0)}</span>
        </PageDescription>
      </PageHeader>
    </header>
  );
}
