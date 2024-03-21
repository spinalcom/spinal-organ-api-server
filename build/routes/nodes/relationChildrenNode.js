"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corseChildrenAndParentNode_1 = require("../../utilities/corseChildrenAndParentNode");
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
    *     description: Return cildrens of relation node
    *     summary: Get childrens of relation with given ID node
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
    *         description: Success
    *         content:
    *           application/json:
    *             schema:
    *               type: array
    *               items:
    *                $ref: '#/components/schemas/Node'
    *       400:
    *         description: Bad request
    */
    app.get("/api/v1/relation/:id/children_node", async (req, res, next) => {
        try {
            let nodes;
            var node_list = [];
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const relation = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (relation instanceof spinal_model_graph_1.SpinalRelationLstPtr || relation instanceof spinal_model_graph_1.SpinalRelationPtrLst || relation instanceof spinal_model_graph_1.SpinalRelationRef) {
                nodes = await relation.getChildren();
                for (let index = 0; index < nodes.length; index++) {
                    const children_node = (0, corseChildrenAndParentNode_1.childrensNode)(nodes[index]);
                    const parent_node = await (0, corseChildrenAndParentNode_1.parentsNode)(nodes[index]);
                    const info = {
                        dynamicId: nodes[index]._server_id,
                        staticId: nodes[index].getId().get(),
                        name: nodes[index].getName().get(),
                        type: nodes[index].getType().get(),
                        children_relation_list: children_node,
                        parent_relation_list: parent_node
                    };
                    node_list.push(info);
                }
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(node_list);
    });
};
//# sourceMappingURL=relationChildrenNode.js.map