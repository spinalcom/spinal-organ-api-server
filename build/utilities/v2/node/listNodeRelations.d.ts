import { z } from 'zod';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { INodeItem } from '../../../routes/v2/openApiCompo/schemas/INodeItem';
export declare const relationsQuerySchema: z.ZodObject<{
    relationName: z.ZodOptional<z.ZodString>;
    relationType: z.ZodOptional<z.ZodEnum<{
        PtrLst: "PtrLst";
        LstPtr: "LstPtr";
        Ref: "Ref";
        LstPtrLst: "LstPtrLst";
    }>>;
    contextDynamicId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    info: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodString>;
    element: z.ZodOptional<z.ZodString>;
    filter: z.ZodOptional<z.ZodUnknown>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    'add-attributes-modification-date': z.ZodOptional<z.ZodCodec<z.ZodString, z.ZodBoolean>>;
}, z.core.$strict>;
export declare function listNodeRelations(middleware: ISpinalAPIMiddleware, profileId: string, nodeId: number, query: z.infer<typeof relationsQuerySchema>, grouped: boolean, direction: 'children' | 'parents'): Promise<{
    data: INodeItem[];
    offset: number;
    total: number;
} | {
    data: Record<string, Record<string, INodeItem[]>>;
    offset: number;
    total: number;
    parentDynamicId: number;
} | {
    data: Record<string, Record<string, INodeItem[]>>;
    offset: number;
    total: number;
    nodeDynamicId: number;
}>;
