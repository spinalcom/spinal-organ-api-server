"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getNode(spinalAPIMiddleware, dynamicId, staticId, profileId) {
    if (dynamicId) {
        try {
            const node = await spinalAPIMiddleware.load(parseInt(dynamicId, 10), profileId);
            return node;
        }
        catch (error) {
        }
    }
    if (staticId && typeof staticId === "string") {
        const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(staticId);
        if (node !== undefined) {
            return node;
        }
        else {
            const context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext("spatial");
            if (context === undefined) {
                return undefined;
            }
            else {
                const it = context.visitChildrenInContext(context);
                for await (const node of it) {
                    if (node.info.id.get() === staticId) {
                        return node;
                    }
                }
            }
        }
    }
}
exports.default = getNode;
//# sourceMappingURL=getNode.js.map