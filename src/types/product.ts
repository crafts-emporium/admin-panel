import { TDBProduct, TDBVariant } from "@/db/schema";

export type TDBProductWithVariants = TDBProduct & {
  variants: Omit<TDBVariant, "productId">[];
};

export type ProductSale = {
  id: string;
  size: number;
  price: number;
  stock: number;
  sold: string | null;
  revenue: string | null;
};

export type TDBVariantsForSale = {
  id: string;
  size: number;
  price: number;
  quantity: number;
};

export type TDBProductWithVariantsForSale = {
  id: number;
  title: string;
  image: string | null;
  variants: TDBVariantsForSale[];
};
