"use client";

import { createSale } from "@/actions/sale";
import SaleForm from "@/components/custom/forms/sale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isActionError } from "@/lib/utils";
import SaleFormMetadataProvider from "@/providers/sale-form-metadata-provider";
import { saleSchema, TSale } from "@/schema/sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<TSale>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: "",
      totalPrice: "",
      totalDiscountedPrice: "",
      saleItems: [{ variantId: "", quantity: "", price: "" }],
    },
  });
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
    <Dialog defaultOpen onOpenChange={(e) => !e && router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Sale</DialogTitle>
        </DialogHeader>
        <SaleFormMetadataProvider>
          <SaleForm form={form} onSubmit={onSubmit} />
        </SaleFormMetadataProvider>
      </DialogContent>
    </Dialog>
  );
}
