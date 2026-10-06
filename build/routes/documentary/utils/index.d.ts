import { ISpinalAPIMiddleware } from "../../../interfaces";
import { SpinalContext, SpinalGraph, SpinalNode } from "spinal-env-viewer-graph-service";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { SpinalDocument } from "spinal-env-viewer-plugin-documentation-service";
export declare function getHubUrl(spinalAPIMiddleware: ISpinalAPIMiddleware): string;
export declare const SERVER_ID_TIMEOUT_MS = 30000;
export declare function waitUntilServerIdNotDefined(node: any, timeoutMs?: number): Promise<boolean>;
export declare function hasDefinitiveServerId(node: any): boolean;
export declare function runExclusive<T>(key: string, task: () => Promise<T>): Promise<T>;
export declare function normalizeFileName(name: string): string;
export interface INameConflict {
    code: number;
    message: string;
}
export declare function toDocumentaryNode(loaded: SpinalNode | SpinalDocument | null | undefined): Promise<SpinalNode | null>;
export declare function reserveChildNames(parent: SpinalNode, names: string[]): Promise<{
    conflicts: (INameConflict | null)[];
    release: () => void;
}>;
export declare function _formatFileNode(node: SpinalNode | SpinalFile | SpinalDocument): any;
export declare function _formatFileVersion(version: any, fileName: string): any;
export declare function getFileAttributes(node: SpinalNode): Promise<any[]>;
export declare function getContexts(filenode: SpinalNode, graph: SpinalGraph): Promise<SpinalContext[]>;
export declare function getParents(node: SpinalNode, contexts: SpinalContext[]): Promise<any[]>;
