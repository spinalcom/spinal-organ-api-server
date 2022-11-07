/// <reference types="node" />
import { Server } from 'http';
import { SpinalGraph } from 'spinal-model-graph';
declare class SpinalAPIMiddleware {
    static instance: SpinalAPIMiddleware;
    loadedPtr: Map<number, any>;
    conn: spinal.FileSystem;
    iteratorGraph: AsyncGenerator<SpinalGraph<any>, never, unknown>;
    static getInstance(): SpinalAPIMiddleware;
    constructor();
    private geneGraph;
    getGraph(): Promise<SpinalGraph<any>>;
    load<T extends spinal.Model>(server_id: number): Promise<T>;
    loadPtr<T extends spinal.Model>(ptr: spinal.File<T> | spinal.Ptr<T> | spinal.Pbr<T>): Promise<T>;
    runSocketServer(server: Server): void;
    _waitConnection(): Promise<Boolean>;
}
export default SpinalAPIMiddleware;
