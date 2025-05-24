import { z } from 'zod/v4';

export const updateProfileSchema = z.object({
  name: z
    .string('Name is required')
    .trim()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(50, { message: 'Name must be under 50 characters' }),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
