import { z } from 'zod';

export const PackingListItemSchema = z.object({
  id: z.string().optional(), // Para useFieldArray
  qty: z.coerce.number().min(1, 'Mínimo 1'),
  tag: z.string().min(1, 'TAG requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  location: z.string().optional(),
  category: z.string().min(1, 'Categoría requerida'),
  colorTag: z.string().default('#cccccc'),
  weight: z.coerce.number().optional().default(0),
  dimensions: z.string().optional(),
  condition: z.string().optional().default('Nuevo'),
  connections: z.string().optional(),
  dateTag: z.string().optional(),
  inspector: z.string().optional(),
  serialNumber: z.string().optional(),
  observations: z.string().optional(),
  photo: z.string().optional(), // Base64
});

export const PackingListSummaryRowSchema = z.object({
  category: z.string(),
  count: z.number(),
  weight: z.number(),
  percentage: z.string(),
  observations: z.string().optional(),
});

export const PackingListDataSchema = z.object({
  projectName: z.string().min(1, 'Nombre del proyecto requerido'),
  clientName: z.string().min(1, 'Nombre del cliente requerido'),
  date: z.string().min(1, 'Fecha requerida'),
  items: z.array(PackingListItemSchema).default([]),
  summary: z.array(PackingListSummaryRowSchema).default([]),
});

export type PackingListItem = z.infer<typeof PackingListItemSchema>;
export type PackingListSummaryRow = z.infer<typeof PackingListSummaryRowSchema>;
export type PackingListData = z.infer<typeof PackingListDataSchema>;
