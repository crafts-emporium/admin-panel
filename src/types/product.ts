import { TDBProduct, TDBVariant } from "@/db/schema";

export type TDBProductWithVariants = TDBProduct & {
  variants: Omit<TDBVariant, "productId">[];
};

export type TDBVariantWithProduct = {
  id: string;
  productId: number | null;
  size: number;
  price: number;
  quantity: number;
  title: string;
  image: string | null;
};
