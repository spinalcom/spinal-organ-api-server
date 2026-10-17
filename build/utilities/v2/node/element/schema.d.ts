import { z } from "zod";
export type ElementValue = string | number | boolean | ElementValue[] | {
    [key: string]: ElementValue;
};
export declare const elementKey: z.ZodString;
export declare const elementValue: z.ZodType<ElementValue>;
export declare const elementObject: z.ZodPreprocess<z.ZodRecord<z.ZodString, z.ZodType<ElementValue, unknown, z.core.$ZodTypeInternals<ElementValue, unknown>>>, unknown>;
