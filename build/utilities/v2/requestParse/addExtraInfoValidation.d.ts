import { z } from 'zod';
/**
 * Adds extra validation to a Zod object schema to catch all additional fields and forbid certain keys.
 * @param {z.ZodObject<T>} schema
 * @param {readonly string[]} forbiddenKeys - An array of keys that are not allowed in the object.
 */
export declare function addExtraInfoValidation<T extends z.ZodRawShape>(schema: z.ZodObject<T>, forbiddenKeys: readonly string[]): z.ZodObject<T, z.core.$catchall<z.ZodUnion<readonly [z.ZodString, z.ZodBoolean, z.ZodNumber, z.ZodUndefined]>>>;
