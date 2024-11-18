"use client";

import { createCustomer } from "@/actions/customer";
import CustomerForm from "@/components/custom/forms/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isActionError } from "@/lib/utils";
import { customerSchema, TCustomer } from "@/schema/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Page() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<TCustomer>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
    },
  });

  const handleFormSubmit = async (e: TCustomer) => {
    const resp = await createCustomer(e);
    if (isActionError(resp)) {
      return toast({
        title: "Error",
        description: resp.error,
        variant: "destructive",
      });
    }
    toast({
      title: "Success",
      description: "Customer created successfully",
    });
    router.back();
  };

  return (
    <div className="@container">
      <Card className="w-full @2xl:w-3/4 @4xl:w-[42rem] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Add Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm form={form} onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
