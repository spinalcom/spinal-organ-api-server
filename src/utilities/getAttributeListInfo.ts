import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import type { NodeAttribut } from '../routes/attributs/interfacesAttributs';
import type { SpinalNode } from 'spinal-model-graph';
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';

async function getAttributeListInfo(
  spinalAPIMiddleware: SpinalAPIMiddleware,
  dynamicId: number
): Promise<NodeAttribut[]> {
  const node: SpinalNode = await spinalAPIMiddleware.load(dynamicId);
  const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);

  const attributesPromises = childrens.map(
    async (child): Promise<NodeAttribut> => {
      const attributs = await child.element.load();
      return {
        dynamicId: child._server_id,
        staticId: child.getId().get(),
        name: child.getName().get(),
        type: child.getType().get(),
        attributs: attributs.get(),
      };
    }
  );

  return Promise.all(attributesPromises);
}

export { getAttributeListInfo };
export default getAttributeListInfo;
