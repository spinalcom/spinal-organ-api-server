import type { SpinalNode } from 'spinal-model-graph';
import { ISpinalAPIMiddleware } from '../interfaces';
import { BasicNode } from '../routes/nodes/interfacesNodes'


async function getParentNodesInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number,
  relations?: string[]
)  : Promise<BasicNode[]>{
    const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
    const children = await node.getParents(relations);
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

export { getParentNodesInfo };
export default getParentNodesInfo;
