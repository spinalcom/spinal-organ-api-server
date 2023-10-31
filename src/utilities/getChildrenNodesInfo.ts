import type { SpinalNode } from 'spinal-model-graph';
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import { BasicNode } from '../routes/nodes/interfacesNodes'


async function getChildrenNodesInfo(
  dynamicId: number,
  spinalAPIMiddleware: SpinalAPIMiddleware,
  relations?: string[]
)  : Promise<BasicNode[]>{
    const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId);
    const children = await node.getChildren(relations);
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
