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

import { z } from "zod";
import { SpinalContext, SpinalNode } from "spinal-model-graph";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { loadAndValidateNode } from "../../loadAndValidateNode";
import { filterNodes } from "./filterNodes";
import { getNodeData } from "./getNodeData";
import { parseInfoQuery } from "../requestParse/parseInfoQuery";
import { parseAttributesQuery } from "../requestParse/parseAttributesQuery";
import { parseFilterQuery } from "../requestParse/parseFilterQuery";
import { parseElementQuery } from "./getNodeElement";
import { createErrorMsgItem } from "../errorHandler/createErrorMsgItem";
import { EApiErrorType } from "../errorHandler/EApiErrorType";
import type { INodeItem } from "../../../routes/v2/openApiCompo/schemas/INodeItem";

export const relationsQuerySchema = z.strictObject({
  relationName: z
    .string()
    .trim()
    .min(1)
    .refine(
      (value) => value.split(",").every((name) => name.trim().length > 0),
      "relationName must contain nonempty comma-separated names"
    )
    .optional(),
  relationType: z.enum(["PtrLst", "LstPtr", "Ref", "LstPtrLst"]).optional(),
  contextDynamicId: z.coerce
    .number()
    .int()
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .optional(),
  info: z.string().optional(),
  attributes: z.string().optional(),
  element: z.string().optional(),
  filter: z.unknown().optional(),
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .default(0),
  "add-attributes-modification-date": z.stringbool().optional(),
});

export async function listNodeRelations(
  middleware: ISpinalAPIMiddleware,
  profileId: string,
  nodeId: number,
  query: z.infer<typeof relationsQuerySchema>,
  grouped: boolean,
  direction: "children" | "parents"
) {
  const filters = parseFilterQuery(query);
  const info = parseInfoQuery(query.info);
  const attributes = parseAttributesQuery(query.attributes);
  const element = parseElementQuery(query.element);
  const relationNames =
    query.relationName === undefined
      ? undefined
      : new Set(query.relationName.split(",").map((name) => name.trim()));
  const source = await loadAndValidateNode(middleware, nodeId, profileId);
  let context: SpinalContext | undefined;
  if (query.contextDynamicId !== undefined) {
    const loaded = await loadAndValidateNode(
      middleware,
      query.contextDynamicId,
      profileId
    );
    if (!(loaded instanceof SpinalContext))
      throw createErrorMsgItem(
        EApiErrorType.INVALID_LOAD_NODE_TYPE,
        "contextDynamicId must identify a SpinalContext"
      );
    context = loaded;
  }
  interface Entry {
    node: SpinalNode;
    parentId: number;
    relationType: string;
    relationName: string;
  }
  const metadata = new Map<{ node: SpinalNode; parentId: number }, Entry>();
  const seen = new Set<string>();
  const accessible = new Map<number, SpinalNode>();
  function supportsType(type: string): boolean {
    if (type === "LstPtrLst")
      console.warn(
        `[listNodeRelations] Skipping unsupported relation type LstPtrLst on node ${nodeId}`
      );
    return (
      ["PtrLst", "LstPtr", "Ref"].includes(type) &&
      (query.relationType === undefined || query.relationType === type)
    );
  }
  async function* relatedNodes() {
    if (direction === "parents") {
      if (context && !source.belongsToContext(context)) return;
      for (const name of source.parents.keys()) {
        if (relationNames && !relationNames.has(name)) continue;
        const pointers = source.parents.getElement(name);
        for (let index = 0; index < pointers.length; index++) {
          const pointer = pointers[index];
          // Pointer metadata allows unsupported relations to be skipped without loading.
          const type = pointer.getType().get();
          if (!supportsType(type)) continue;
          const relation = await pointer.load();
          if (context && !relation.belongsToContext(context)) continue;
          const node = await relation.getParent();
          if (!(node instanceof SpinalNode))
            throw createErrorMsgItem(
              EApiErrorType.INTERNAL_ERROR,
              "Relation has no valid parent"
            );
          if (context && !node.belongsToContext(context)) continue;
          yield { node, relationType: type, relationName: name };
        }
      }
      return;
    }
    for (const type of source.children.keys()) {
      if (!supportsType(type)) continue;
      const relations = source.children.getElement(type);
      for (const name of relations.keys()) {
        if (relationNames && !relationNames.has(name)) continue;
        const relation = relations.getElement(name);
        if (context && !relation.belongsToContext(context)) continue;
        const children = context
          ? await relation.getChildrenInContext(context)
          : await relation.getChildren();
        for (const child of children) {
          yield { node: child, relationType: type, relationName: name };
        }
      }
    }
  }
  async function* entries(): AsyncGenerator<Entry> {
    for await (const related of relatedNodes()) {
      const id = related.node.getId().get();
      if (!grouped && seen.has(id)) continue;
      seen.add(id);
      const dynamicId = related.node._server_id;
      if (!dynamicId)
        throw createErrorMsgItem(
          EApiErrorType.INTERNAL_ERROR,
          "Related node has no dynamic ID"
        );
      let node = accessible.get(dynamicId);
      if (!node) {
        node = await loadAndValidateNode(middleware, dynamicId, profileId);
        accessible.set(dynamicId, node);
      }
      const entry = {
        node,
        parentId: direction === "children" ? nodeId : dynamicId,
        relationType: related.relationType,
        relationName: related.relationName,
      };
      metadata.set(entry, entry);
      yield entry;
    }
  }
  const page = await filterNodes(entries(), filters, query.offset);
  const items = await Promise.all(
    page.map(({ node }) =>
      getNodeData(
        node,
        info,
        attributes,
        query["add-attributes-modification-date"],
        direction === "children" ? nodeId : undefined,
        element
      )
    )
  );
  if (!grouped)
    return { data: items, offset: query.offset, total: items.length };
  const data: Record<string, Record<string, INodeItem[]>> = Object.create(null);
  page.forEach((entry, index) => {
    const { relationType, relationName } = metadata.get(entry)!;
    if (!data[relationType]) data[relationType] = Object.create(null);
    if (!data[relationType][relationName])
      data[relationType][relationName] = [];
    data[relationType][relationName].push(items[index]);
  });
  return {
    ...(direction === "children"
      ? { parentDynamicId: nodeId }
      : { nodeDynamicId: nodeId }),
    data,
    offset: query.offset,
    total: items.length,
  };
}
