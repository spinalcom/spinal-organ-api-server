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
exports.elementObject = exports.elementValue = exports.elementKey = void 0;
exports.createElement = createElement;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
const spinal_model_graph_1 = require("spinal-model-graph");
const resolveModelReference_1 = require("./resolveModelReference");
var schema_1 = require("./element/schema");
Object.defineProperty(exports, "elementKey", { enumerable: true, get: function () { return schema_1.elementKey; } });
Object.defineProperty(exports, "elementValue", { enumerable: true, get: function () { return schema_1.elementValue; } });
Object.defineProperty(exports, "elementObject", { enumerable: true, get: function () { return schema_1.elementObject; } });
async function createElement(data, middleware, profileId, self, build) {
    const nodes = new Map();
    const references = new Map();
    async function resolve(value, path = []) {
        if (build) {
            return build(value, path, async () => {
                const result = await resolveUncached(value, path);
                if (result instanceof spinal_core_connectorjs_1.Model)
                    return result;
                const wrapper = new spinal_core_connectorjs_1.Model();
                wrapper.add_attr('value', result);
                return wrapper.value;
            });
        }
        return resolveUncached(value, path);
    }
    async function resolveUncached(value, path) {
        if (Array.isArray(value)) {
            const result = [];
            for (const [index, item] of value.entries())
                result.push(await resolve(item, [...path, String(index)]));
            return result;
        }
        if (typeof value !== 'object')
            return value;
        if (Object.hasOwn(value, '$modelRef') &&
            (typeof value.$modelRef === 'number' || value.$modelRef === 'self')) {
            const id = value.$modelRef;
            if (typeof value.path !== 'string' || !(0, resolveModelReference_1.isModelReferencePath)(value.path)) {
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, 'Invalid $modelRef path');
            }
            if (id === 'self') {
                if (!self)
                    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, 'Self reference is unavailable in this creation context');
                return self(value.path);
            }
            const key = JSON.stringify([id, value.path]);
            const cached = references.get(key);
            if (cached)
                return cached;
            let node = nodes.get(id);
            if (!node) {
                let loaded;
                try {
                    loaded = await middleware.load(id, profileId);
                }
                catch (error) {
                    console.error(error);
                    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE, `Error: Loading $modelRef node ${id} failed`);
                }
                if (!(loaded instanceof spinal_model_graph_1.SpinalNode)) {
                    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE, `$modelRef ${id} is not a SpinalNode`);
                }
                node = loaded;
                nodes.set(id, node);
            }
            const model = await (0, resolveModelReference_1.resolveModelReference)(node, value.path);
            references.set(key, model);
            return model;
        }
        return createObject(value, path);
    }
    async function createObject(value, path = []) {
        const model = new spinal_core_connectorjs_1.Model();
        for (const [key, item] of Object.entries(value)) {
            model.add_attr(key, await resolve(item, [...path, key]));
        }
        return model;
    }
    return createObject(data);
}
//# sourceMappingURL=createElement.js.map