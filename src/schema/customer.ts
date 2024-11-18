import * as z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z
    .string()
    .optional()
    .refine((ph) => ph?.length === 10, { message: "Invalid phone number" }),
  address: z.string().optional(),
});

export type TCustomer = z.infer<typeof customerSchema>;
