"use client";

import { createProduct } from "@/actions/products";
import ProductForm from "@/components/custom/forms/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isActionError } from "@/lib/utils";
import { customerSchema } from "@/schema/customer";
import { productSchema, TProduct } from "@/schema/products";
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
      variants: [{ variantId: nanoid(), quantity: "", price: "", size: "" }],
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
    <div className="@container">
      <Card className="w-full @2xl:w-3/4 @4xl:w-[42rem] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm form={form} onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
