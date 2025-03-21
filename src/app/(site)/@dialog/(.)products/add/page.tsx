"use client";

import { createProduct } from "@/actions/products";
import ProductForm from "@/components/custom/forms/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isActionError } from "@/lib/utils";
import { getVariantsDefault, productSchema, TProduct } from "@/schema/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<TProduct>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      variants: [getVariantsDefault()],
    },
  });

  const handleFormSubmit = async (e: TProduct) => {
    const resp = await createProduct(e);
    if (isActionError(resp)) {
      return toast({
        title: "Error",
        description: resp.error,
        variant: "destructive",
      });
    }
    toast({
      title: "Success",
      description: "Product created successfully",
    });

    router.back();
  };

  return (
    <Dialog defaultOpen onOpenChange={(e) => !e && router.back()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto scroller-none ">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>
        <ProductForm form={form} onSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
}
