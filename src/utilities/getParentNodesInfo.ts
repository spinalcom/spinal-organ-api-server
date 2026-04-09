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
import type { ISpinalAPIMiddleware } from '../interfaces';
import type { BasicNode } from '../routes/interface/BasicNode';

async function getParentNodesInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number,
  relations?: string[],
  contextId?: number
): Promise<BasicNode[]> {
  const node: SpinalNode<any> = await spinalAPIMiddleware.load(
    dynamicId,
    profileId
  );
  let contextNode = undefined;

  if (contextId) {
    contextNode = await spinalAPIMiddleware.load(contextId, profileId);
  }

  let parents: SpinalNode<any>[];

  if (contextNode) {
    // children = await node.getChildrenInContext(contextNode, )
    parents = await node.getParentsInContext(contextNode, relations);
  } else {
    parents = await node.getParents(relations);
  }

  const parentsInfo: BasicNode[] = [];
  for (const parent of parents) {
    const info: BasicNode = {
      dynamicId: parent._server_id,
      staticId: parent.getId().get(),
      name: parent.getName().get(),
      type: parent.getType().get(),
    };
    parentsInfo.push(info);
  }
  return parentsInfo;
}

export { getParentNodesInfo };
export default getParentNodesInfo;
