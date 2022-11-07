/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { ContextTree } from '../routes/contexts/interfacesContexts'

async function recTree(node: SpinalNode<any>, context: SpinalContext<any> = node): Promise<ContextTree[]> {
  const childrenIds = await node.getChildrenInContext(context);
  if (childrenIds.length > 0) {
    var promises: Promise<ContextTree>[] = childrenIds.map(async (realnode) => {
      const name = realnode.getName();
      const type = realnode.getType();
      return {
        dynamicId: realnode._server_id,
        staticId: realnode.getId().get(),
        name: name ? name.get() : undefined,
        type: type ? type.get() : undefined,
        children: await recTree(realnode, context)
      };
    });
    return Promise.all(promises);
  } else {
    return [];
  }
}



async function recTreeDetails(node: SpinalNode<any>, context: SpinalContext<any> = node): Promise<ContextTree[]> {
  const childrenIds = await node.getChildrenInContext(context);
  if (childrenIds.length > 0) {
    var promises: Promise<ContextTree>[] = childrenIds.map(async (realnode) => {
      const name = realnode.getName();
      const type = realnode.getType();
      if (type.get() === "geographicFloor") {
        realnode
      }
      return {
        dynamicId: realnode._server_id,
        staticId: realnode.getId().get(),
        name: name ? name.get() : undefined,
        type: type ? type.get() : undefined,
        children: await recTree(realnode, context)
      };
    });
    return Promise.all(promises);
  } else {
    return [];
  }
}





async function recTreeDepth(node: SpinalNode<any>, context: SpinalContext<any> = node, depth: number): Promise<ContextTree[]> {
  const childrenIds = await node.getChildrenInContext(context);

  if (childrenIds.length > 0 && depth > 0) {

    var promises: Promise<ContextTree>[] = childrenIds.map(async (realnode) => {
      const name = realnode.getName();
      const type = realnode.getType();
      var info = {
        dynamicId: realnode._server_id,
        staticId: realnode.getId().get(),
        name: name ? name.get() : undefined,
        type: type ? type.get() : undefined,
        children: await recTreeDepth(realnode, context, depth - 1)
      };
      return info;
    });
    return Promise.all(promises);


  } else {
    return [];
  }
}

export { recTree, recTreeDepth }
