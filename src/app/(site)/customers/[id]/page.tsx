import { getCustomer } from "@/actions/customer";
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";
import { cn, isActionError } from "@/lib/utils";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resp = await getCustomer(id as string);

  if (isActionError(resp)) {
    return <p className="text-destructive">{resp.error}</p>;
  }

  return (
    <header>
      <PageHeader className="space-y-3">
        <PageTitle className="flex justify-start items-baseline gap-10 group">
          {resp.data.name}
          <Link
            href={`/customers/${id}/edit`}
            className={cn("hidden group-hover:block")}
          >
            <Pencil size={18} />
          </Link>
        </PageTitle>
        <div>
          <PageDescription>{resp.data.phone}</PageDescription>
          <PageDescription>{resp.data.address}</PageDescription>
        </div>
      </PageHeader>
    </header>
  );
}
