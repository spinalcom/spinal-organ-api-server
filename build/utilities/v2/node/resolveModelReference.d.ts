import { Model } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-model-graph';
export declare function isModelReferencePath(path: string): boolean;
export declare function resolveModelReference(node: SpinalNode, path: string): Promise<Model>;
