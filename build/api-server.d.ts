/// <reference types="node" />
import * as express from 'express';
import type SpinalAPIMiddleware from './spinalAPIMiddleware';
export declare function createLogRequestLifecycle(log_body: boolean): (req: express.Request, res: express.Response, next: express.NextFunction) => void;
export declare const morganMiddleware: (req: import("http").IncomingMessage, res: import("http").ServerResponse, callback: (err?: Error) => void) => void;
export declare function useLogger(app: express.Application, log_body: boolean | string): void;
declare function APIServer(logger: any, spinalAPIMiddleware: SpinalAPIMiddleware): express.Express;
export default APIServer;
