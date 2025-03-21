import { getCustomer } from "@/actions/customer";
import EditCustomerDialog from "./_components/dialog";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  return <EditCustomerDialog data={customer} />;
}
