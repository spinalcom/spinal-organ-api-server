/// <reference types="node" />
import { Server } from 'http';
import { FileSystem, type Model, type Ptr, File, type Pbr } from 'spinal-core-connectorjs';
import type { SpinalGraph } from 'spinal-model-graph';
import type { IConfig } from 'src/interfaces';
import type { ISpinalAPIMiddleware } from './interfaces/ISpinalAPIMiddleware';
import { SpinalIOMiddleware } from './spinalIOMiddleware';
import { Server as SocketServer } from 'socket.io';
declare class SpinalAPIMiddleware implements ISpinalAPIMiddleware {
    static instance: SpinalAPIMiddleware;
    loadedPtr: Map<number, Model>;
    conn: FileSystem;
    iteratorGraph: AsyncGenerator<SpinalGraph>;
    config: IConfig;
    static getInstance(): SpinalAPIMiddleware;
    constructor();
    private geneGraph;
    getGraph(): Promise<SpinalGraph>;
    getProfileGraph(): Promise<SpinalGraph>;
    load<T extends Model>(server_id: number): Promise<T>;
    loadPtr<T extends Model>(ptr: File<T> | Ptr<T> | Pbr<T>): Promise<T>;
    runSocketServer(server: Server, spinalIOMiddleware?: SpinalIOMiddleware): Promise<SocketServer>;
    _waitConnection(): Promise<void>;
}
export default SpinalAPIMiddleware;
