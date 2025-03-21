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
        <PageTitle>Products</PageTitle>
        <PageDescription>View and manage your products</PageDescription>
      </PageHeader>
      <Link href={"/products/add"}>
        <Button className="px-3">
          <Plus />
          <span className="sm:inline hidden">Add Product</span>
        </Button>
      </Link>
    </header>
  );
}
