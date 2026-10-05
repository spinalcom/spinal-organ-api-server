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
     *     summary: Get the node that owns a relation
     *     description: >-
     *       Takes the dynamic ID of a **relation** (not of a node) and returns the single node that owns
     *       it - the parent side of the relation. The response is one object, not an array.
     *
     *
     *       The ID must designate a `SpinalRelationLstPtr`, `SpinalRelationPtrLst` or
     *       `SpinalRelationRef`; any other model is rejected with 400.
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
     *         description: The node that owns the relation.
     *         content:
     *           application/json:
     *             schema:
     *              $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: The given ID is not a relation ("The given id is not an expected relation instance").
     *       401:
     *         description: The profile is not allowed to read this relation.
     *       500:
     *         description: The relation could not be loaded or read.
     */
    app.get('/api/v1/relation/:id/parent_node', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            let parent;
            const relation = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (relation instanceof spinal_model_graph_1.SpinalRelationLstPtr ||
                relation instanceof spinal_model_graph_1.SpinalRelationPtrLst ||
                relation instanceof spinal_model_graph_1.SpinalRelationRef) {
                parent = await relation.getParent();
                //const children_node = childrensNode(parent);
                //const parent_node = await parentsNode(parent);
                const info = {
                    dynamicId: parent._server_id,
                    staticId: parent.getId().get(),
                    name: parent.getName().get(),
                    type: parent.getType().get(),
                    //parent_relation_list: parent_node,
                };
                return res.json(info);
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
//# sourceMappingURL=relationParentNode.js.map