export type CustomerSaleItem = {
  productId: number;
  title: string;
  image: string | null;
  size: string;
  quantity: number;
  price: number;
};

export type CustomerSale = {
  id: number;
  totalPrice: number;
  totalDiscountedPrice: number;
  createdAt: Date;
  items: CustomerSaleItem[];
};
