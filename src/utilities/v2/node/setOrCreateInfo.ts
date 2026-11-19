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
import { Bool, Str, Val } from 'spinal-core-connectorjs';

export function setOrCreateInfo(
  node: SpinalNode,
  key: string,
  value?: string | number | boolean
) {
  if (value === undefined || value === null) return;
  const typeOfValue = typeof value;
  if (typeof node.info[key] === 'undefined') {
    node.info.add_attr(key, value);
  } else if (
    node.info[key] !== value &&
    (typeOfValue === 'string' ||
      typeOfValue === 'number' ||
      typeOfValue === 'boolean')
  ) {
    if (
      (typeOfValue === 'string' && node.info[key] instanceof Str) ||
      (typeOfValue === 'boolean' && node.info[key] instanceof Bool) ||
      (typeOfValue === 'number' && node.info[key] instanceof Val)
    ) {
      node.info[key].set(value);
    } else {
      node.info.mod_attr(key, value);
    }
  }
}
