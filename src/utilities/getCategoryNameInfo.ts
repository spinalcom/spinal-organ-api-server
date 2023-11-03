import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import { CategoriesAttribute } from '../routes/categoriesAttributs/interfacesCategoriesAtrtribut';
import { SpinalNode } from 'spinal-model-graph';

async function getCategoryNameInfo(
  spinalAPIMiddleware: SpinalAPIMiddleware,
  dynamicId: number,
  categoryName: string
) {
  let node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId);
  const result = await serviceDocumentation._categoryExist(node, categoryName);
  if (result === undefined) {
    throw new Error('category not found in node');
  } else {
    return {
      dynamicId: result._server_id,
      staticId: result.getId().get(),
      name: result.getName().get(),
      type: result.getType().get(),
    };
  }
}

export { getCategoryNameInfo };
export default getCategoryNameInfo;
