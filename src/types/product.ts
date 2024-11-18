export type TDBProductWithVariants = {
  title: string;
  description: string | null;
  id: number;
  isDeleted: boolean | null;
  image: string | null;
  variants: TDBVariants[];
};

export type TDBVariants = {
  size: number;
  quantity: number;
  price: number;
  id: string;
  isDeleted: boolean | null;
  productId: number | null;
};
