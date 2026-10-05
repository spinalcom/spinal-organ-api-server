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

  if (typeof node.info[key] === 'undefined') {
    node.info.add_attr(key, value);
  } else if (
    typeof value == 'string' ||
    typeof value == 'number' ||
    typeof value == 'boolean'
  ) {
    if (
      (typeof value === 'string' && node.info[key] instanceof Str) ||
      (typeof value === 'boolean' && node.info[key] instanceof Bool) ||
      (typeof value === 'number' && node.info[key] instanceof Val)
    ) {
      node.info[key].set(value);
    } else {
      node.info.mod_attr(key, value);
    }
  }
}
