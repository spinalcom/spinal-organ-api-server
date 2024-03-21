"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corseChildrenAndParentNode_1 = require("../../utilities/corseChildrenAndParentNode");
const spinal_model_graph_1 = require("spinal-model-graph");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
    * @swagger
    * /api/v1/relation/{id}/parent_node:
    *   get:
    *     security:
    *       - bearerAuth:
    *         - readOnly
    *     description: Return parents of relation node
    *     summary: Gets parents of relation with given ID node
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
    app.get("/api/v1/relation/:id/parent_node", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            let parent;
            var info;
            const relation = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (relation instanceof spinal_model_graph_1.SpinalRelationLstPtr || relation instanceof spinal_model_graph_1.SpinalRelationPtrLst || relation instanceof spinal_model_graph_1.SpinalRelationRef) {
                parent = await relation.getParent();
                const children_node = (0, corseChildrenAndParentNode_1.childrensNode)(parent);
                const parent_node = await (0, corseChildrenAndParentNode_1.parentsNode)(parent);
                info = {
                    dynamicId: parent._server_id,
                    staticId: parent.getId().get(),
                    name: parent.getName().get(),
                    type: parent.getType().get(),
                    children_relation_list: children_node,
                    parent_relation_list: parent_node
                };
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(info);
    });
};
//# sourceMappingURL=relationParentNode.js.map