import { Model } from "spinal-core-connectorjs";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import type { ElementValue } from "./element/schema";
export { elementKey, elementValue, elementObject, type ElementValue, } from "./element/schema";
export declare function createElement(data: Record<string, ElementValue>, middleware: ISpinalAPIMiddleware, profileId: string, self?: (path: string) => Promise<Model>, build?: (value: ElementValue, path: string[], resolve: () => Promise<Model>) => Promise<Model>): Promise<Model>;
