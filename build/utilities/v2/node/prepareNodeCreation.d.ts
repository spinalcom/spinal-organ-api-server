import { SpinalNode } from "spinal-model-graph";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { type ElementValue } from "./createElement";
export declare function prepareNodeCreation(name: string, type: string, info: Record<string, ElementValue | undefined>, element: Record<string, ElementValue> | undefined, attributes: Record<string, Record<string, string>> | undefined, defaults: Record<string, Record<string, string>> | undefined, middleware: ISpinalAPIMiddleware, profileId: string): Promise<SpinalNode>;
export declare function applyPreparedNode(target: SpinalNode, prepared: SpinalNode): Promise<void>;
