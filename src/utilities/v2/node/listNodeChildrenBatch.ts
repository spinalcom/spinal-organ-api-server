/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { loadAndValidateNode } from '../../loadAndValidateNode';
import { filterNodes } from './filterNodes';
import { getNodeData } from './getNodeData';
import { parseInfoQuery } from '../requestParse/parseInfoQuery';
import { parseAttributesQuery } from '../requestParse/parseAttributesQuery';
import { parseFilterQuery } from '../requestParse/parseFilterQuery';
import { parseElementQuery } from '../requestParse/parseElementQuery';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';

const SUPPORTED_RELATION_TYPES = ['PtrLst', 'LstPtr', 'Ref'];

export interface IBatchChildrenQuery {
  parentIds: number[];
  relationType?: 'PtrLst' | 'LstPtr' | 'Ref';
  relationNames?: string[];
  contextDynamicId?: number;
  info?: string;
  attributes?: string;
  element?: string;
  filter?: unknown;
  offset: number;
  addAttributesModificationDate?: boolean;
}

/**
 * Lists the distinct direct children of several parents in one page.
 * Each parent's children are deduplicated on their own, as in GET children.
 * Filters and `offset` apply to the combined sequence, and each item carries
 * the `parentDynamicId` it was found under.
 */
export async function listNodeChildrenBatch(
  middleware: ISpinalAPIMiddleware,
  profileId: string,
  query: IBatchChildrenQuery
) {
  const filters = parseFilterQuery({ filter: query.filter });
  const info = parseInfoQuery(query.info);
  const attributes = parseAttributesQuery(query.attributes);
  const element = parseElementQuery(query.element);
  const relationNames = query.relationNames
    ? new Set(query.relationNames)
    : undefined;

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
        'contextDynamicId must identify a SpinalContext'
      );
    context = loaded;
  }

  const loadedNodes = new Map<number, SpinalNode>();
  async function loadChild(dynamicId: number): Promise<SpinalNode> {
    let node = loadedNodes.get(dynamicId);
    if (!node) {
      node = await loadAndValidateNode(middleware, dynamicId, profileId);
      loadedNodes.set(dynamicId, node);
    }
    return node;
  }

  async function* childEntries() {
    for (const parentId of query.parentIds) {
      const source = await loadAndValidateNode(middleware, parentId, profileId);
      const seen = new Set<string>();
      for (const type of source.children.keys()) {
        if (!SUPPORTED_RELATION_TYPES.includes(type)) continue;
        if (query.relationType !== undefined && query.relationType !== type)
          continue;
        const relations = source.children.getElement(type);
        for (const name of relations.keys()) {
          if (relationNames && !relationNames.has(name)) continue;
          const relation = relations.getElement(name);
          if (context && !relation.belongsToContext(context)) continue;
          const children = context
            ? await relation.getChildrenInContext(context)
            : await relation.getChildren();
          for (const child of children) {
            const id = child.getId().get();
            if (seen.has(id)) continue;
            seen.add(id);
            const dynamicId = child._server_id;
            if (!dynamicId)
              throw createErrorMsgItem(
                EApiErrorType.INTERNAL_ERROR,
                'Related node has no dynamic ID'
              );
            yield { node: await loadChild(dynamicId), parentId };
          }
        }
      }
    }
  }

  const page = await filterNodes(childEntries(), filters, query.offset);
  const items = await Promise.all(
    page.map(({ node, parentId }) =>
      getNodeData(
        node,
        info,
        attributes,
        query.addAttributesModificationDate,
        parentId,
        element
      )
    )
  );
  return { data: items, offset: query.offset, total: items.length };
}
