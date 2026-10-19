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
import { Model } from 'spinal-core-connectorjs';
import { setOrCreateInfo } from './setOrCreateInfo';
import { createElement, type ElementValue } from './createElement';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';

export async function resolveInfo(
  info: Record<string, ElementValue | undefined>,
  middleware: ISpinalAPIMiddleware,
  profileId: string
): Promise<Model> {
  const data: Record<string, ElementValue> = {};
  for (const [key, value] of Object.entries(info)) {
    if (value !== undefined) data[key] = value;
  }
  return createElement(data, middleware, profileId);
}

export async function handleSetInfo(
  node: SpinalNode,
  info: Record<string, ElementValue | undefined> | Model | undefined,
  middleware?: ISpinalAPIMiddleware,
  profileId?: string
) {
  if (!info) return;
  if (info instanceof Model) {
    for (const key of info._attribute_names) {
      node.info.mod_attr(key === 'staticId' ? 'id' : key, info[key]);
    }
    return;
  }
  if (
    Object.values(info).some(
      (value) => typeof value === 'object' && value !== null
    )
  ) {
    if (!middleware || profileId === undefined) {
      throw createErrorMsgItem(
        EApiErrorType.INTERNAL_ERROR,
        'Structured info requires middleware and profile ID'
      );
    }
    return handleSetInfo(node, await resolveInfo(info, middleware, profileId));
  }
  for (const attrName in info) {
    if (!Object.hasOwn(info, attrName)) continue;

    const element = info[attrName];
    if (element === undefined) continue;
    if (typeof element === 'object') continue;
    let name = attrName === 'staticId' ? 'id' : attrName;

    setOrCreateInfo(node, name, element);
  }
}
