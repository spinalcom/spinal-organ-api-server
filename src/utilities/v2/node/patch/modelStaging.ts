/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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

import { Bool, Lst, Model, Ptr, Str, Val } from "spinal-core-connectorjs";
import { SpinalNodePointer } from "spinal-model-graph";
import { createErrorMsgItem } from "../../errorHandler/createErrorMsgItem";
import { EApiErrorType } from "../../errorHandler/EApiErrorType";

export function createModelStaging() {
  const originals = new Map<Model, Model>();
  const clones = new Map<Model, Model>();
  const partialRoots = new Map<Model, Set<string>>();
  const committed = new Map<Model, Model>();
  let visits = 0;

  function clone(model: Model, depth = 0): Model {
    if (++visits > 10000 || depth > 32)
      throw createErrorMsgItem(
        EApiErrorType.INVALID_REQUEST,
        "Patch staging exceeds maximum depth (32) or model count (10000)"
      );
    const cached = clones.get(model);
    if (cached) return cached;
    if (model instanceof Ptr || model instanceof SpinalNodePointer)
      return model;
    const result =
      model instanceof Str
        ? new Str(model.get())
        : model instanceof Bool
          ? new Bool(model.get())
          : model instanceof Val
            ? new Val(model.get())
            : model instanceof Lst
              ? new Lst()
              : new Model();
    clones.set(model, result);
    originals.set(result, model);
    if (model instanceof Lst && result instanceof Lst) {
      for (const item of model) result.push(clone(item, depth + 1));
    } else if (
      !(model instanceof Str || model instanceof Bool || model instanceof Val)
    ) {
      for (const key of model._attribute_names)
        result.add_attr(key, clone(model[key], depth + 1));
    }
    return result;
  }

  function stageRoot(model: Model, keys: Set<string>): Model {
    // Scalars/lists must retain their normal shape and array-index validation.
    if (
      model instanceof Lst ||
      model instanceof Str ||
      model instanceof Bool ||
      model instanceof Val ||
      model instanceof Ptr ||
      model instanceof SpinalNodePointer
    )
      return clone(model);
    const result = new Model();
    clones.set(model, result);
    originals.set(result, model);
    partialRoots.set(result, keys);
    return result;
  }

  function populateRoots(): void {
    // Register all roots before cloning branches to preserve references between roots.
    for (const [staged, keys] of partialRoots) {
      const original = originals.get(staged)!;
      for (const key of keys)
        if (original._attribute_names.includes(key))
          staged.add_attr(key, clone(original[key], 1));
    }
  }

  function commit(staged: Model): Model {
    const cached = committed.get(staged);
    if (cached) return cached;
    const original = originals.get(staged);
    const target = original ?? staged;
    committed.set(staged, target);
    if (
      staged instanceof Str ||
      staged instanceof Bool ||
      staged instanceof Val
    ) {
      if (original) original.set(staged.get());
    } else if (staged instanceof Ptr || staged instanceof SpinalNodePointer) {
      return staged;
    } else if (staged instanceof Lst) {
      for (let i = 0; i < staged.length; i++) {
        const item = commit(staged[i]);
        if (target[i] !== item) target.set_or_push(i, item);
      }
    } else {
      for (const key of partialRoots.get(staged) ?? [
        ...target._attribute_names,
      ]) {
        if (!staged._attribute_names.includes(key)) target.rem_attr(key);
      }
      for (const key of staged._attribute_names) {
        const item = commit(staged[key]);
        if (target[key] !== item) target.mod_attr(key, item);
      }
    }
    return target;
  }

  return { clone, stageRoot, populateRoots, commit };
}
