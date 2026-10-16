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

import type { Lst } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-model-graph';
import type { INodeItem } from '../../../routes/v2/openApiCompo/schemas/INodeItem';
import type { INodeItemAttrCat } from '../../../routes/v2/openApiCompo/schemas/INodeItemAttrCat';
import type { INodeItemAttr } from '../../../routes/v2/openApiCompo/schemas/INodeItemAttr';
import type { INodeItemInfo } from '../../../routes/v2/openApiCompo/schemas/INodeItemInfo';
import { awaitSync } from '../../awaitSync';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalAttribute } from 'spinal-models-documentation';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';
import { getNodeElement, serializeModel, parseElementQuery, type ElementQuery } from './getNodeElement';

export async function getNodeData(
  node: SpinalNode,
  info: true | string[],
  attr: Record<string, string[] | boolean> | boolean,
  addAttributesModificationDate?: boolean,
  parentDynamicId?: number,
  parsedElementQuery?: ElementQuery
): Promise<INodeItem> {
  const nodeInfo = extractNodeInfo(info, node);
  const nodeAttributes = await extractNodeAttr(
    node,
    attr,
    !!addAttributesModificationDate
  );

  const element = await getNodeElement(node, parsedElementQuery ?? false);
  await awaitSync(node); // Wait for the _server_id to be assigned by hub
  return {
    dynamicId: node._server_id!,
    parentDynamicId,
    info: nodeInfo,
    attributes: nodeAttributes,
    ...(element === undefined ? {} : { element }),
  };
}

export function extractNodeInfo(infoQuery: true | string[], node: SpinalNode<any>) {
  if (infoQuery !== true && infoQuery.length === 0) return undefined;
  const paths = infoQuery === true ? true : infoQuery.map((field) => {
    const parsed = parseElementQuery(field);
    if (!Array.isArray(parsed) || parsed.length !== 1) {
      throw createErrorMsgItem(EApiErrorType.INVALID_REQUEST, 'Invalid info field path');
    }
    const path = parsed[0];
    if (path[0] === 'staticId') path[0] = 'id';
    return path;
  });
  const value = serializeModel(node.info, paths);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const result: INodeItemInfo = value;
  if (Object.hasOwn(result, 'id')) {
    result.staticId = result.id;
    delete result.id;
  }
  return Object.keys(result).length ? result : undefined;
}

export async function extractNodeAttr(
  node: SpinalNode,
  attrQuery: boolean | Record<string, string[] | boolean> | undefined,
  addAttributesModificationDate: boolean
): Promise<INodeItemAttr | undefined> {
  if (attrQuery === false) return undefined;
  let nodeAttributes: INodeItemAttr | undefined = undefined;
  let catToGet: SpinalNode[] = [];
  const catNodes = await node.getChildren(NODE_TO_CATEGORY_RELATION);

  if (attrQuery === true) {
    catToGet = catNodes;
  } else if (typeof attrQuery === 'object' && attrQuery !== null) {
    const catNames = Object.keys(attrQuery);
    catToGet = catNodes.filter((catNode) =>
      catNames.includes(catNode.getName().get())
    );
  }
  let typedAttrQuery = attrQuery as Record<
    string,
    string[] | boolean | undefined
  >;
  const categoryResults = await Promise.all(
    catToGet.map(async (category) => {
      const categoryName = category.getName().get();
      const attrQuery =
        typeof typedAttrQuery === 'boolean'
          ? typedAttrQuery
          : typedAttrQuery[categoryName];
      const cat = await extractNodeAttrCat(
        category,
        attrQuery,
        addAttributesModificationDate
      );

      if (cat && Object.keys(cat).length > 0) {
        return [categoryName, cat] as const;
      }
      return undefined;
    })
  );

  for (const categoryResult of categoryResults) {
    if (!categoryResult) continue;
    if (!nodeAttributes) nodeAttributes = {};
    const [categoryName, cat] = categoryResult;
    nodeAttributes[categoryName] = cat;
  }

  return nodeAttributes;
}

async function extractNodeAttrCat(
  nodeAttrCat: SpinalNode,
  typedAttrQuery: boolean | string[] | undefined,
  addAttributesModificationDate: boolean
): Promise<INodeItemAttrCat | undefined> {
  if (typedAttrQuery === undefined) return undefined;
  const result: INodeItemAttrCat = {};
  const attrLst: Lst<SpinalAttribute> = await nodeAttrCat.getElement(true);
  let attrNamesToGet: string[] = [];
  if (typeof typedAttrQuery === 'boolean') {
    if (typedAttrQuery === false) return undefined;
    if (typedAttrQuery === true)
      for (const attr of attrLst) attrNamesToGet.push(attr.label.get());
  } else if (Array.isArray(typedAttrQuery)) {
    attrNamesToGet = typedAttrQuery as string[];
  }
  for (const attr of attrLst) {
    const label = attr.label.get();
    if (!attrNamesToGet.includes(label)) continue;
    const value = attr.value.get();
    const lastModification = attr.lastModificationDate?.get();
    result[label] = addAttributesModificationDate
      ? { value, lastModification }
      : value;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
