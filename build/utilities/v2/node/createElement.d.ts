import { z } from "zod";
import { Model } from "spinal-core-connectorjs";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
export type ElementValue = string | number | boolean | ElementValue[] | {
    [key: string]: ElementValue;
};
export declare const elementKey: z.ZodString;
export declare const elementValue: z.ZodType<ElementValue>;
export declare const elementObject: z.ZodPreprocess<z.ZodRecord<z.ZodString, z.ZodType<ElementValue, unknown, z.core.$ZodTypeInternals<ElementValue, unknown>>>, unknown>;
export declare function createElement(data: Record<string, ElementValue>, middleware: ISpinalAPIMiddleware, profileId: string, self?: (path: string) => Promise<Model>, build?: (value: ElementValue, path: string[], resolve: () => Promise<Model>) => Promise<Model>): Promise<Model>;
