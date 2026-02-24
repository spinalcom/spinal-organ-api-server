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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getInventory_1 = require("../../../utilities/getInventory");
module.exports = function (logger, app, spinalAPIMiddleware) {
    const parseOptionalId = (value) => {
        if (typeof value === "number" && Number.isFinite(value))
            return value;
        if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
            return Number(value);
        return undefined;
    };
    /**
     * @swagger
     * /api/v1/floor/{id}/inventory:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Gets floor inventory details ( room inventory or equipment inventory  depending on given context)
     *     summary: Gets floor inventory
     *     tags:
     *       - Geographic Context
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Use the dynamic ID of the floor
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: query
     *         name: includePosition
     *         description: Include position details in the response
     *         required: false
     *         schema:
     *           type: boolean
     *       - in: query
     *         name: includeArea
     *         description: Include area details in the response
     *         required: false
     *         schema:
     *           type: boolean
     *       - in: query
     *         name: onlyDynamicId
     *         description: Only include dynamic ID in the response
     *         required: false
     *         schema:
     *           type: boolean
     *
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               context:
     *                 type: string
     *               contextId:
     *                 type: integer
     *               category:
     *                 type: string
     *               categoryId:
     *                 type: integer
     *               groups:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Optional list of group names
     *               groupIds:
     *                 type: array
     *                 items:
     *                   type: integer
     *                 description: Optional list of group dynamic IDs
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InventoryRoomDetails'
     *       400:
     *         description: Bad request
     */
    app.post("/api/v1/floor/:id/inventory", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const contexts = await graph.getChildren("hasContext");
            const contextId = parseOptionalId(req.body.contextId);
            const groupContext = contexts.find(e => contextId !== undefined ? e._server_id === contextId : e.getName().get() === req.body.context);
            if (!groupContext)
                throw { code: 400, message: "context not found" };
            const includePosition = req.query.includePosition === "true" || false;
            const includeArea = req.query.includeArea === "true" || false;
            const onlyDynamicId = req.query.onlyDynamicId === "true" || false;
            const reqInfo = {
                ...req.body,
                includePosition,
                includeArea,
                onlyDynamicId,
            };
            const inventory = await (0, getInventory_1.getFloorInventory)(spinalAPIMiddleware, profileId, groupContext, parseInt(req.params.id, 10), reqInfo);
            return res.json(inventory);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message || "ko");
        }
    });
};
//# sourceMappingURL=floorInventory.js.map