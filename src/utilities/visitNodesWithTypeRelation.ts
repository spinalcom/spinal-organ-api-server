/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

import { RelationSearch, SpinalNode } from 'spinal-model-graph';
import { consumeBatch } from 'spinal-model-graph/dist/Utilities';

type NodeType = string;
export type TRelationMap = Record<NodeType, RelationSearch>;

export async function* visitNodesWithTypeRelation(
  root: SpinalNode,
  relationMap: TRelationMap
): AsyncGenerator<SpinalNode<any>, void, void> {
  const seen: Set<SpinalNode<any>> = new Set([root]);
  let promises: (() => Promise<SpinalNode<any>[]>)[] = [];
  let nextGen: SpinalNode<any>[] = [root];
  let currentGen: SpinalNode<any>[] = [];

  while (nextGen.length) {
    currentGen = nextGen;
    promises = [];
    nextGen = [];

    for (const node of currentGen) {
      yield node;
      const nodeType = node.info.type.get();
      const relations = relationMap[nodeType];
      if (
        relations &&
        ((Array.isArray(relations) && relations.length > 0) ||
          !Array.isArray(relations))
      )
        promises.push(
          (): Promise<SpinalNode<any>[]> => node.getChildren(relations)
        );
    }

    const childrenArrays: SpinalNode<any>[][] = await consumeBatch(
      promises,
      30
    );

    for (const children of childrenArrays) {
      for (const child of children) {
        if (!seen.has(child)) {
          nextGen.push(child);
          seen.add(child);
        }
      }
    }
  }
}
