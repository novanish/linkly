import { z } from 'zod';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const updateProfileSchema = z.object({
  name: z
    .string('Name is required')
    .trim()
    .min(3, { error: 'Name must be at least 3 characters long' })
    .max(50, { error: 'Name must be under 50 characters' }),
  avatarImageFile: z
    .file('Please upload a valid image file')
    .max(MAX_FILE_SIZE, {
      error: `File size must be less than ${MAX_FILE_SIZE / 1024} KB`,
    })
    .mime(SUPPORTED_IMAGE_TYPES, {
      error: `Supported image types are: ${SUPPORTED_IMAGE_TYPES.join(', ')}`,
    })
    .optional()
    .nullable(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
