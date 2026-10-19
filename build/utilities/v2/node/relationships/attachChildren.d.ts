import type { z } from 'zod';
import type { ISpinalAPIMiddleware } from '../../../../interfaces';
import type { IErrorItem } from '../../../../routes/v2/openApiCompo/schemas/IErrorItem';
import type { childAttachmentSchema } from './schemas';
type ChildAttachment = z.infer<typeof childAttachmentSchema>;
export declare function attachChildren(middleware: ISpinalAPIMiddleware, profileId: string, parentId: number, children: ChildAttachment[]): Promise<{
    data: ({
        childDynamicId: number;
        relationName: string;
        relationType: "PtrLst" | "LstPtr" | "Ref";
        contextDynamicId?: number;
    } & {
        index: number;
        parentDynamicId: number;
        status: "attached" | "alreadyAttached";
    })[];
    errors: (IErrorItem & {
        index: number;
        child: ChildAttachment;
    })[];
}>;
export {};
