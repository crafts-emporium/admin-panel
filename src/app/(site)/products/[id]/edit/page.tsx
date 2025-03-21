import { getProduct } from "@/actions/products";
import EditProduct from "@/components/custom/forms/edit-product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isActionError } from "@/lib/utils";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resp = await getProduct(id);

  if (isActionError(resp)) {
    return <p className="text-destructive">{resp.error}</p>;
  }
  return (
    <div className="@container">
      <Card className="w-full @2xl:w-3/4 @4xl:w-[42rem] mx-auto mt-10">
        {isActionError(resp) ? (
          <>
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{resp.error}</p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
            </CardHeader>
            <CardContent>
              <EditProduct data={resp.data} />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
