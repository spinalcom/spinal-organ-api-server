/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import type { NodeAttribut } from '../routes/interface/NodeAttribut';
import type { SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../interfaces';

async function getAttributeListInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number
): Promise<NodeAttribut[]> {
  const node: SpinalNode = await spinalAPIMiddleware.load(dynamicId, profileId);
  const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);

  const attributesPromises = childrens.map(
    async (child): Promise<NodeAttribut> => {
      const attributs = await child.element?.load();
      const attributes = [];
      for (const attribute of attributs) {
        const attrib = attribute.get();
        attributes.push({
          ...attrib,
          dynamicId: attribute._server_id,
          label: attribute.label.get(),
          value: attribute.value.get(),
        });
      }
      return {
        dynamicId: child._server_id!,
        staticId: child.getId().get(),
        name: child.getName().get(),
        type: child.getType().get(),
        attributs: attributes,
      };
    }
  );

  return Promise.all(attributesPromises);
}

export { getAttributeListInfo };
export default getAttributeListInfo;
