export const redisChannelNames = {
  linkUpdate: (userId: string) => `link:update:${userId}` as const,
} as const;
