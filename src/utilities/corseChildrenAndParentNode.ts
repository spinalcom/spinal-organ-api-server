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

import { SpinalNode } from "spinal-model-graph";
import { Relation } from '../routes/nodes/interfacesNodes'



function childrensNode(node: SpinalNode<any>): Relation[] {
  let childs = node.children;
  let res = []
  // childrens relation course
  for (const [relationTypeName, relationTypeMap] of childs) {
    for (const [relationName, relation] of relationTypeMap) {
      let child = {
        dynamicId: relation._server_id,
        staticId: relation.getId().get(),
        name: relation.getName().get(),
        children_number: relation.getNbChildren()
      }
      res.push(child)

    }
  }
  return res;
}


async function parentsNode(node: SpinalNode<any>): Promise<Relation[]> {
  let parents = node.parents;
  let auxtab = [];
  let res = []
  for (const [, ptrList] of parents) {
    for (let i = 0; i < ptrList.length; i++) {
      auxtab.push(ptrList[i].load())
    }
  }
  res = await Promise.all(auxtab).then((values) => {
    return values.map((node) => {
      return { dynamicId: node._server_id, staticId: node.getId().get(), name: node.getName().get(), children_number: node.getNbChildren() }
    })
  })
  return res;

}

// async function classifyByTypeInContext(req, res) {
//   const [contextNode, startingNode] = await Promise.all([SpinalAPIMiddleware.load(req.params.contextId), SpinalAPIMiddleware.load(req.params.nodeId)])
//   const result = new Set()

//   await startingNode.findInContext(contextNode, (node) => {
//     result.add(node.info.type.get())
//     return false;
//   })
//   return Array.from(result);
// }
export { childrensNode, parentsNode };

