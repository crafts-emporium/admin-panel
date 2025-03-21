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
    .min(1, { message: "At least one variant is required" })
    .superRefine((variants, ctx) => {
      const seen = new Map<string, number[]>();
      const duplicates: number[] = [];

      variants.forEach((v, idx) => {
        const key = `${Number(v.inch)}-${Number(v.feet)}`;
        if (!seen.has(key)) {
          seen.set(key, []);
        }

        seen.get(key)!.push(idx);
      });

      for (const [key, indices] of seen.entries()) {
        if (indices.length > 1) {
          duplicates.push(...indices);
        }
      }

      duplicates.forEach((idx) => {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate variant found",
          path: [`${idx}.inch`],
        });
      });
    }),
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
