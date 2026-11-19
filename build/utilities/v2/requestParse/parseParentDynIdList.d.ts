import { z } from 'zod';
export declare const MAX_PARENT_DYNAMIC_IDS = 50;
/**
 * Query form: `parent-dynamic-id=132456,132457`.
 * Duplicates are removed; empty or non-integer entries are rejected.
 */
export declare const parentDynamicIdsQuerySchema: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number[], string>>, z.ZodPipe<z.ZodArray<z.ZodNumber>, z.ZodTransform<number[], number[]>>>;
/**
 * JSON body form: `"parentDynamicIds": [132456, 132457]`.
 */
export declare const parentDynamicIdsBodySchema: z.ZodPipe<z.ZodArray<z.ZodNumber>, z.ZodTransform<number[], number[]>>;
