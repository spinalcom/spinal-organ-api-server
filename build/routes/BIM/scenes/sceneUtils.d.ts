import { SpinalNode } from 'spinal-model-graph';
import { IScenesItemsItem } from './interfaces';
import { ISpinalAPIMiddleware } from '../../../interfaces';
declare function getScenes(spinalAPIMiddleware: ISpinalAPIMiddleware): Promise<SpinalNode<any>[]>;
declare function sceneGetItems(sceneNode: SpinalNode<any>, spinalAPIMiddleware: ISpinalAPIMiddleware): Promise<IScenesItemsItem[]>;
declare function getFolderPath(itemPath: string): string;
declare function isNodeId(node: SpinalNode<any>, id: string | number): boolean;
export { getScenes, sceneGetItems, getFolderPath, isNodeId };
