import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1).optional(),
  done: z.boolean().optional().default(false),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  done: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const putTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one of title or description must be provided',
});

export const paramsSchema = z.object({
  id: z.string().min(1),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ParamsInput = z.infer<typeof paramsSchema>;

