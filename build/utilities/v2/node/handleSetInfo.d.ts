import type { SpinalNode } from 'spinal-model-graph';
import { Model } from 'spinal-core-connectorjs';
import { type ElementValue } from './createElement';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
export declare function resolveInfo(info: Record<string, ElementValue | undefined>, middleware: ISpinalAPIMiddleware, profileId: string): Promise<Model>;
export declare function handleSetInfo(node: SpinalNode, info: Record<string, ElementValue | undefined> | Model | undefined, middleware?: ISpinalAPIMiddleware, profileId?: string): Promise<void>;
