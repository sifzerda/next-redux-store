// src/lib/checkout.js

import { z } from "zod";

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().int().min(1).max(20),
    })
  ).min(1).max(50),
}).refine(
  (data) =>
    new Set(data.items.map((item) => item.id)).size ===
    data.items.length,
  { message: "Duplicate product IDs" }
);
