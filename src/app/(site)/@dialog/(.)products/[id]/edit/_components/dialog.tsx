"use client";

import EditProduct from "@/components/custom/forms/edit-product";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isActionError, ServerActionResponse } from "@/lib/utils";
import { TDBProductWithVariants } from "@/types/product";
import { useRouter } from "next/navigation";

export default function EditProductDialog({
  data,
}: {
  data: ServerActionResponse<{ data: TDBProductWithVariants }>;
}) {
  const router = useRouter();
  return (
    <Dialog defaultOpen onOpenChange={(e) => !e && router.back()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-h-[90dvh] overflow-y-scroll scroller-none"
      >
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
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <EditProduct data={data.data} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
