/// <reference types="node" />
import { Application } from "express";
import { Server } from "http";
import { ISpinalAPIMiddleware } from "../interfaces";
export declare function runServerRest(server: Server, app: Application, spinalAPIMiddleware: ISpinalAPIMiddleware): void;
export * from "../interfaces";
