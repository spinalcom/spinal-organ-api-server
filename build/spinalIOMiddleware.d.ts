import { Middleware, IConfig } from 'spinal-organ-api-pubsub';
import { SpinalGraph } from 'spinal-model-graph';
export declare class SpinalIOMiddleware extends Middleware {
    constructor(connect?: spinal.FileSystem, argConfig?: IConfig);
    getGraph(): Promise<SpinalGraph>;
    getProfileGraph(): Promise<SpinalGraph>;
}
