"use client";

import { createSale } from "@/actions/sale";
import SaleForm from "@/components/custom/forms/sale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isActionError } from "@/lib/utils";
import SaleFormMetadataProvider from "@/providers/sale-form-metadata-provider";
import { getSaleItemDefault, saleSchema, TSale } from "@/schema/sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Page() {
  const form = useForm<TSale>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: "",
      totalPrice: "",
      totalDiscountedPrice: "",
      saleItems: [getSaleItemDefault()],
    },
  });
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (e: TSale) => {
    const res = await createSale(e);
    if (isActionError(res)) {
      return toast({
        title: "Error",
        description: res.error,
        variant: "destructive",
      });
    }
    toast({
      title: "Success",
      description: "Sale created successfully",
    });
    router.back();
  };

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
