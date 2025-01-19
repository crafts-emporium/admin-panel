import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  return (
    <header className="flex justify-between items-center">
      <PageHeader>
        <PageTitle>Sales</PageTitle>
        <PageDescription>View sales</PageDescription>
      </PageHeader>
      <Link href={"/sales/new"}>
        <Button className="px-3">
          <Plus />
          <span className="sm:inline hidden">Add Order</span>
        </Button>
      </Link>
    </header>
  );
}
