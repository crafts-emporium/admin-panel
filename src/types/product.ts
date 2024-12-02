import { TDBProduct, TDBVariant } from "@/db/schema";

export type TDBProductWithVariants = TDBProduct & {
  variants: Omit<TDBVariant, "productId">[];
};

export type ProductSale = {
  id: string;
  inch: number;
  feet: number | null;
  price: number;
  stock: number;
  sold: string | null;
  revenue: string | null;
};

export type TDBVariantsForSale = {
  id: string;
  inch: number;
  feet: number;
  price: number;
  costPrice: number;
  msp: number | null;
  quantity: number;
};

export type TDBProductWithVariantsForSale = {
  id: number;
  title: string;
  image: string | null;
  variants: TDBVariantsForSale[];
};
