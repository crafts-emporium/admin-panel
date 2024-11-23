"use client";

import { deleteProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn, isActionError } from "@/lib/utils";
import { TDBProductWithVariants } from "@/types/product";
import { Info, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProductDropdownMenu({
  product,
  children,
}: {
  product: TDBProductWithVariants;
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState({
    delete: false,
  });
  const handleDeleteProduct = async () => {
    setLoading((prev) => ({ ...prev, delete: true }));
    const res = await deleteProduct(product.id);
    if (isActionError(res)) {
      return toast({
        title: "Error",
        description: res.error,
        variant: "destructive",
      });
    }
    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
    setLoading((prev) => ({ ...prev, delete: false }));
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`products/${product.id}`}>
          <DropdownMenuItem>
            <Info className="h-4 w-4" />
            <span>Info</span>
          </DropdownMenuItem>
        </Link>
        <Link href={`products/${product.id}/edit`}>
          <DropdownMenuItem>
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Trash2 className="text-destructive" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>
                Delete Product&nbsp;
                <span className="inline-block px-2 py-1 rounded bg-accent">
                  {product.title}
                </span>
              </DialogTitle>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant={"secondary"}>Cancel</Button>
              </DialogClose>
              <Button variant={"destructive"} onClick={handleDeleteProduct}>
                <Loader2
                  className={cn(
                    "animate-spin h-4 w-4 hidden",
                    loading.delete && "block",
                  )}
                />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
