"use client";

import EditCustomer from "@/components/custom/forms/edit-customer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TDBCustomer } from "@/db/schema";
import { isActionError, ServerActionResponse } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function EditCustomerDialog({
  data,
}: {
  data: ServerActionResponse<{ data: TDBCustomer }>;
}) {
  const router = useRouter();

  return (
    <Dialog defaultOpen onOpenChange={(e) => !e && router.back()}>
      <DialogContent>
        {isActionError(data) ? (
          <>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
            </DialogHeader>
            <DialogDescription>{data.error}</DialogDescription>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit</DialogTitle>
            </DialogHeader>
            <EditCustomer data={data.data} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
