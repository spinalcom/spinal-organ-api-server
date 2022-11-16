import { SpinalNode } from 'spinal-model-graph';
import { IScenesItemsItem } from './interfaces';
declare function getScenes(): Promise<SpinalNode<any>[]>;
declare function sceneGetItems(sceneNode: SpinalNode<any>): Promise<IScenesItemsItem[]>;
declare function getFolderPath(itemPath: string): string;
declare function isNodeId(node: SpinalNode<any>, id: string | number): boolean;
export { getScenes, sceneGetItems, getFolderPath, isNodeId };
