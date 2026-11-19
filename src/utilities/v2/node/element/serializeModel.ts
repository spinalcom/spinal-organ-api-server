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

import { Bool, Lst, Model, Ptr, Str, Val } from 'spinal-core-connectorjs';
import { SpinalNodePointer } from 'spinal-model-graph';
import { createErrorMsgItem } from '../../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../errorHandler/EApiErrorType';
import type { ElementJson } from '../../../../routes/v2/openApiCompo/schemas/INodeItem';

interface Selection {
  all: boolean;
  children: Map<string, Selection>;
}

export function serializeModel(
  element: Model,
  query: true | string[][]
): ElementJson | undefined {
  const selection: Selection = { all: query === true, children: new Map() };
  if (query !== true) {
    for (const path of query) {
      let current = selection;
      for (const key of path) {
        let child = current.children.get(key);
        if (!child) {
          child = { all: false, children: new Map() };
          current.children.set(key, child);
        }
        current = child;
      }
      current.all = true;
    }
  }
  const ancestors = new Set<Model>();
  let visits = 0;
  function serialize(
    model: Model,
    fields: Selection,
    depth: number
  ): ElementJson | undefined {
    if (++visits > 10000 || depth > 32) {
      throw createErrorMsgItem(
        EApiErrorType.INTERNAL_ERROR,
        'Element serialization exceeds maximum depth (32) or model count (10000)'
      );
    }
    const pointer =
      model instanceof Ptr
        ? model
        : model instanceof SpinalNodePointer
        ? model.ptr
        : undefined;
    if (pointer) {
      if (!fields.all) return undefined;
      const id: unknown = pointer.data.model?._server_id ?? pointer.data.value;
      if (id === undefined || id === 0) return { $ptr: null };
      if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1) {
        throw createErrorMsgItem(
          EApiErrorType.INTERNAL_ERROR,
          'Element pointer has an invalid dynamic ID'
        );
      }
      return { $ptr: id };
    }
    if (model instanceof Str || model instanceof Bool || model instanceof Val) {
      if (!fields.all) return undefined;
      const value = model.get();
      if (typeof value === 'number' && !Number.isFinite(value)) {
        throw createErrorMsgItem(
          EApiErrorType.INTERNAL_ERROR,
          'Element contains a non-finite number'
        );
      }
      return value;
    }
    if (ancestors.has(model)) {
      throw createErrorMsgItem(
        EApiErrorType.INTERNAL_ERROR,
        'Element contains a cyclic Model reference'
      );
    }
    ancestors.add(model);
    try {
      const result: { [key: string]: ElementJson } = {};
      const array: ElementJson[] = [];
      const isList = model instanceof Lst;
      if (isList && model.length > 10000) {
        throw createErrorMsgItem(
          EApiErrorType.INTERNAL_ERROR,
          'Element array exceeds maximum length (10000)'
        );
      }
      const keys = fields.all
        ? isList
          ? Array.from({ length: model.length }, (_, i) => String(i))
          : model._attribute_names
        : [...fields.children.keys()];
      for (const key of keys) {
        if (
          isList
            ? !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= model.length
            : !model._attribute_names.includes(key)
        )
          continue;
        const child: unknown = model[key];
        if (!(child instanceof Model)) {
          throw createErrorMsgItem(
            EApiErrorType.INTERNAL_ERROR,
            'Element contains an invalid Model attribute'
          );
        }
        const value = serialize(
          child,
          fields.all ? fields : fields.children.get(key)!,
          depth + 1
        );
        if (value === undefined) continue;
        if (isList) {
          while (array.length < Number(key)) array.push(null);
          array[Number(key)] = value;
        } else {
          Object.defineProperty(result, key, {
            value,
            enumerable: true,
            configurable: true,
          });
        }
      }
      return isList ? array : result;
    } finally {
      ancestors.delete(model);
    }
  }
  return serialize(element, selection, 0);
}
