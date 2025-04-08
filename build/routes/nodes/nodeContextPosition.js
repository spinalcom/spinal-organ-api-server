"use strict";
/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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
const getNodePositionInContext_1 = require("../../utilities/getNodePositionInContext");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/{contextId}/node/{nodeId}/get_position:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Get node position in a context
     *     summary: Get node position in a context
     *     tags:
     *       - Geographic Context
     *     parameters:
     *      - in: path
     *        name: contextId
     *        description: use the dynamic context ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: nodeId
     *        description: use the dynamic node ID
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
     *                $ref: '#/components/schemas/RoomPosition'
     *       400:
     *         description: Bad request
      */
    app.get("/api/v1/context/:contextId/node/:nodeId/get_position", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            //const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            //const contexts = await graph.getChildren("hasContext");
            //const groupContext = contexts.find(e => e.getName().get() === req.body.context);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
            const context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            const result = await (0, getNodePositionInContext_1.getNodePositionInContext)(context, node);
            return res.json(result);
            //res.json(position);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send(error.message || "Failed to get position");
        }
    });
};
//# sourceMappingURL=nodeContextPosition.js.map