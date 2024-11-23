import * as z from "zod";

const saleItem = z.object({
  variantId: z
    .string()
    .refine((v) => v.length === 21, { message: "Invalid variant id" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  price: z.string().min(1, { message: "Total price is required" }),
});

export const saleSchema = z
  .object({
    customerId: z.string().optional(),
    totalDiscountedPrice: z.string().optional(),
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
