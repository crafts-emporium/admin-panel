import { getCustomer } from "@/actions/customer";
import { isActionError } from "@/lib/utils";
import EditCustomer from "@/components/custom/forms/edit-customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  return (
    <div className="@container">
      <Card className="w-full @2xl:w-3/4 @4xl:w-[42rem] mx-auto mt-10">
        {isActionError(customer) ? (
          <>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent className="text-destructive">
              {customer.error}
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Edit Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <EditCustomer data={customer.data} />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
