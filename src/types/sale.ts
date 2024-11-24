export type TDBSale = {
  id: number;
  customer: {
    id: number;
    name: string;
  } | null;
  totalPrice: number;
  totalDiscountedPrice: number;
  createdAt: Date;
};
