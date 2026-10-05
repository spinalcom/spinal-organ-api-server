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

import { Str, Val, Bool, type Lst } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-model-graph';
import type {
  INodeItem,
  INodeItemAttr,
  INodeItemAttrCat,
  INodeItemInfo,
} from '../../routes/interface/INodeItem';
import { awaitSync } from '../awaitSync';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalAttribute } from 'spinal-models-documentation';

export async function getNodeData(
  node: SpinalNode,
  info: true | string[],
  attr: Record<string, string[] | boolean> | boolean,
  addAttributesModificationDate?: boolean
): Promise<INodeItem> {
  const nodeInfo = extractNodeInfo(info, node);
  const nodeAttributes = await extractNodeAttr(
    node,
    attr,
    !!addAttributesModificationDate
  );

  await awaitSync(node); // Wait for the _server_id to be assigned by hub
  return {
    dynamicId: node._server_id!,
    info: nodeInfo,
    attributes: nodeAttributes,
  };
}

function extractNodeInfo(infoQuery: true | string[], node: SpinalNode<any>) {
  let nodeInfo: INodeItemInfo | undefined = undefined;
  if (infoQuery === true) {
    infoQuery = node.info._attribute_names
      .filter(
        (attrName) =>
          node.info[attrName] instanceof Str ||
          node.info[attrName] instanceof Val ||
          node.info[attrName] instanceof Bool
      )
      .map((attrName) => (attrName === 'id' ? 'staticId' : attrName));
  }
  if (Array.isArray(infoQuery) && infoQuery.length > 0) {
    nodeInfo = {};
    for (let key of infoQuery) {
      const originalKey = key;
      if (key === 'staticId') key = 'id';
      if (node.info[key] === undefined) continue;
      if (
        node.info[key] instanceof Str ||
        node.info[key] instanceof Val ||
        node.info[key] instanceof Bool
      ) {
        const value = node.info[key]?.get();
        nodeInfo[originalKey] = value;
      }
    }
    if (Object.keys(nodeInfo).length === 0) {
      nodeInfo = undefined;
    }
  }
  return nodeInfo;
}

async function extractNodeAttr(
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
