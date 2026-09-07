import type { SpinalContext } from 'spinal-model-graph';
export declare function getUserFromContextGen(userContext: SpinalContext, offset?: number): AsyncGenerator<{
    userNode: import("spinal-model-graph").SpinalNode<any>;
    hasMore: boolean;
}, void, unknown>;
