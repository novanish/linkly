import { z } from 'zod/v4';

export const linkSchema = z.object({
  id: z.string(),
  originalUrl: z.url('Please enter a valid URL'),
  customAlias: z
    .string()
    .refine(
      (value) => /^[a-zA-Z0-9-]+$/.test(value),
      'Custom alias should only contain letters, numbers, and hyphens',
    )
    .optional()
    .nullable(),
  isActive: z.stringbool().optional().default(false),
  trackClicks: z.stringbool().optional().default(false),
});

export const createLinkSchema = linkSchema.omit({ id: true });
export const updateLinkSchema = linkSchema.partial().omit({ id: true });

export type LinkSchema = z.infer<typeof linkSchema>;
export type CreateLinkSchema = z.infer<typeof createLinkSchema>;
export type UpdateLinkSchema = z.infer<typeof updateLinkSchema>;
