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
exports.isModelReferencePath = isModelReferencePath;
exports.resolveModelReference = resolveModelReference;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
function isModelReferencePath(path) {
    const parts = path.split('.');
    return (parts.length <= 32 &&
        !(parts[0] === 'info' &&
            (parts.length === 1 || parts[1] === 'id' || parts[1] === 'staticId')) &&
        parts.every((part) => part.length > 0 &&
            !part.startsWith('_') &&
            part !== 'constructor' &&
            part !== 'prototype' &&
            part !== 'model_id') &&
        (parts[0] === 'info' ||
            parts[0] === 'element' ||
            (parts[0] === 'attr' && parts.length === 3)));
}
async function resolveModelReference(node, path) {
    const invalid = () => (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, `$modelRef path "${path}" does not resolve to a Model on node ${node._server_id}`);
    if (!isModelReferencePath(path))
        throw invalid();
    const [root, ...parts] = path.split('.');
    if (root === 'attr') {
        const [categoryName, label] = parts;
        const categories = await node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
        const category = categories.find((item) => item.getName().get() === categoryName);
        if (!category)
            throw invalid();
        const attributes = await category.getElement(true);
        if (!(attributes instanceof spinal_core_connectorjs_1.Lst))
            throw invalid();
        for (const attribute of attributes) {
            if (attribute.label.get() === label && attribute.value instanceof spinal_core_connectorjs_1.Model) {
                return attribute.value;
            }
        }
        throw invalid();
    }
    let current = root === 'info' ? node.info : await node.getElement(true);
    for (const key of parts) {
        if (!(current instanceof spinal_core_connectorjs_1.Model) ||
            current instanceof spinal_core_connectorjs_1.Ptr ||
            current instanceof spinal_model_graph_1.SpinalNodePointer) {
            throw invalid();
        }
        if (current instanceof spinal_core_connectorjs_1.Lst) {
            if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= current.length)
                throw invalid();
        }
        else if (!current._attribute_names.includes(key)) {
            throw invalid();
        }
        const next = current[key];
        if (!(next instanceof spinal_core_connectorjs_1.Model))
            throw invalid();
        current = next;
    }
    if (!(current instanceof spinal_core_connectorjs_1.Model))
        throw invalid();
    return current;
}
//# sourceMappingURL=resolveModelReference.js.map