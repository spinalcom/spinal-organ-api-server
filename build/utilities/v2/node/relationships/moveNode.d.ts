import type { ISpinalAPIMiddleware } from "../../../../interfaces";
import type { MoveNodeRequest } from "./schemas";
export declare function moveNode(middleware: ISpinalAPIMiddleware, profileId: string, nodeId: number, { from, to }: MoveNodeRequest): Promise<{
    data: {
        nodeDynamicId: number;
        status: "moved" | "alreadyMoved" | "unchanged";
        destinationAction: "attached" | "alreadyAttached" | "unchanged";
        sourceAction: "detached" | "alreadyDetached" | "unchanged";
    };
}>;
