"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModelStaging = createModelStaging;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_model_graph_1 = require("spinal-model-graph");
const createErrorMsgItem_1 = require("../../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../errorHandler/EApiErrorType");
function createModelStaging() {
    const originals = new Map();
    const clones = new Map();
    const partialRoots = new Map();
    const committed = new Map();
    let visits = 0;
    function clone(model, depth = 0) {
        if (++visits > 10000 || depth > 32)
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, 'Patch staging exceeds maximum depth (32) or model count (10000)');
        const cached = clones.get(model);
        if (cached)
            return cached;
        if (model instanceof spinal_core_connectorjs_1.Ptr || model instanceof spinal_model_graph_1.SpinalNodePointer)
            return model;
        const result = model instanceof spinal_core_connectorjs_1.Str
            ? new spinal_core_connectorjs_1.Str(model.get())
            : model instanceof spinal_core_connectorjs_1.Bool
                ? new spinal_core_connectorjs_1.Bool(model.get())
                : model instanceof spinal_core_connectorjs_1.Val
                    ? new spinal_core_connectorjs_1.Val(model.get())
                    : model instanceof spinal_core_connectorjs_1.Lst
                        ? new spinal_core_connectorjs_1.Lst()
                        : new spinal_core_connectorjs_1.Model();
        clones.set(model, result);
        originals.set(result, model);
        if (model instanceof spinal_core_connectorjs_1.Lst && result instanceof spinal_core_connectorjs_1.Lst) {
            for (const item of model)
                result.push(clone(item, depth + 1));
        }
        else if (!(model instanceof spinal_core_connectorjs_1.Str || model instanceof spinal_core_connectorjs_1.Bool || model instanceof spinal_core_connectorjs_1.Val)) {
            for (const key of model._attribute_names)
                result.add_attr(key, clone(model[key], depth + 1));
        }
        return result;
    }
    function stageRoot(model, keys) {
        // Scalars/lists must retain their normal shape and array-index validation.
        if (model instanceof spinal_core_connectorjs_1.Lst ||
            model instanceof spinal_core_connectorjs_1.Str ||
            model instanceof spinal_core_connectorjs_1.Bool ||
            model instanceof spinal_core_connectorjs_1.Val ||
            model instanceof spinal_core_connectorjs_1.Ptr ||
            model instanceof spinal_model_graph_1.SpinalNodePointer)
            return clone(model);
        const result = new spinal_core_connectorjs_1.Model();
        clones.set(model, result);
        originals.set(result, model);
        partialRoots.set(result, keys);
        return result;
    }
    function populateRoots() {
        // Register all roots before cloning branches to preserve references between roots.
        for (const [staged, keys] of partialRoots) {
            const original = originals.get(staged);
            for (const key of keys)
                if (original._attribute_names.includes(key))
                    staged.add_attr(key, clone(original[key], 1));
        }
    }
    function commit(staged) {
        const cached = committed.get(staged);
        if (cached)
            return cached;
        const original = originals.get(staged);
        const target = original ?? staged;
        committed.set(staged, target);
        if (staged instanceof spinal_core_connectorjs_1.Str ||
            staged instanceof spinal_core_connectorjs_1.Bool ||
            staged instanceof spinal_core_connectorjs_1.Val) {
            if (original)
                original.set(staged.get());
        }
        else if (staged instanceof spinal_core_connectorjs_1.Ptr || staged instanceof spinal_model_graph_1.SpinalNodePointer) {
            return staged;
        }
        else if (staged instanceof spinal_core_connectorjs_1.Lst) {
            for (let i = 0; i < staged.length; i++) {
                const item = commit(staged[i]);
                if (target[i] !== item)
                    target.set_or_push(i, item);
            }
        }
        else {
            for (const key of partialRoots.get(staged) ?? [
                ...target._attribute_names,
            ]) {
                if (!staged._attribute_names.includes(key))
                    target.rem_attr(key);
            }
            for (const key of staged._attribute_names) {
                const item = commit(staged[key]);
                if (target[key] !== item)
                    target.mod_attr(key, item);
            }
        }
        return target;
    }
    return { clone, stageRoot, populateRoots, commit };
}
//# sourceMappingURL=modelStaging.js.map