/// <reference types="node" />
import { Application } from 'express';
import { Server } from 'http';
import { ISpinalAPIMiddleware } from '../interfaces';
import { ISpinalIOMiddleware } from 'spinal-organ-api-pubsub';
export declare function runServerRest(server: Server, app: Application, spinalAPIMiddleware: ISpinalAPIMiddleware, spinalIOMiddleware: ISpinalIOMiddleware, log_body?: boolean): Promise<{
    app: Application;
    io: any;
}>;
export * from '../interfaces';
