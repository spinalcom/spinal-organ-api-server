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
const getChildrenNodesInfo_1 = require("../../utilities/getChildrenNodesInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/children:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the children of a node
     *     description: >-
     *       Returns the direct children of a node, through **every** relation it carries. To restrict the
     *       walk to named relations, or to stay inside a context, use the POST variants
     *       `/api/v1/node/{id}/children` and `/api/v1/context/{idContext}/node/{idNode}/children`.
     *
     *
     *       Each child is returned in its short form (`dynamicId`, `staticId`, `name`, `type`) plus the
     *       display and BIM fields when it carries them (`icon`, `bimFileId`, `dbid`).
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
     *         description: The direct children of the node (an empty array if it has none).
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
    app.get("/api/v1/node/:id/children", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const info = await (0, getChildrenNodesInfo_1.getChildrenNodesInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10));
            return res.json(info);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            if (error.message)
                return res.status(400).send(error.message);
            console.error(error);
            return res.status(400).send("ko");
        }
    });
};
//# sourceMappingURL=nodeChildren.js.map