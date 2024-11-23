"use client";

import SaleForm from "@/components/custom/forms/sale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SaleFormMetadataProvider from "@/providers/sale-form-metadata-provider";
import { saleSchema, TSale } from "@/schema/sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function Page() {
  const form = useForm<TSale>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: "",
      totalPrice: "",
      totalDiscountedPrice: "",
      saleItems: [{ variantId: "", quantity: "", price: "" }],
    },
  });

  const onSubmit = async (e: TSale) => {};

  return (
    <div className="@container">
      <Card className="w-full @2xl:w-3/4 @4xl:w-[42rem] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Add New Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <SaleFormMetadataProvider>
            <SaleForm form={form} onSubmit={onSubmit} />
          </SaleFormMetadataProvider>
        </CardContent>
      </Card>
    </div>
  );
}
