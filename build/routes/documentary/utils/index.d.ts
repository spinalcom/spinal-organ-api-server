import { ISpinalAPIMiddleware } from "../../../interfaces";
import { SpinalNode } from "spinal-env-viewer-graph-service";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { SpinalDocument } from "spinal-env-viewer-plugin-documentation-service";
export declare function getHubUrl(spinalAPIMiddleware: ISpinalAPIMiddleware): string;
export declare function waitUntilServerIdNotDefined(node: any): Promise<boolean>;
export declare function _formatFileNode(node: SpinalNode | SpinalFile | SpinalDocument): any;
export declare function _formatFileVersion(version: any, fileName: string): any;
