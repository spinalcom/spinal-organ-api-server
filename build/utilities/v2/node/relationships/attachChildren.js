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
exports.attachChildren = attachChildren;
const spinal_model_graph_1 = require("spinal-model-graph");
const loadAndValidateNode_1 = require("../../../loadAndValidateNode");
const createErrorMsgItem_1 = require("../../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../errorHandler/EApiErrorType");
async function attachChildren(middleware, profileId, parentId, children) {
    const parent = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, parentId, profileId);
    const data = [];
    const errors = [];
    for (const [index, entry] of children.entries()) {
        try {
            const child = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, entry.childDynamicId, profileId);
            let context;
            if (entry.contextDynamicId !== undefined) {
                const loaded = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, entry.contextDynamicId, profileId);
                if (!(loaded instanceof spinal_model_graph_1.SpinalContext))
                    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE, `Node ${entry.contextDynamicId} is not a SpinalContext`);
                context = loaded;
            }
            const relation = parent.children
                .getElement(entry.relationType)
                ?.getElement(entry.relationName);
            const exists = relation?.getChildrenIds().includes(child.getId().get()) ?? false;
            if (exists &&
                context &&
                !(relation.belongsToContext(context) && child.belongsToContext(context)))
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, "Child is already attached but not in the requested context");
            if (!exists) {
                if (context)
                    await parent.addChildInContext(child, entry.relationName, entry.relationType, context);
                else
                    await parent.addChild(child, entry.relationName, entry.relationType);
            }
            data.push({
                ...entry,
                index,
                parentDynamicId: parentId,
                status: exists ? "alreadyAttached" : "attached",
            });
        }
        catch (error) {
            console.error(error);
            errors.push({
                ...((0, createErrorMsgItem_1.isErrorItem)(error)
                    ? error
                    : (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, "Unexpected error while attaching child")),
                index,
                child: entry,
            });
        }
    }
    return { data, errors };
}
//# sourceMappingURL=attachChildren.js.map