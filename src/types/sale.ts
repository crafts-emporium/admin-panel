export type TDBSale = {
  id: number;
  customer: string | null;
  totalPrice: number;
  totalDiscountedPrice: number;
  createdAt: Date;
};
