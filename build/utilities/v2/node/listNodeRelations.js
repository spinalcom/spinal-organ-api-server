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
exports.relationsQuerySchema = void 0;
exports.listNodeRelations = listNodeRelations;
const zod_1 = require("zod");
const spinal_model_graph_1 = require("spinal-model-graph");
const loadAndValidateNode_1 = require("../../loadAndValidateNode");
const filterNodes_1 = require("./filterNodes");
const getNodeData_1 = require("./getNodeData");
const parseInfoQuery_1 = require("../requestParse/parseInfoQuery");
const parseAttributesQuery_1 = require("../requestParse/parseAttributesQuery");
const parseFilterQuery_1 = require("../requestParse/parseFilterQuery");
const getNodeElement_1 = require("./getNodeElement");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
exports.relationsQuerySchema = zod_1.z.strictObject({
    relationName: zod_1.z
        .string()
        .trim()
        .min(1)
        .refine((value) => value.split(',').every((name) => name.trim().length > 0), 'relationName must contain nonempty comma-separated names')
        .optional(),
    relationType: zod_1.z.enum(['PtrLst', 'LstPtr', 'Ref', 'LstPtrLst']).optional(),
    contextDynamicId: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .max(Number.MAX_SAFE_INTEGER)
        .optional(),
    info: zod_1.z.string().optional(),
    attributes: zod_1.z.string().optional(),
    element: zod_1.z.string().optional(),
    filter: zod_1.z.unknown().optional(),
    offset: zod_1.z.coerce
        .number()
        .int()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .default(0),
    'add-attributes-modification-date': zod_1.z.stringbool().optional(),
});
async function listNodeRelations(middleware, profileId, nodeId, query, grouped, direction) {
    const filters = (0, parseFilterQuery_1.parseFilterQuery)(query);
    const info = (0, parseInfoQuery_1.parseInfoQuery)(query.info);
    const attributes = (0, parseAttributesQuery_1.parseAttributesQuery)(query.attributes);
    const element = (0, getNodeElement_1.parseElementQuery)(query.element);
    const relationNames = query.relationName === undefined
        ? undefined
        : new Set(query.relationName.split(',').map((name) => name.trim()));
    const source = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, nodeId, profileId);
    let context;
    if (query.contextDynamicId !== undefined) {
        const loaded = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, query.contextDynamicId, profileId);
        if (!(loaded instanceof spinal_model_graph_1.SpinalContext))
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE, 'contextDynamicId must identify a SpinalContext');
        context = loaded;
    }
    const metadata = new Map();
    const seen = new Set();
    const accessible = new Map();
    function supportsType(type) {
        if (type === 'LstPtrLst')
            console.warn(`[listNodeRelations] Skipping unsupported relation type LstPtrLst on node ${nodeId}`);
        return (['PtrLst', 'LstPtr', 'Ref'].includes(type) &&
            (query.relationType === undefined || query.relationType === type));
    }
    async function* relatedNodes() {
        if (direction === 'parents') {
            if (context && !source.belongsToContext(context))
                return;
            for (const name of source.parents.keys()) {
                if (relationNames && !relationNames.has(name))
                    continue;
                const pointers = source.parents.getElement(name);
                for (let index = 0; index < pointers.length; index++) {
                    const pointer = pointers[index];
                    // Pointer metadata allows unsupported relations to be skipped without loading.
                    const type = pointer.getType().get();
                    if (!supportsType(type))
                        continue;
                    const relation = await pointer.load();
                    if (context && !relation.belongsToContext(context))
                        continue;
                    const node = await relation.getParent();
                    if (!(node instanceof spinal_model_graph_1.SpinalNode))
                        throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, 'Relation has no valid parent');
                    if (context && !node.belongsToContext(context))
                        continue;
                    yield { node, relationType: type, relationName: name };
                }
            }
            return;
        }
        for (const type of source.children.keys()) {
            if (!supportsType(type))
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
                    yield { node: child, relationType: type, relationName: name };
                }
            }
        }
    }
    async function* entries() {
        for await (const related of relatedNodes()) {
            const id = related.node.getId().get();
            if (!grouped && seen.has(id))
                continue;
            seen.add(id);
            const dynamicId = related.node._server_id;
            if (!dynamicId)
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, 'Related node has no dynamic ID');
            let node = accessible.get(dynamicId);
            if (!node) {
                node = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, dynamicId, profileId);
                accessible.set(dynamicId, node);
            }
            const entry = {
                node,
                parentId: direction === 'children' ? nodeId : dynamicId,
                relationType: related.relationType,
                relationName: related.relationName,
            };
            metadata.set(entry, entry);
            yield entry;
        }
    }
    const page = await (0, filterNodes_1.filterNodes)(entries(), filters, query.offset);
    const items = await Promise.all(page.map(({ node }) => (0, getNodeData_1.getNodeData)(node, info, attributes, query['add-attributes-modification-date'], direction === 'children' ? nodeId : undefined, element)));
    if (!grouped)
        return { data: items, offset: query.offset, total: items.length };
    const data = Object.create(null);
    page.forEach((entry, index) => {
        const { relationType, relationName } = metadata.get(entry);
        if (!data[relationType])
            data[relationType] = Object.create(null);
        if (!data[relationType][relationName])
            data[relationType][relationName] = [];
        data[relationType][relationName].push(items[index]);
    });
    return {
        ...(direction === 'children'
            ? { parentDynamicId: nodeId }
            : { nodeDynamicId: nodeId }),
        data,
        offset: query.offset,
        total: items.length,
    };
}
//# sourceMappingURL=listNodeRelations.js.map