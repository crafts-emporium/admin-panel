import { nanoid } from "nanoid";
import * as z from "zod";

export const variantsSchema = z.object({
  variantId: z.string(),
  inch: z.string().optional(),
  feet: z.string().optional(),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  price: z.string().min(1, { message: "Price is required" }),
  costPrice: z.string().min(1, { message: "Cost price is required" }),
  msp: z.string().optional(),
  description: z.string().optional(),
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

export const getVariantsDefault = (): TVariant => ({
  variantId: nanoid(),
  inch: "",
  feet: "",
  quantity: "",
  price: "",
  costPrice: "",
  msp: "",
  description: "",
});
