import * as z from "zod";

const saleItem = z.object({
  productId: z.string().min(1, { message: "Product id is required" }),
  variantId: z.string().min(21, { message: "Size is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  price: z.string().min(1, { message: "Total price is required" }),
  costPrice: z.string().min(1, { message: "Cost price is required" }),
  discountedPrice: z
    .string()
    .min(1, { message: "Discounted price is required" }),
});

export const saleSchema = z
  .object({
    customerId: z.string().optional(),
    totalDiscountedPrice: z
      .string()
      .min(1, { message: "Discounted price is required" }),
    totalPrice: z.string().min(1, { message: "Total price is required" }),
    saleItems: z
      .array(saleItem)
      .min(1, { message: "At least one sale item is required" }),
  })
  .refine(
    (data) => Number(data.totalPrice) >= Number(data.totalDiscountedPrice),
    {
      message: "Discounted price must be less than or equal to total price",
      path: ["totalDiscountedPrice"],
    },
  );

export type TSale = z.infer<typeof saleSchema>;
export type TSaleItem = z.infer<typeof saleItem>;
export const getSaleItemDefault = (): TSaleItem => ({
  price: "",
  costPrice: "",
  quantity: "",
  productId: "",
  variantId: "",
  discountedPrice: "",
});
