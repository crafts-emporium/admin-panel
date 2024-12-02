"use client";

import { useToast } from "@/hooks/use-toast";
import { productSchema, TProduct } from "@/schema/products";
import { TDBProductWithVariants } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ProductForm from "./products";
import { isActionError } from "@/lib/utils";
import { updateProduct } from "@/actions/products";
import { useRouter } from "next/navigation";

export default function EditProduct({
  data,
}: {
  data: TDBProductWithVariants;
}) {
  const form = useForm<TProduct>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: data.title,
      description: data.description || "",
      variants: data.variants.map((variant) => ({
        variantId: variant.id,
        quantity: String(variant.quantity || ""),
        price: String(variant.price || ""),
        inch: String(variant.inch || ""),
        feet: String(variant.feet || ""),
        costPrice: String(variant.costPrice || ""),
        msp: String(variant.msp || ""),
        description: variant.description || "",
      })),
      imageId: data.image || "",
    },
  });
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (e: TProduct) => {
    const resp = await updateProduct({ data: e, id: data.id });
    if (isActionError(resp)) {
      return toast({
        title: "Error",
        description: resp.error,
        variant: "destructive",
      });
    }
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
    router.back();
  };

  return <ProductForm form={form} onSubmit={onSubmit} />;
}
