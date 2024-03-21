import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { ISpinalAPIMiddleware } from '../interfaces';
import { CategoriesAttribute } from '../routes/categoriesAttributs/interfacesCategoriesAttribute';
import { SpinalNode } from 'spinal-model-graph';

async function getCategoryNameInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number,
  categoryName: string
) {
  const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
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
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number,
  categoryNames: string[]
) {
  const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
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
