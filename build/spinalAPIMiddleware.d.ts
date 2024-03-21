/// <reference types="node" />
import { Server } from 'http';
import { SpinalGraph } from 'spinal-model-graph';
import { IConfig } from 'src/interfaces';
import { ISpinalAPIMiddleware } from './interfaces/ISpinalAPIMiddleware';
import { SpinalIOMiddleware } from './spinalIOMiddleware';
import { Server as SocketServer } from 'socket.io';
declare class SpinalAPIMiddleware implements ISpinalAPIMiddleware {
    static instance: SpinalAPIMiddleware;
    loadedPtr: Map<number, any>;
    conn: spinal.FileSystem;
    iteratorGraph: AsyncGenerator<SpinalGraph<any>, never, unknown>;
    config: IConfig;
    static getInstance(): SpinalAPIMiddleware;
    constructor();
    private geneGraph;
    getGraph(): Promise<SpinalGraph<any>>;
    getProfileGraph(): Promise<SpinalGraph>;
    load<T extends spinal.Model>(server_id: number): Promise<T>;
    loadPtr<T extends spinal.Model>(ptr: spinal.File<T> | spinal.Ptr<T> | spinal.Pbr<T>): Promise<T>;
    runSocketServer(server: Server, spinalIOMiddleware?: SpinalIOMiddleware): Promise<SocketServer>;
    _waitConnection(): Promise<boolean>;
}
export default SpinalAPIMiddleware;
