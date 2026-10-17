import { z } from "zod";
export declare const childAttachmentSchema: z.ZodObject<{
    childDynamicId: z.ZodNumber;
    relationName: z.ZodString;
    relationType: z.ZodDefault<z.ZodEnum<{
        PtrLst: "PtrLst";
        LstPtr: "LstPtr";
        Ref: "Ref";
    }>>;
    contextDynamicId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const moveNodeSchema: z.ZodObject<{
    from: z.ZodObject<{
        parentDynamicId: z.ZodNumber;
        relationName: z.ZodString;
        relationType: z.ZodEnum<{
            PtrLst: "PtrLst";
            LstPtr: "LstPtr";
            Ref: "Ref";
        }>;
    }, z.core.$strict>;
    to: z.ZodObject<{
        contextDynamicId: z.ZodOptional<z.ZodNumber>;
        parentDynamicId: z.ZodNumber;
        relationName: z.ZodString;
        relationType: z.ZodEnum<{
            PtrLst: "PtrLst";
            LstPtr: "LstPtr";
            Ref: "Ref";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MoveNodeRequest = z.infer<typeof moveNodeSchema>;
