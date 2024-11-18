"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { customerSchema, TCustomer } from "@/schema/customer";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomerForm from "@/components/custom/forms/customer";
import { useToast } from "@/hooks/use-toast";
import { createCustomer } from "@/actions/customer";
import { isActionError } from "@/lib/utils";

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
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
    <Dialog defaultOpen onOpenChange={(e) => !e && router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>
        <CustomerForm form={form} onSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
}
