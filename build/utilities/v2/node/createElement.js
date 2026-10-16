"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementObject = exports.elementValue = exports.elementKey = void 0;
exports.createElement = createElement;
const zod_1 = require("zod");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
const spinal_model_graph_1 = require("spinal-model-graph");
const resolveModelReference_1 = require("./resolveModelReference");
exports.elementKey = zod_1.z
    .string()
    .refine((key) => !key.startsWith("_") &&
    key !== "$modelRef" &&
    key !== "model_id" &&
    !(key in spinal_core_connectorjs_1.Model.prototype), "Element keys must not shadow Model members or start with an underscore");
exports.elementValue = zod_1.z.lazy(() => zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number().finite(),
    zod_1.z.boolean(),
    zod_1.z.array(exports.elementValue),
    zod_1.z.preprocess(rejectPrototypeKey, zod_1.z.union([
        zod_1.z.strictObject({
            $modelRef: zod_1.z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
            path: zod_1.z.string().refine(resolveModelReference_1.isModelReferencePath, "Invalid $modelRef path"),
        }),
        exports.elementObject,
    ])),
]));
function rejectPrototypeKey(data, ctx) {
    // Zod records discard __proto__ before validating keys.
    if (data !== null &&
        typeof data === "object" &&
        Object.hasOwn(data, "__proto__")) {
        ctx.addIssue({
            code: "custom",
            message: "Element keys must not shadow Model members or start with an underscore",
            path: ["__proto__"],
        });
        return zod_1.z.NEVER;
    }
    return data;
}
exports.elementObject = zod_1.z.preprocess(rejectPrototypeKey, zod_1.z.record(exports.elementKey, exports.elementValue));
async function createElement(data, middleware, profileId) {
    const nodes = new Map();
    const references = new Map();
    async function resolve(value) {
        if (Array.isArray(value)) {
            const result = [];
            for (const item of value)
                result.push(await resolve(item));
            return result;
        }
        if (typeof value !== "object")
            return value;
        if (Object.hasOwn(value, "$modelRef") &&
            typeof value.$modelRef === "number") {
            const id = value.$modelRef;
            if (typeof value.path !== "string" || !(0, resolveModelReference_1.isModelReferencePath)(value.path)) {
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, "Invalid $modelRef path");
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
        return createObject(value);
    }
    async function createObject(value) {
        const model = new spinal_core_connectorjs_1.Model();
        for (const [key, item] of Object.entries(value)) {
            model.add_attr(key, await resolve(item));
        }
        return model;
    }
    return createObject(data);
}
//# sourceMappingURL=createElement.js.map