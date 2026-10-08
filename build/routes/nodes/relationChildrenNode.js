"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_model_graph_1 = require("spinal-model-graph");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/relation/{id}/children_node:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the children held by a relation
     *     description: >-
     *       Takes the dynamic ID of a **relation** (not of a node) and returns the nodes it points to.
     *       Relation dynamic IDs are the ones exposed in the `children_relation_list` /
     *       `parent_relation_list` of a node.
     *
     *
     *       The ID must designate a `SpinalRelationLstPtr`, `SpinalRelationPtrLst` or
     *       `SpinalRelationRef`; any other model is rejected with 400. Nodes come back in their short
     *       form (`dynamicId`, `staticId`, `name`, `type`).
     *     tags:
     *       - Nodes
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the relation.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The nodes held by the relation.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: The given ID is not a relation ("The given id is not an expected relation instance").
     *       401:
     *         description: The profile is not allowed to read this relation.
     *       500:
     *         description: The relation could not be loaded or read.
     */
    app.get('/api/v1/relation/:id/children_node', async (req, res, next) => {
        try {
            let nodes;
            var node_list = [];
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const relation = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (relation instanceof spinal_model_graph_1.SpinalRelationLstPtr ||
                relation instanceof spinal_model_graph_1.SpinalRelationPtrLst ||
                relation instanceof spinal_model_graph_1.SpinalRelationRef) {
                nodes = await relation.getChildren();
                for (let index = 0; index < nodes.length; index++) {
                    // const children_node = childrensNode(nodes[index]);
                    // const parent_node = await parentsNode(nodes[index]);
                    const info = {
                        dynamicId: nodes[index]._server_id,
                        staticId: nodes[index].getId().get(),
                        name: nodes[index].getName().get(),
                        type: nodes[index].getType().get(),
                        // children_relation_list: children_node,
                        // parent_relation_list: parent_node,
                    };
                    node_list.push(info);
                }
                return res.json(node_list);
            }
            else {
                return res.status(400).send('The given id is not an expected relation instance');
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=relationChildrenNode.js.map