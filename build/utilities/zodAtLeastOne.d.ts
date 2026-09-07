import { z } from 'zod';
declare const atLeastOne: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => z.ZodObject<T, z.core.$strip>;
export { atLeastOne };
