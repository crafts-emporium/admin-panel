import { getProduct } from "@/actions/products";
import AdvancedImage from "@/components/custom/advanced-image";
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";
import { isActionError } from "@/lib/utils";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getProduct(id);
  if (isActionError(res))
    return <p className="text-destructive">{res.error}</p>;
  return (
    <header className="flex justify-start items-center gap-4">
      <AdvancedImage
        imageId={res.data.image ?? ""}
        alt={res.data.title}
        height={100}
        width={100}
        className="h-24 w-24 object-contain rounded-md shrink-0"
      />
      <PageHeader>
        <PageTitle className="group flex items-baseline justify-start gap-5">
          {res.data.title}
          <Link href={`/products/${id}/edit`}>
            <Pencil size={18} className="hidden group-hover:block" />
          </Link>
        </PageTitle>
        <PageDescription>
          {res.data.description || <i>no description</i>}
        </PageDescription>
      </PageHeader>
    </header>
  );
}
