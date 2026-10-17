"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareNodeCreation = prepareNodeCreation;
exports.applyPreparedNode = applyPreparedNode;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_model_graph_1 = require("spinal-model-graph");
const createElement_1 = require("./createElement");
const handleSetAttribute_1 = require("./handleSetAttribute");
const handleSetInfo_1 = require("./handleSetInfo");
const resolveModelReference_1 = require("./resolveModelReference");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
async function prepareNodeCreation(name, type, info, element, attributes, defaults, middleware, profileId) {
    const node = new spinal_model_graph_1.SpinalNode(name, type);
    await (0, handleSetAttribute_1.handleSetAttribute)(node, attributes, defaults);
    const rawInfo = { name, type };
    for (const [key, value] of Object.entries(info)) {
        if (value !== undefined)
            rawInfo[key] = value;
    }
    const raw = { info: rawInfo };
    if (element !== undefined)
        raw.element = element;
    const cache = new Map();
    const active = new Set();
    const invalid = (message) => (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, message);
    async function memo(path, resolve) {
        const key = JSON.stringify(path);
        const cached = cache.get(key);
        if (cached)
            return cached;
        if (active.has(key))
            throw invalid(`Circular self reference at ${path.join(".")}`);
        active.add(key);
        try {
            const result = await resolve();
            cache.set(key, result);
            return result;
        }
        finally {
            active.delete(key);
        }
    }
    async function self(path) {
        if (path.startsWith("attr."))
            return (0, resolveModelReference_1.resolveModelReference)(node, path);
        const parts = path.split(".");
        let value = raw;
        let index = 0;
        for (; index < parts.length; index++) {
            if (typeof value !== "object" ||
                value === null ||
                Object.hasOwn(value, "$modelRef"))
                break;
            const key = parts[index];
            if (Array.isArray(value)) {
                if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)
                    throw invalid(`Missing self path: ${path}`);
                value = value[Number(key)];
            }
            else {
                if (!Object.hasOwn(value, key))
                    throw invalid(`Missing self path: ${path}`);
                value = value[key];
            }
        }
        const prefix = parts.slice(0, index);
        const resolved = await (0, createElement_1.createElement)({ value }, middleware, profileId, self, (_value, local, resolve) => memo([...prefix, ...local.slice(1)], resolve));
        let model = resolved.value;
        for (const key of parts.slice(index)) {
            if (model instanceof spinal_core_connectorjs_1.Ptr ||
                model instanceof spinal_model_graph_1.SpinalNodePointer ||
                (model instanceof spinal_core_connectorjs_1.Lst
                    ? !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= model.length
                    : !model._attribute_names.includes(key)))
                throw invalid(`Missing self path: ${path}`);
            const next = model[key];
            if (!(next instanceof spinal_core_connectorjs_1.Model))
                throw invalid(`Missing self path: ${path}`);
            model = next;
        }
        return model;
    }
    const result = await (0, createElement_1.createElement)(raw, middleware, profileId, self, (_value, path, resolve) => memo(path, resolve));
    await (0, handleSetInfo_1.handleSetInfo)(node, result.info);
    if (element !== undefined) {
        // Use the constructor to preserve the normal element-pointer representation.
        const holder = new spinal_model_graph_1.SpinalNode(name, type, result.element);
        node.add_attr("element", holder.element);
    }
    return node;
}
async function applyPreparedNode(target, prepared) {
    const info = new spinal_core_connectorjs_1.Model();
    for (const key of prepared.info._attribute_names) {
        if (key !== "id")
            info.add_attr(key, prepared.info[key]);
    }
    await (0, handleSetInfo_1.handleSetInfo)(target, info);
    for (const category of await prepared.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION)) {
        await target.addChild(category, spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        for (const type of [
            spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE,
            spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE,
            spinal_model_graph_1.SPINAL_RELATION_TYPE,
        ]) {
            if (prepared.hasRelation(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION, type)) {
                await prepared.removeChild(category, spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION, type);
            }
        }
    }
}
//# sourceMappingURL=prepareNodeCreation.js.map