import * as express from 'express';
import type SpinalAPIMiddleware from './spinalAPIMiddleware';
export declare function useLogger(app: express.Application, log_body: boolean | string): void;
declare function APIServer(logger: any, spinalAPIMiddleware: SpinalAPIMiddleware): express.Express;
export default APIServer;
