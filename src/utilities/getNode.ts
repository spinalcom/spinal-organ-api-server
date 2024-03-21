/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import type { SpinalNode } from 'spinal-model-graph';
import { ISpinalAPIMiddleware } from 'src/interfaces';

async function getNode(spinalAPIMiddleware: ISpinalAPIMiddleware, dynamicId: string, staticId: string, profileId: string): Promise<SpinalNode | undefined> {
  if (dynamicId) {
    try {
      const node: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(dynamicId, 10), profileId
      );
      return node
    } catch (error) {
    }
  }

  if (staticId && typeof staticId === "string") {
    const node = SpinalGraphService.getRealNode(staticId);
    if (node !== undefined) {
      return node
    } else {
      const context = SpinalGraphService.getContext("spatial");
      if (context === undefined) {
        return undefined
      } else {
        const it = context.visitChildrenInContext(context);
        for await (const node of it) {
          if (node.info.id.get() === staticId) {
            return node
          }
        }
      }
    }

  }
}

export default getNode