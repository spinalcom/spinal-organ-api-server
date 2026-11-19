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
  EQUIPMENT_RELATION,
  EQUIPMENT_TYPE,
  FLOOR_TYPE,
  REFERENCE_RELATION,
  REFERENCE_ROOM_RELATION,
  ROOM_TYPE,
} from 'spinal-env-viewer-context-geographic-service';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import {
  getNodeChildrenFromParentDynIds,
  type IParentChildRelation,
} from '../node/getNodeChildrenFromParentDynId';
import { getEquipmentInContextIterable } from './getEquipmentInContextIterable';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';

export type TBimObjectType = 'bimobject' | 'referenceRoom' | 'referenceFloor';

export type TNodeWithParent = { node: SpinalNode; parentId: number };

export interface IFindEquipmentNodesOptions {
  spinalAPIMiddleware: ISpinalAPIMiddleware;
  profileId: string;
  geographicContext: SpinalContext;
  building: SpinalNode | undefined;
  bimObjectType: TBimObjectType;
  parentDynamicIds?: number[];
}

/**
 * Returns an array when parents are supplied (so the caller can compute `total`),
 * otherwise a lazy iterable over the whole building.
 */
export async function findEquipmentNodes({
  spinalAPIMiddleware,
  profileId,
  geographicContext,
  building,
  bimObjectType,
  parentDynamicIds,
}: IFindEquipmentNodesOptions): Promise<
  Iterable<TNodeWithParent> | AsyncIterable<TNodeWithParent>
> {
  if (parentDynamicIds) {
    let relationObj: IParentChildRelation | undefined;
    if (bimObjectType === 'bimobject') {
      relationObj = {
        relationName: EQUIPMENT_RELATION,
        parentType: ROOM_TYPE,
        context: geographicContext,
      };
    } else if (bimObjectType === 'referenceRoom') {
      relationObj = {
        relationName: REFERENCE_ROOM_RELATION,
        parentType: ROOM_TYPE,
      };
    } else if (bimObjectType === 'referenceFloor') {
      relationObj = {
        relationName: REFERENCE_RELATION,
        parentType: FLOOR_TYPE,
        context: geographicContext,
      };
    }
    if (!relationObj)
      throw createErrorMsgItem(
        EApiErrorType.ERROR_DATABASE,
        'No valid relation found for the given bimObjectType'
      );

    return getNodeChildrenFromParentDynIds(
      spinalAPIMiddleware,
      parentDynamicIds,
      profileId,
      EQUIPMENT_TYPE,
      [
        relationObj,
        {
          relationName: `groupHas${EQUIPMENT_TYPE}`,
          parentType: `${EQUIPMENT_TYPE}Group`,
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
  return getEquipmentInContextIterable(
    geographicContext,
    building,
    bimObjectType
  );
}
