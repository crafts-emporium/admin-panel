"use client";

import { TDBCustomer } from "@/db/schema";
import { customerSchema, TCustomer } from "@/schema/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CustomerForm from "./customer";
import { useToast } from "@/hooks/use-toast";
import { updateCustomer } from "@/actions/customer";
import { isActionError } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function EditCustomer({ data }: { data: TDBCustomer }) {
  const form = useForm<TCustomer>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: data.name,
      phone: data.phone || "",
      address: data.address || "",
    },
  });
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (e: TCustomer) => {
    const resp = await updateCustomer(e, data.id);
    if (isActionError(resp)) {
      return toast({
        title: "Error",
        description: resp.error,
        variant: "destructive",
      });
    }
    toast({
      title: "Success",
      description: "Customer updated successfully",
    });
    router.back();
  };

  return <CustomerForm form={form} onSubmit={onSubmit} />;
}
