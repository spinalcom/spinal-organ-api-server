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

import type { SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { loadAndValidateNode } from '../../loadAndValidateNode';
import { groupManagerService } from 'spinal-env-viewer-plugin-group-manager-service';
import {
  createErrorMsgItem,
  isErrorItem,
} from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';
import type { IErrorItem } from '../../../routes/v2/interface/IErrorItem';

export async function linkNodeToGroups(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  node: SpinalNode,
  groups: { contextDynamicId: number; groupDynamicId: number }[]
) {
  const errors: IErrorItem[] = [];
  const success: { contextDynamicId: number; groupDynamicId: number }[] = [];
  for (const { contextDynamicId, groupDynamicId } of groups) {
    try {
      // load context and group nodes
      const [contextNode, groupNode] = await Promise.all([
        loadAndValidateNode(
          spinalAPIMiddleware,
          contextDynamicId,
          profileId,
          `${node.info.type.get()}GroupContext`
        ),
        loadAndValidateNode(
          spinalAPIMiddleware,
          contextDynamicId,
          profileId,
          `${node.info.type.get()}Group`
        ),
      ]);
      SpinalGraphService._addNode(contextNode);
      SpinalGraphService._addNode(groupNode);
      SpinalGraphService._addNode(node);
      try {
        await groupManagerService.linkElementToGroup(
          contextNode.info.id.get(),
          groupNode.info.id.get(),
          node.info.id.get()
        );
        success.push({ contextDynamicId, groupDynamicId });
      } catch (error) {
        throw createErrorMsgItem(
          EApiErrorType.ERROR_DATABASE,
          `Failed to link node to group with contextDynamicId ${contextDynamicId} and groupDynamicId ${groupDynamicId}`
        );
      }
    } catch (error) {
      if (isErrorItem(error)) {
        errors.push(error);
      } else {
        errors.push(
          createErrorMsgItem(
            EApiErrorType.INTERNAL_ERROR,
            `Unexpectedly failed to link node to group with contextDynamicId ${contextDynamicId} and groupDynamicId ${groupDynamicId}`
          )
        );
      }
    }
  }
  return { success, errors };
}
