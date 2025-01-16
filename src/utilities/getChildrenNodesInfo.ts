import type { SpinalNode } from 'spinal-model-graph';
import { ISpinalAPIMiddleware } from '../interfaces';
import { BasicNode } from '../routes/nodes/interfacesNodes'


async function getChildrenNodesInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number,
  relations?: string[],
  contextId? : number
)  : Promise<BasicNode[]>{
    // if we have a contextId we will get the children in the context.
    // Additionally , if we have relations we will restrict the children to the relations


    let contextNode = undefined;

    if(contextId){
      contextNode = await spinalAPIMiddleware.load(contextId);
    }
    const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
    let children = await node.getChildren(relations);
    if(contextNode){
      children = children.filter( (child) => {
        return child.belongsToContext(contextNode);
      })
    }
    const childrenInfo: BasicNode[] = [];
    for (const child of children) {
      const info : BasicNode = {
        dynamicId: child._server_id,
        staticId: child.getId().get(),
        name: child.getName().get(),
        type: child.getType().get(),
      };
      childrenInfo.push(info);
    }
    return childrenInfo;


}

export { getChildrenNodesInfo };
export default getChildrenNodesInfo;
