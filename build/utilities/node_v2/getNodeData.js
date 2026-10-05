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
exports.getNodeData = getNodeData;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const awaitSync_1 = require("../awaitSync");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
async function getNodeData(node, info, attr, addAttributesModificationDate) {
    const nodeInfo = extractNodeInfo(info, node);
    const nodeAttributes = await extractNodeAttr(node, attr, !!addAttributesModificationDate);
    await (0, awaitSync_1.awaitSync)(node); // Wait for the _server_id to be assigned by hub
    return {
        dynamicId: node._server_id,
        info: nodeInfo,
        attributes: nodeAttributes,
    };
}
function extractNodeInfo(infoQuery, node) {
    let nodeInfo = undefined;
    if (infoQuery === true) {
        infoQuery = node.info._attribute_names
            .filter((attrName) => node.info[attrName] instanceof spinal_core_connectorjs_1.Str ||
            node.info[attrName] instanceof spinal_core_connectorjs_1.Val ||
            node.info[attrName] instanceof spinal_core_connectorjs_1.Bool)
            .map((attrName) => (attrName === 'id' ? 'staticId' : attrName));
    }
    if (Array.isArray(infoQuery) && infoQuery.length > 0) {
        nodeInfo = {};
        for (let key of infoQuery) {
            const originalKey = key;
            if (key === 'staticId')
                key = 'id';
            if (node.info[key] === undefined)
                continue;
            if (node.info[key] instanceof spinal_core_connectorjs_1.Str ||
                node.info[key] instanceof spinal_core_connectorjs_1.Val ||
                node.info[key] instanceof spinal_core_connectorjs_1.Bool) {
                const value = node.info[key]?.get();
                nodeInfo[originalKey] = value;
            }
        }
        if (Object.keys(nodeInfo).length === 0) {
            nodeInfo = undefined;
        }
    }
    return nodeInfo;
}
async function extractNodeAttr(node, attrQuery, addAttributesModificationDate) {
    if (attrQuery === false)
        return undefined;
    let nodeAttributes = undefined;
    let catToGet = [];
    const catNodes = await node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
    if (attrQuery === true) {
        catToGet = catNodes;
    }
    else if (typeof attrQuery === 'object' && attrQuery !== null) {
        const catNames = Object.keys(attrQuery);
        catToGet = catNodes.filter((catNode) => catNames.includes(catNode.getName().get()));
    }
    let typedAttrQuery = attrQuery;
    const categoryResults = await Promise.all(catToGet.map(async (category) => {
        const categoryName = category.getName().get();
        const attrQuery = typeof typedAttrQuery === 'boolean'
            ? typedAttrQuery
            : typedAttrQuery[categoryName];
        const cat = await extractNodeAttrCat(category, attrQuery, addAttributesModificationDate);
        if (cat && Object.keys(cat).length > 0) {
            return [categoryName, cat];
        }
        return undefined;
    }));
    for (const categoryResult of categoryResults) {
        if (!categoryResult)
            continue;
        if (!nodeAttributes)
            nodeAttributes = {};
        const [categoryName, cat] = categoryResult;
        nodeAttributes[categoryName] = cat;
    }
    return nodeAttributes;
}
async function extractNodeAttrCat(nodeAttrCat, typedAttrQuery, addAttributesModificationDate) {
    if (typedAttrQuery === undefined)
        return undefined;
    const result = {};
    const attrLst = await nodeAttrCat.getElement(true);
    let attrNamesToGet = [];
    if (typeof typedAttrQuery === 'boolean') {
        if (typedAttrQuery === false)
            return undefined;
        if (typedAttrQuery === true)
            for (const attr of attrLst)
                attrNamesToGet.push(attr.label.get());
    }
    else if (Array.isArray(typedAttrQuery)) {
        attrNamesToGet = typedAttrQuery;
    }
    for (const attr of attrLst) {
        const label = attr.label.get();
        if (!attrNamesToGet.includes(label))
            continue;
        const value = attr.value.get();
        const lastModification = attr.lastModificationDate?.get();
        result[label] = addAttributesModificationDate
            ? { value, lastModification }
            : value;
    }
    return Object.keys(result).length > 0 ? result : undefined;
}
//# sourceMappingURL=getNodeData.js.map