"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
const requestUtilities_1 = require("../../utilities/requestUtilities");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/delete_smart:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Delete node and all descendants up to the first descendant that have a parent from another branch
     *     summary: Delete an entire branch of nodes until the first node that has a parent from another branch
     *     tags:
     *       - Nodes
     *     parameters:
     *      - in: path
     *        name: id
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: Node(s) successfully deleted
     *       400:
     *         description: Bad request
     */
    app.delete('/api/v1/node/:id/delete_smart', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const nodeId = req.params.id;
            const node = await spinalAPIMiddleware.load(parseInt(nodeId, 10), profileId);
            const nodes_to_delete = [node];
            await recTagDelete(nodes_to_delete, node);
            //SpinalGraphService._addNode(node);
            //await SpinalGraphService.removeFromGraph(node.getId().get());
            const formated_nodes = formatNodesByType(nodes_to_delete);
            return res.status(200).json(formated_nodes);
            //return res.status(204).send("Node successfully deleted");
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json();
    });
};
async function recTagDelete(nodes_to_delete, node) {
    const children = await node.getChildren();
    for (const child of children) {
        const parents = await child.getParents();
        if (parents.length === 1) {
            nodes_to_delete.push(child);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(child);
            await recTagDelete(nodes_to_delete, child);
        }
    }
}
function formatNodesByType(nodes) {
    const map = {};
    for (const node of nodes) {
        const type = node.getType().get();
        if (map[type]) {
            map[type] += 1;
        }
        else {
            map[type] = 1;
        }
    }
    return { 'deleted_nodes_by_type': map, 'total': nodes.length };
}
//# sourceMappingURL=nodeDeleteSmart.js.map