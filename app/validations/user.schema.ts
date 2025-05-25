import { z } from 'zod/v4';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const updateProfileSchema = z.object({
  name: z
    .string('Name is required')
    .trim()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(50, { message: 'Name must be under 50 characters' }),
  avatarImageFile: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      'File size must be less than 1 MB',
    )
    .refine(
      (file) => !file || SUPPORTED_IMAGE_TYPES.includes(file.type),
      `Supported image types are: ${SUPPORTED_IMAGE_TYPES.join(', ')}`,
    ),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
