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
const getParentNodesInfo_1 = require("../../utilities/getParentNodesInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/parents:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the parents of a node, through chosen relations
     *     description: >-
     *       Same as `GET /api/v1/node/{id}/parents`, but the body restricts the walk to the relation
     *       names it lists. An empty array behaves like the GET route and follows every relation.
     *     tags:
     *       - Nodes
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Dynamic ID of the node.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     requestBody:
     *       required: true
     *       description: >-
     *         The relation names to follow. An **empty array follows every relation** the node carries.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: string
     *             example: ["hasGeographicRoom"]
     *     responses:
     *       200:
     *         description: The parents reached through the requested relations.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: The body is not an array, or the node could not be loaded.
     *       401:
     *         description: The profile is not allowed to read this node.
     */
    app.post("/api/v1/node/:id/parents", async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const nodeId = parseInt(req.params.id, 10);
            const relations = req.body;
            if (!Array.isArray(relations)) {
                return res.status(400).send("Invalid relations format; an array is expected");
            }
            const parentsInfo = await (0, getParentNodesInfo_1.getParentNodesInfo)(spinalAPIMiddleware, profileId, nodeId, relations);
            res.json(parentsInfo);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("ko");
        }
    });
};
//# sourceMappingURL=nodeParentsSpecificRelations.js.map