/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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

import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
import { SpinalNode } from 'spinal-model-graph';
import { createErrorMsgItem } from './v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from './v2/errorHandler/EApiErrorType';

export async function loadAndValidateNodeMultiple(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  serverIds: number[],
  profileId: string,
  nodeType?: string
): Promise<{ successful: SpinalNode[]; failedServerIds: number[] }> {
  if (!Array.isArray(serverIds))
    throw createErrorMsgItem(
      EApiErrorType.INVALID_REQUEST,
      `Invalid input: serverIds should be an array of numbers`
    );

  const successfulNodes: SpinalNode[] = [];
  const failedServerIds: number[] = [];

  await Promise.allSettled(
    serverIds.map(async (serverId) => {
      if (
        (typeof serverId === 'number' && isNaN(serverId)) ||
        (typeof serverId === 'string' && isNaN(Number(serverId)))
      ) {
        failedServerIds.push(serverId);
        return;
      }
      try {
        const node = await loadAndValidateNode(
          spinalAPIMiddleware,
          serverId,
          profileId,
          nodeType
        );
        successfulNodes.push(node);
      } catch (error) {
        failedServerIds.push(serverId);
      }
    })
  );

  return { successful: successfulNodes, failedServerIds };
}

export async function loadAndValidateNode(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  serverId: number,
  profileId: string,
  nodeType?: string
) {
  if (
    (typeof serverId === 'number' && isNaN(serverId)) ||
    (typeof serverId === 'string' && isNaN(Number(serverId)))
  )
    throw createErrorMsgItem(
      EApiErrorType.INVALID_REQUEST,
      `Invalid dynamicId: ${serverId}`
    );

  const node = await safeLoadNode(spinalAPIMiddleware, serverId, profileId);
  if (!(node instanceof SpinalNode))
    throw createErrorMsgItem(
      EApiErrorType.INVALID_LOAD_NODE_TYPE,
      `Node ${serverId} is not a SpinalNode`
    );
  if (nodeType && node.info?.type?.get() !== nodeType)
    throw createErrorMsgItem(
      EApiErrorType.INVALID_LOAD_NODE_TYPE,
      `Node ${serverId} is not of type ${nodeType}`
    );
  return node;
}

async function safeLoadNode(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  serverId: number,
  profileId: string
) {
  try {
    return await spinalAPIMiddleware.load<SpinalNode>(serverId, profileId);
  } catch (error) {
    throw createErrorMsgItem(
      EApiErrorType.INVALID_LOAD_NODE_TYPE,
      `Error : Loading node ${serverId} failed`
    );
  }
}
