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
exports.listNodeChildrenBatch = listNodeChildrenBatch;
const spinal_model_graph_1 = require("spinal-model-graph");
const loadAndValidateNode_1 = require("../../loadAndValidateNode");
const filterNodes_1 = require("./filterNodes");
const getNodeData_1 = require("./getNodeData");
const parseInfoQuery_1 = require("../requestParse/parseInfoQuery");
const parseAttributesQuery_1 = require("../requestParse/parseAttributesQuery");
const parseFilterQuery_1 = require("../requestParse/parseFilterQuery");
const parseElementQuery_1 = require("../requestParse/parseElementQuery");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
const SUPPORTED_RELATION_TYPES = ['PtrLst', 'LstPtr', 'Ref'];
/**
 * Lists the distinct direct children of several parents in one page.
 * Each parent's children are deduplicated on their own, as in GET children.
 * Filters and `offset` apply to the combined sequence, and each item carries
 * the `parentDynamicId` it was found under.
 */
async function listNodeChildrenBatch(middleware, profileId, query) {
    const filters = (0, parseFilterQuery_1.parseFilterQuery)({ filter: query.filter });
    const info = (0, parseInfoQuery_1.parseInfoQuery)(query.info);
    const attributes = (0, parseAttributesQuery_1.parseAttributesQuery)(query.attributes);
    const element = (0, parseElementQuery_1.parseElementQuery)(query.element);
    const relationNames = query.relationNames
        ? new Set(query.relationNames)
        : undefined;
    let context;
    if (query.contextDynamicId !== undefined) {
        const loaded = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, query.contextDynamicId, profileId);
        if (!(loaded instanceof spinal_model_graph_1.SpinalContext))
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE, 'contextDynamicId must identify a SpinalContext');
        context = loaded;
    }
    const loadedNodes = new Map();
    async function loadChild(dynamicId) {
        let node = loadedNodes.get(dynamicId);
        if (!node) {
            node = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, dynamicId, profileId);
            loadedNodes.set(dynamicId, node);
        }
        return node;
    }
    async function* childEntries() {
        for (const parentId of query.parentIds) {
            const source = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, parentId, profileId);
            const seen = new Set();
            for (const type of source.children.keys()) {
                if (!SUPPORTED_RELATION_TYPES.includes(type))
                    continue;
                if (query.relationType !== undefined && query.relationType !== type)
                    continue;
                const relations = source.children.getElement(type);
                for (const name of relations.keys()) {
                    if (relationNames && !relationNames.has(name))
                        continue;
                    const relation = relations.getElement(name);
                    if (context && !relation.belongsToContext(context))
                        continue;
                    const children = context
                        ? await relation.getChildrenInContext(context)
                        : await relation.getChildren();
                    for (const child of children) {
                        const id = child.getId().get();
                        if (seen.has(id))
                            continue;
                        seen.add(id);
                        const dynamicId = child._server_id;
                        if (!dynamicId)
                            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, 'Related node has no dynamic ID');
                        yield { node: await loadChild(dynamicId), parentId };
                    }
                }
            }
        }
    }
    const page = await (0, filterNodes_1.filterNodes)(childEntries(), filters, query.offset);
    const items = await Promise.all(page.map(({ node, parentId }) => (0, getNodeData_1.getNodeData)(node, info, attributes, query.addAttributesModificationDate, parentId, element)));
    return { data: items, offset: query.offset, total: items.length };
}
//# sourceMappingURL=listNodeChildrenBatch.js.map