import * as express from 'express';
import { ISpinalAPIMiddleware } from "../interfaces";
declare function routes(logger: any, app: express.Application, spinalAPIMiddleware: ISpinalAPIMiddleware): void;
export default routes;
