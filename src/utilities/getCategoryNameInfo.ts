import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import { CategoriesAttribute } from '../routes/categoriesAttributs/interfacesCategoriesAttribute';
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
async function getCategoryNamesInfo(
  spinalAPIMiddleware: SpinalAPIMiddleware,
  dynamicId: number,
  categoryNames: string[]
) {
  let node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId);
  const result = [];
  for (const categoryName of categoryNames) {
    const categoryNode = await serviceDocumentation._categoryExist(
      node,
      categoryName
    );
    if (categoryNode === undefined) {
      throw new Error('category not found in node');
    } else {
      result.push({
        dynamicId: categoryNode._server_id,
        staticId: categoryNode.getId().get(),
        name: categoryNode.getName().get(),
        type: categoryNode.getType().get(),
      });
    }
  }
  return result;
}
export { getCategoryNameInfo, getCategoryNamesInfo };
