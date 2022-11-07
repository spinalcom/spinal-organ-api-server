import * as express from 'express';
import SpinalAPIMiddleware from '../spinalAPIMiddleware';
declare function routes(logger: any, app: express.Express, spinalAPIMiddleware: SpinalAPIMiddleware): void;
export default routes;
