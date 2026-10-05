import { z } from 'zod';
/**
 * Adds extra validation to a Zod object schema to catch all additional fields.
 * @param {z.ZodObject<T>} schema
 */
export declare function addExtraCatAttrValidation<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.ZodObject<T, z.core.$catchall<z.ZodRecord<z.ZodString, z.ZodString>>>;
/**
 * Adds extra validation to a Zod object schema to catch all additional fields.
 * @param {z.ZodObject<T>} schema
 */
export declare function addExtraAttrValidation<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.ZodObject<T, z.core.$catchall<z.ZodString>>;
