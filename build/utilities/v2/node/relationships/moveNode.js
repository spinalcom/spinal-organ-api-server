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
exports.moveNode = moveNode;
const spinal_model_graph_1 = require("spinal-model-graph");
const loadAndValidateNode_1 = require("../../../loadAndValidateNode");
const createErrorMsgItem_1 = require("../../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../errorHandler/EApiErrorType");
async function moveNode(middleware, profileId, nodeId, { from, to }) {
    if (to.parentDynamicId === nodeId)
        throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, 'Destination parent cannot be the moved node');
    const node = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, nodeId, profileId);
    const source = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, from.parentDynamicId, profileId);
    const destination = from.parentDynamicId === to.parentDynamicId
        ? source
        : await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, to.parentDynamicId, profileId);
    let context;
    if (to.contextDynamicId !== undefined) {
        const loaded = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, to.contextDynamicId, profileId);
        if (!(loaded instanceof spinal_model_graph_1.SpinalContext))
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE, 'contextDynamicId must identify a SpinalContext');
        context = loaded;
    }
    const sourceRelation = source.children
        .getElement(from.relationType)
        ?.getElement(from.relationName);
    const destinationRelation = destination.children
        .getElement(to.relationType)
        ?.getElement(to.relationName);
    const sourceExists = sourceRelation?.getChildrenIds().includes(node.getId().get()) ?? false;
    const destinationExists = destinationRelation?.getChildrenIds().includes(node.getId().get()) ?? false;
    if (destinationExists &&
        context &&
        !(destinationRelation.belongsToContext(context) &&
            node.belongsToContext(context)))
        throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, 'Destination link exists but does not satisfy the requested context membership');
    if (!sourceExists && !destinationExists)
        throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, 'Source link is absent and destination link is absent');
    const sameLink = from.parentDynamicId === to.parentDynamicId &&
        from.relationType === to.relationType &&
        from.relationName === to.relationName;
    const result = (status, destinationAction, sourceAction) => ({
        data: { nodeDynamicId: nodeId, status, destinationAction, sourceAction },
    });
    if (sameLink)
        return result('unchanged', 'unchanged', 'unchanged');
    if (!sourceExists)
        return result('alreadyMoved', 'alreadyAttached', 'alreadyDetached');
    let stage = 'attachDestination';
    try {
        if (!destinationExists) {
            if (context)
                await destination.addChildInContext(node, to.relationName, to.relationType, context);
            else
                await destination.addChild(node, to.relationName, to.relationType);
        }
        stage = 'detachSource';
        await source.removeChild(node, from.relationName, from.relationType);
    }
    catch (error) {
        console.error(error);
        throw {
            ...(0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, stage === 'attachDestination'
                ? 'Destination attachment failed; source detachment was not attempted'
                : 'Destination attachment completed or already existed, but source detachment failed'),
            stage,
            state: {
                destination: stage === 'attachDestination'
                    ? 'unknown'
                    : destinationExists
                        ? 'alreadyAttached'
                        : 'attached',
                source: stage === 'attachDestination' ? 'notAttempted' : 'unknown',
            },
        };
    }
    return result('moved', destinationExists ? 'alreadyAttached' : 'attached', 'detached');
}
//# sourceMappingURL=moveNode.js.map