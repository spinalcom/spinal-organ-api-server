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
const spinal_models_documentation_1 = require("spinal-models-documentation");
async function prepareNodeCreation(name, type, info, element, attributes, defaults, middleware, profileId) {
    const node = new spinal_model_graph_1.SpinalNode(name, type);
    const attributeReferences = new Map();
    const stringAttributes = {};
    for (const [category, values] of Object.entries(attributes ?? {})) {
        stringAttributes[category] = {};
        for (const [label, value] of Object.entries(values)) {
            if (typeof value === 'string') {
                stringAttributes[category][label] = value;
            }
            else {
                stringAttributes[category][label] = '';
                attributeReferences.set(JSON.stringify([category, label]), value);
            }
        }
    }
    await (0, handleSetAttribute_1.handleSetAttribute)(node, stringAttributes, defaults);
    const resolvedReferences = new Map();
    const activeReferences = new Set();
    async function resolveAttributeReference(category, label) {
        const key = JSON.stringify([category, label]);
        const resolved = resolvedReferences.get(key);
        if (resolved)
            return resolved;
        const reference = attributeReferences.get(key);
        if (!reference) {
            const target = await (0, resolveModelReference_1.resolveModelReference)(node, `attr.${category}.${label}`);
            if (!(target instanceof spinal_core_connectorjs_1.Str)) {
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, `Attribute ${category}.${label} must reference a string Model`);
            }
            return target;
        }
        if (activeReferences.has(key)) {
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, `Circular attribute reference at ${category}.${label}`);
        }
        activeReferences.add(key);
        try {
            let target;
            if (reference.$modelRef === 'self' &&
                reference.path.startsWith('attr.')) {
                const [, targetCategory, targetLabel, targetProperty] = reference.path.split('.');
                if (attributeReferences.has(JSON.stringify([targetCategory, targetLabel]))) {
                    target = await resolveAttributeReference(targetCategory, targetLabel);
                    if (targetProperty === 'lastModificationDate') {
                        target = await (0, resolveModelReference_1.resolveModelReference)(node, reference.path);
                    }
                }
                else {
                    target = await (0, resolveModelReference_1.resolveModelReference)(node, reference.path);
                }
            }
            else if (reference.$modelRef === 'self') {
                target = await (0, resolveModelReference_1.resolveModelReference)(node, reference.path);
            }
            else {
                const resolvedNode = await (0, createElement_1.createElement)({ value: reference }, middleware, profileId);
                target = resolvedNode.value;
            }
            if (!(target instanceof spinal_core_connectorjs_1.Str)) {
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, `$modelRef for attribute ${category}.${label} must target a Str`);
            }
            const attribute = await findAttribute(node, category, label);
            attribute.mod_attr('value', target);
            resolvedReferences.set(key, target);
            return target;
        }
        finally {
            activeReferences.delete(key);
        }
    }
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
            throw invalid(`Circular self reference at ${path.join('.')}`);
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
        if (path.startsWith('attr.')) {
            const [, category, label] = path.split('.');
            const key = JSON.stringify([category, label]);
            if (attributeReferences.has(key)) {
                await resolveAttributeReference(category, label);
            }
            return (0, resolveModelReference_1.resolveModelReference)(node, path);
        }
        const parts = path.split('.');
        let value = raw;
        let index = 0;
        for (; index < parts.length; index++) {
            if (typeof value !== 'object' ||
                value === null ||
                Object.hasOwn(value, '$modelRef'))
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
    for (const key of attributeReferences.keys()) {
        const [category, label] = JSON.parse(key);
        await resolveAttributeReference(category, label);
    }
    if (element !== undefined) {
        // Use the constructor to preserve the normal element-pointer representation.
        const holder = new spinal_model_graph_1.SpinalNode(name, type, result.element);
        node.add_attr('element', holder.element);
    }
    return node;
}
async function findAttribute(node, categoryName, label) {
    const categories = await node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
    const category = categories.find((item) => item.getName().get() === categoryName);
    const attributes = category ? await category.getElement(true) : undefined;
    if (attributes instanceof spinal_core_connectorjs_1.Lst) {
        for (const attribute of attributes) {
            if (attribute instanceof spinal_models_documentation_1.SpinalAttribute &&
                attribute.label.get() === label) {
                return attribute;
            }
        }
    }
    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, `Created attribute ${categoryName}.${label} could not be found`);
}
async function applyPreparedNode(target, prepared) {
    const info = new spinal_core_connectorjs_1.Model();
    for (const key of prepared.info._attribute_names) {
        if (key !== 'id')
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