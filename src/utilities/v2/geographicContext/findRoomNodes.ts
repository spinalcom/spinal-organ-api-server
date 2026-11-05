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

import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import {
  ROOM_RELATION,
  ROOM_TYPE,
  FLOOR_TYPE,
} from 'spinal-env-viewer-context-geographic-service';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { getNodeChildrenFromParentDynIds } from '../node/getNodeChildrenFromParentDynId';
import { getRoomInContextIterable } from './getRoomInContextIterable';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';

export type TRoomNodeWithParent = { node: SpinalNode; parentId: number };

export interface IFindRoomNodesOptions {
  spinalAPIMiddleware: ISpinalAPIMiddleware;
  profileId: string;
  geographicContext: SpinalContext;
  building: SpinalNode | undefined;
  parentDynamicIds?: number[];
}

/**
 * Returns an array when parents are supplied (so the caller can compute `total`),
 * otherwise a lazy iterable over the building's rooms.
 */
export async function findRoomNodes({
  spinalAPIMiddleware,
  profileId,
  geographicContext,
  building,
  parentDynamicIds,
}: IFindRoomNodesOptions): Promise<
  Iterable<TRoomNodeWithParent> | AsyncIterable<TRoomNodeWithParent>
> {
  if (parentDynamicIds) {
    return getNodeChildrenFromParentDynIds(
      spinalAPIMiddleware,
      parentDynamicIds,
      profileId,
      ROOM_TYPE,
      [
        {
          relationName: ROOM_RELATION,
          parentType: FLOOR_TYPE,
          context: geographicContext,
        },
        {
          relationName: `groupHas${ROOM_TYPE}`,
          parentType: `${ROOM_TYPE}Group`,
        },
      ]
    );
  }

  if (!building) {
    throw createErrorMsgItem(
      EApiErrorType.ERROR_DATABASE,
      'No building found in database'
    );
  }
  return getRoomInContextIterable(geographicContext, building);
}
