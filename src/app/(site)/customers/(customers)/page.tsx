import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <header className="flex justify-between items-center">
      <PageHeader>
        <PageTitle>Customers</PageTitle>
        <PageDescription>View and manage your customers</PageDescription>
      </PageHeader>
      <Link href={"/customers/add"}>
        <Button className="px-3">
          <Plus />
          <span className="sm:inline hidden">Add Customer</span>
        </Button>
      </Link>
    </header>
  );
}
