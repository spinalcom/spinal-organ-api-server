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
exports.linkNodeToGroups = linkNodeToGroups;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const loadAndValidateNode_1 = require("../loadAndValidateNode");
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
async function linkNodeToGroups(spinalAPIMiddleware, profileId, node, groups) {
    const errors = [];
    const success = [];
    for (const { contextDynamicId, groupDynamicId } of groups) {
        try {
            // load context and group nodes
            const [contextNode, groupNode] = await Promise.all([
                (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, contextDynamicId, profileId, `${node.info.type.get()}GroupContext`),
                (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, contextDynamicId, profileId, `${node.info.type.get()}Group`),
            ]);
            if (!contextNode) {
                throw new Error(`Context node with dynamic ID ${contextDynamicId} not found`);
            }
            if (!groupNode) {
                throw new Error(`Group node with dynamic ID ${groupDynamicId} not found`);
            }
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(contextNode);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(groupNode);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            await spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.linkElementToGroup(contextNode.info.id.get(), groupNode.info.id.get(), node.info.id.get());
            success.push({ contextDynamicId, groupDynamicId });
        }
        catch (error) {
            errors.push({ contextDynamicId, groupDynamicId });
        }
    }
    return { success, errors };
}
//# sourceMappingURL=linkNodeToGroups.js.map