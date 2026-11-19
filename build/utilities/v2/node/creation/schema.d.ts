import { z } from 'zod';
export declare const createNodeSchema: z.ZodObject<{
    info: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
    }, z.core.$catchall<z.ZodOptional<z.ZodType<import("../element/schema").ElementValue, unknown, z.core.$ZodTypeInternals<import("../element/schema").ElementValue, unknown>>>>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
        path: z.ZodString;
    }, z.core.$strict>]>>>>;
    element: z.ZodOptional<z.ZodPreprocess<z.ZodRecord<z.ZodString, z.ZodType<import("../element/schema").ElementValue, unknown, z.core.$ZodTypeInternals<import("../element/schema").ElementValue, unknown>>>, unknown>>;
    parents: z.ZodArray<z.ZodObject<{
        parentDynamicId: z.ZodNumber;
        relationName: z.ZodString;
        relationType: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            PtrLst: "PtrLst";
            LstPtr: "LstPtr";
            Ref: "Ref";
        }>>>;
        contextDynamicId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const createContextSchema: z.ZodObject<{
    info: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
    }, z.core.$catchall<z.ZodOptional<z.ZodType<import("../element/schema").ElementValue, unknown, z.core.$ZodTypeInternals<import("../element/schema").ElementValue, unknown>>>>>;
    element: z.ZodOptional<z.ZodPreprocess<z.ZodRecord<z.ZodString, z.ZodType<import("../element/schema").ElementValue, unknown, z.core.$ZodTypeInternals<import("../element/schema").ElementValue, unknown>>>, unknown>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
        path: z.ZodString;
    }, z.core.$strict>]>>>>;
}, z.core.$strict>;
