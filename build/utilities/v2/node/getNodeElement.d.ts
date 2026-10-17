import type { SpinalNode } from "spinal-model-graph";
import type { ElementJson } from "../../../routes/v2/openApiCompo/schemas/INodeItem";
import type { ElementQuery } from "../requestParse/parseElementQuery";
export type { ElementJson } from "../../../routes/v2/openApiCompo/schemas/INodeItem";
export { parseElementQuery, type ElementQuery, } from "../requestParse/parseElementQuery";
export { serializeModel } from "./element/serializeModel";
export declare function getNodeElement(node: SpinalNode, query: ElementQuery): Promise<ElementJson | undefined>;
