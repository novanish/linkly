import { isCuid } from '@paralleldrive/cuid2';
import { z } from 'zod';

export const linkIdSchema = z.string().refine(isCuid);

const RESERVED_ALIASES = ['api'];

export const linkSchema = z.object({
  id: linkIdSchema,
  originalUrl: z.url('Please enter a valid URL'),
  customAlias: z
    .string()
    .refine(
      (value) => /^[a-zA-Z0-9-]+$/.test(value),
      'Custom alias should only contain letters, numbers, and hyphens',
    )
    .refine(
      (value) => !RESERVED_ALIASES.includes(value.toLowerCase()),
      'This alias is reserved',
    )
    .nullable()
    .default(null),
  isActive: z.coerce.boolean().default(false),
  trackClicks: z.coerce.boolean().default(false),
});

export const createLinkSchema = linkSchema.omit({ id: true });
export const updateLinkSchema = linkSchema
  .extend({
    originalUrl: z.url('Please enter a valid URL').optional(),
  })
  .omit({ id: true });

export type LinkSchema = z.infer<typeof linkSchema>;
export type CreateLinkSchema = z.infer<typeof createLinkSchema>;
export type UpdateLinkSchema = z.infer<typeof updateLinkSchema>;
