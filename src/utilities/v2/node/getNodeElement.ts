/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import type { Model } from "spinal-core-connectorjs";
import type { SpinalNode } from "spinal-model-graph";
import type { ElementJson } from "../../../routes/v2/openApiCompo/schemas/INodeItem";
import type { ElementQuery } from "../requestParse/parseElementQuery";
import { serializeModel } from "./element/serializeModel";

export type { ElementJson } from "../../../routes/v2/openApiCompo/schemas/INodeItem";
export {
  parseElementQuery,
  type ElementQuery,
} from "../requestParse/parseElementQuery";
export { serializeModel } from "./element/serializeModel";

export async function getNodeElement(
  node: SpinalNode,
  query: ElementQuery
): Promise<ElementJson | undefined> {
  if (query === false) return undefined;
  const element: Model | undefined = await node.getElement(true);
  if (element === undefined) return null;
  return serializeModel(element, query);
}
