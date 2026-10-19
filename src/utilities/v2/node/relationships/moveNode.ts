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

import { SpinalContext } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../../interfaces';
import { loadAndValidateNode } from '../../../loadAndValidateNode';
import { createErrorMsgItem } from '../../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../errorHandler/EApiErrorType';
import type { MoveNodeRequest } from './schemas';

export async function moveNode(
  middleware: ISpinalAPIMiddleware,
  profileId: string,
  nodeId: number,
  { from, to }: MoveNodeRequest
) {
  if (to.parentDynamicId === nodeId)
    throw createErrorMsgItem(
      EApiErrorType.INVALID_REQUEST,
      'Destination parent cannot be the moved node'
    );
  const node = await loadAndValidateNode(middleware, nodeId, profileId);
  const source = await loadAndValidateNode(
    middleware,
    from.parentDynamicId,
    profileId
  );
  const destination =
    from.parentDynamicId === to.parentDynamicId
      ? source
      : await loadAndValidateNode(middleware, to.parentDynamicId, profileId);
  let context: SpinalContext | undefined;
  if (to.contextDynamicId !== undefined) {
    const loaded = await loadAndValidateNode(
      middleware,
      to.contextDynamicId,
      profileId
    );
    if (!(loaded instanceof SpinalContext))
      throw createErrorMsgItem(
        EApiErrorType.INVALID_LOAD_NODE_TYPE,
        'contextDynamicId must identify a SpinalContext'
      );
    context = loaded;
  }
  const sourceRelation = source.children
    .getElement(from.relationType)
    ?.getElement(from.relationName);
  const destinationRelation = destination.children
    .getElement(to.relationType)
    ?.getElement(to.relationName);
  const sourceExists =
    sourceRelation?.getChildrenIds().includes(node.getId().get()) ?? false;
  const destinationExists =
    destinationRelation?.getChildrenIds().includes(node.getId().get()) ?? false;
  if (
    destinationExists &&
    context &&
    !(
      destinationRelation!.belongsToContext(context) &&
      node.belongsToContext(context)
    )
  )
    throw createErrorMsgItem(
      EApiErrorType.INVALID_REQUEST,
      'Destination link exists but does not satisfy the requested context membership'
    );
  if (!sourceExists && !destinationExists)
    throw createErrorMsgItem(
      EApiErrorType.INVALID_REQUEST,
      'Source link is absent and destination link is absent'
    );
  const sameLink =
    from.parentDynamicId === to.parentDynamicId &&
    from.relationType === to.relationType &&
    from.relationName === to.relationName;
  const result = (
    status: 'moved' | 'alreadyMoved' | 'unchanged',
    destinationAction: 'attached' | 'alreadyAttached' | 'unchanged',
    sourceAction: 'detached' | 'alreadyDetached' | 'unchanged'
  ) => ({
    data: { nodeDynamicId: nodeId, status, destinationAction, sourceAction },
  });
  if (sameLink) return result('unchanged', 'unchanged', 'unchanged');
  if (!sourceExists)
    return result('alreadyMoved', 'alreadyAttached', 'alreadyDetached');

  let stage: 'attachDestination' | 'detachSource' = 'attachDestination';
  try {
    if (!destinationExists) {
      if (context)
        await destination.addChildInContext(
          node,
          to.relationName,
          to.relationType,
          context
        );
      else await destination.addChild(node, to.relationName, to.relationType);
    }
    stage = 'detachSource';
    await source.removeChild(node, from.relationName, from.relationType);
  } catch (error) {
    console.error(error);
    throw {
      ...createErrorMsgItem(
        EApiErrorType.INTERNAL_ERROR,
        stage === 'attachDestination'
          ? 'Destination attachment failed; source detachment was not attempted'
          : 'Destination attachment completed or already existed, but source detachment failed'
      ),
      stage,
      state: {
        destination:
          stage === 'attachDestination'
            ? 'unknown'
            : destinationExists
            ? 'alreadyAttached'
            : 'attached',
        source: stage === 'attachDestination' ? 'notAttempted' : 'unknown',
      },
    };
  }
  return result(
    'moved',
    destinationExists ? 'alreadyAttached' : 'attached',
    'detached'
  );
}
