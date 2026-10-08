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
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the parents of a node
     *     description: >-
     *       Returns the direct parents of a node, through **every** relation it belongs to - a node can
     *       have several parents in the Spinal graph. To restrict the walk to named relations, or to stay
     *       inside a context, use the POST variants `/api/v1/node/{id}/parents` and
     *       `/api/v1/context/{idContext}/node/{idNode}/parents`.
     *
     *
     *       Parents are returned in their short form only : `dynamicId`, `staticId`, `name` and `type`.
     *     tags:
     *       - Nodes
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the node.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The direct parents of the node (an empty array for a graph root).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: The node could not be loaded (unknown or stale dynamic ID).
     *       401:
     *         description: The profile is not allowed to read this node.
     */
    app.get("/api/v1/node/:id/parents", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var info = await (0, getParentNodesInfo_1.getParentNodesInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10));
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("ko");
        }
        res.json(info);
    });
};
//# sourceMappingURL=nodeParents.js.map