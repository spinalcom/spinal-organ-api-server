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
     *     summary: Get the inventory of a floor, grouped by group
     *     description: >-
     *       Lists what a floor holds, classified by the groups of a group context. The body picks the
     *       group context and the category inside it, and the response holds one entry per group with its
     *       items.
     *
     *
     *       What gets classified depends on the type of the group context :
     *
     *        * a `geographicRoomGroupContext` classifies the **rooms** of the floor;
     *
     *        * any other group context (typically a `BIMObjectGroupContext`) classifies the **BIM
     *          objects** of those rooms, and each item then carries the `room` it belongs to.
     *
     *
     *       With a BIM object context `includeArea` is forced off, since area only makes sense for rooms.
     *       An item that belongs to several matching groups is listed under each of them.
     *
     *
     *       The node must be a `geographicFloor` - any other type is rejected.
     *     tags:
     *       - Geographic Context
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Dynamic ID of the floor.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: query
     *         name: includePosition
     *         description: >-
     *           Add a `position` to every item, read from its `XYZ center` attribute in the `Spatial`
     *           category. Items without that attribute get `{ x: null, y: null, z: null }`.
     *         required: false
     *         schema:
     *           type: boolean
     *           default: false
     *       - in: query
     *         name: includeArea
     *         description: >-
     *           Add an `area` to every item, read from its `area` attribute in the `Spatial` category
     *           (`null` when absent). Only meaningful when the items are rooms.
     *         required: false
     *         schema:
     *           type: boolean
     *           default: false
     *       - in: query
     *         name: onlyDynamicId
     *         description: >-
     *           Reduce every item to its `dynamicId` - name, type, staticId, dbid, bimFileId and color
     *           are left out. Much lighter on large inventories.
     *         required: false
     *         schema:
     *           type: boolean
     *           default: false
     *       - in: query
     *         name: includeUnassignedItems
     *         description: >-
     *           Append an extra group named `unassignedItems` holding the items that matched no group.
     *           The group is only added when at least one item is unassigned, and it carries no
     *           `dynamicId` / `type` / `color`.
     *         required: false
     *         schema:
     *           type: boolean
     *           default: false
     *     requestBody:
     *       required: true
     *       description: >-
     *         Selects the group context, the category inside it, and optionally the groups to keep.
     *         Each pair accepts either a dynamic ID or a name; the ID wins when both are given.
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               context:
     *                 type: string
     *                 description: Name of the group context. Ignored when `contextId` is set.
     *               contextId:
     *                 type: integer
     *                 format: int64
     *                 description: Dynamic ID of the group context.
     *               category:
     *                 type: string
     *                 description: >-
     *                   Name of the category inside the group context. Required in practice : items
     *                   whose group sits in no matching category are silently left out of the result.
     *               categoryId:
     *                 type: integer
     *                 format: int64
     *                 description: Dynamic ID of the category. Ignored when it does not match.
     *               groups:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Optional group names to keep. All groups of the category when omitted.
     *               groupIds:
     *                 type: array
     *                 items:
     *                   type: integer
     *                   format: int64
     *                 description: Optional group dynamic IDs to keep. Takes precedence over `groups`.
     *     responses:
     *       200:
     *         description: One entry per group, each holding the items of the floor that belong to it.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   name:
     *                     type: string
     *                     description: Name of the group.
     *                   dynamicId:
     *                     type: integer
     *                     format: int64
     *                   type:
     *                     type: string
     *                   color:
     *                     type: string
     *                   icon:
     *                     type: string
     *                   groupItems:
     *                     type: array
     *                     items:
     *                       type: object
     *       400:
     *         description: >-
     *           The group context was not found ("context not found"), the node is not a floor
     *           ("node is not of type geographicFloor"), or the floor could not be loaded.
     *       401:
     *         description: The profile is not allowed to read the floor or the group context.
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
            const includeUnassignedItems = req.query.includeUnassignedItems === "true" || false;
            const reqInfo = {
                ...req.body,
                includePosition,
                includeArea,
                onlyDynamicId,
                includeUnassignedItems,
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