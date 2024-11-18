import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";

export default function Home() {
  return (
    <div>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageDescription>Welcome to your dashboard</PageDescription>
      </PageHeader>
    </div>
  );
}
