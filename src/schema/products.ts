import * as z from "zod";

export const variantsSchema = z.object({
  variantId: z.string(),
  size: z.string().min(1, { message: "Size is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  price: z.string().min(1, { message: "Price is required" }),
});

export const productSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  variants: z
    .array(variantsSchema)
    .min(1, { message: "At least one variant is required" }),
  imageId: z.string().optional(),
});

export type TVariant = z.infer<typeof variantsSchema>;
export type TProduct = z.infer<typeof productSchema>;
