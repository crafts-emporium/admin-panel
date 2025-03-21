import EditProductDialog from "./_components/dialog";
import { getProduct } from "@/actions/products";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getProduct(id);
  return <EditProductDialog data={res} />;
}
