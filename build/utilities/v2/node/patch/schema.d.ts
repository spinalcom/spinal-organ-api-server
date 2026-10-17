import { z } from "zod";
export declare const patchNodeSchema: z.ZodObject<{
    info: z.ZodOptional<z.ZodObject<{
        set: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<import("../createElement").ElementValue, unknown, z.core.$ZodTypeInternals<import("../createElement").ElementValue, unknown>>>>;
        remove: z.ZodOptional<z.ZodArray<z.ZodString>>;
        rename: z.ZodOptional<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
    element: z.ZodOptional<z.ZodObject<{
        set: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<import("../createElement").ElementValue, unknown, z.core.$ZodTypeInternals<import("../createElement").ElementValue, unknown>>>>;
        remove: z.ZodOptional<z.ZodArray<z.ZodString>>;
        rename: z.ZodOptional<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
    attributes: z.ZodOptional<z.ZodObject<{
        set: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>>>;
        remove: z.ZodOptional<z.ZodArray<z.ZodObject<{
            category: z.ZodString;
            label: z.ZodString;
        }, z.core.$strict>>>;
        rename: z.ZodOptional<z.ZodArray<z.ZodObject<{
            category: z.ZodString;
            from: z.ZodString;
            to: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type Patch = z.infer<typeof patchNodeSchema>;
