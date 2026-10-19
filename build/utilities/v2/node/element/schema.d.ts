import { z } from 'zod';
export type ElementValue = string | number | boolean | ElementValue[] | {
    [key: string]: ElementValue;
};
export declare const modelReferenceSchema: z.ZodObject<{
    $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
    path: z.ZodString;
}, z.core.$strict>;
export type ModelReference = z.infer<typeof modelReferenceSchema>;
export declare const attributeValueSchema: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
    path: z.ZodString;
}, z.core.$strict>]>;
export type AttributeValue = z.infer<typeof attributeValueSchema>;
export declare const elementKey: z.ZodString;
export declare const elementValue: z.ZodType<ElementValue>;
export declare const elementObject: z.ZodPreprocess<z.ZodRecord<z.ZodString, z.ZodType<ElementValue, unknown, z.core.$ZodTypeInternals<ElementValue, unknown>>>, unknown>;
