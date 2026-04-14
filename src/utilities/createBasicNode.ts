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

import type { SpinalNode } from 'spinal-model-graph';
import type { BasicNode } from '../routes/interface/BasicNode';
import type { BasicNodeExtended } from '../routes/interface/BasicNodeExtended';
import { awaitSync } from './awaitSync';

export async function createBasicNodeSync(node: SpinalNode): Promise<BasicNode>;
export async function createBasicNodeSync<Attr extends string[]>(
  node: SpinalNode,
  attrToAdd: Attr
): Promise<BasicNodeExtended<Attr>>;
export async function createBasicNodeSync<Attr extends string[] | undefined>(
  node: SpinalNode,
  attrToAdd?: Attr
): Promise<BasicNodeExtended<Attr> | BasicNode> {
  await awaitSync(node); // Wait for the _server_id to be assigned by hub
  return Array.isArray(attrToAdd)
    ? createBasicNode(node, attrToAdd)
    : createBasicNode(node);
}

export function createBasicNode(node: SpinalNode): BasicNode;
export function createBasicNode<Attr extends string[]>(
  node: SpinalNode,
  attrToAdd: Attr
): BasicNodeExtended<Attr>;
export function createBasicNode<Attr extends string[] | undefined>(
  node: SpinalNode,
  attrToAdd?: Attr
): BasicNodeExtended<Attr> | BasicNode {
  const res: BasicNode & Record<string, any> = {
    name: node.info.name.get(),
    staticId: node.info.id.get(),
    dynamicId: node._server_id!,
    type: node.info.type.get(),
  };

  // Ensure attrNames is an array of strings
  const attrNames = Array.isArray(attrToAdd) ? attrToAdd : ([] as string[]);

  // Add default attributes to the list of attributes to add
  attrNames.push('icon', 'bimFileId', 'dbid');

  if (attrToAdd) {
    for (const attr of attrNames) {
      if (node.info[attr]) {
        res[attr] = node.info[attr].get();
      }
    }
  }
  return res as BasicNodeExtended<Attr> | BasicNode;
}
