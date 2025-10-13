import type { SpinalNode } from 'spinal-model-graph';
import { ISpinalAPIMiddleware } from '../interfaces';
import { BasicNode } from '../routes/nodes/interfacesNodes'


async function getParentNodesInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number,
  relations?: string[],
  contextId? : number
)  : Promise<BasicNode[]>{
    const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
    let contextNode = undefined;

    if(contextId){
      contextNode = await spinalAPIMiddleware.load(contextId,profileId);
    }

    let parents: SpinalNode<any>[];

    if (contextNode) {
      // children = await node.getChildrenInContext(contextNode, )
      parents = await node.getParentsInContext(contextNode, relations);
    }
    else {
      parents = await node.getParents(relations);
    }

    const parentsInfo: BasicNode[] = [];
    for (const parent of parents) {
      const info : BasicNode = {
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
