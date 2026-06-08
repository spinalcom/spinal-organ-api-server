"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const express_zod_safe_1 = __importDefault(require("express-zod-safe"));
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_user_service_1 = require("spinal-model-user-service");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/organization/room-group:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Add a room group to an Organization
     *     description: Add a room group linked to a specific Organization
     *     tags:
     *       - Organization
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - query
     *             properties:
     *               query:
     *                 type: array
     *                 minLength: 1
     *                 items:
     *                   type: object
     *                   required:
     *                     - contextOrganizationDynamicId
     *                     - organizationDynamicId
     *                     - roomGroupDynamicIds
     *                   properties:
     *                     contextOrganizationDynamicId:
     *                       type: number
     *                       format: int64
     *                       minimum: 1
     *                       description: ID of the organization context
     *                     organizationDynamicId:
     *                       type: number
     *                       format: int64
     *                       minimum: 1
     *                       description: ID of the organization to add the room group to
     *                     roomGroupDynamicIds:
     *                       type: array
     *                       description: IDs of the room groups to add to the organization
     *                       items:
     *                         type: number
     *                         format: int64
     *                         minimum: 1
     *     responses:
     *       200:
     *         description: Successfully added room groups to the organization
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 successfullyAdded:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     format: int64
     *                   description: array of dynamic IDs of the room groups that were successfully added to an organization
     *                 failedToAdd:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     format: int64
     *                   description: array of dynamic IDs of the room groups that failed to be added to an organization
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       404:
     *         description: Organization context not found
     *       401:
     *         description: no graph found for the user
     */
    app.post('/api/v1/organization/room-group', (0, express_zod_safe_1.default)({
        body: zod_1.z.strictObject({
            query: zod_1.z
                .array(zod_1.z.strictObject({
                contextOrganizationDynamicId: zod_1.z.coerce.number().positive(),
                organizationDynamicId: zod_1.z.coerce.number().positive(),
                roomGroupDynamicIds: zod_1.z.array(zod_1.z.coerce.number().positive()).min(1),
            }))
                .min(1),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { query } = req.body;
            const organizationContexts = await (0, spinal_model_user_service_1.getOrganizationContext)(userGraph);
            const results = { successfullyAdded: [], failedToAdd: [] };
            // Process query in batches of 25
            for (let i = 0; i < query.length; i += 25) {
                const batch = query.slice(i, i + 25);
                await Promise.all(batch.map(async (addReq) => {
                    const { contextOrganizationDynamicId, organizationDynamicId, roomGroupDynamicIds, } = addReq;
                    try {
                        const organizationContext = organizationContexts.find((context) => context._server_id === contextOrganizationDynamicId);
                        if (!organizationContext)
                            throw ''; // Will be caught by the catch block below and handled as a failed addition
                        const [organizationNode, loadedRoomGroups] = await Promise.all([
                            (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, organizationDynamicId, profileId, spinal_model_user_service_1.SPINAL_ORGANIZATION_TYPE),
                            (0, loadAndValidateNode_1.loadAndValidateNodeMultiple)(spinalAPIMiddleware, roomGroupDynamicIds, profileId, spinal_model_user_service_1.SPINAL_ROOM_GROUP_TYPE),
                        ]);
                        results.failedToAdd.push(...loadedRoomGroups.failedServerIds); // If some room groups failed to load, consider them as failed additions
                        const resultsSettled = await Promise.allSettled(loadedRoomGroups.successful.map(async (roomGroupNode) => {
                            try {
                                await (0, spinal_model_user_service_1.addgeographicRoomGroupToOrganization)(organizationContext, organizationNode, roomGroupNode);
                                return roomGroupNode._server_id;
                            }
                            catch (error) {
                                throw roomGroupNode._server_id;
                            }
                        }));
                        resultsSettled.forEach((result, index) => {
                            if (result.status === 'fulfilled') {
                                results.successfullyAdded.push(result.value);
                            }
                            else {
                                results.failedToAdd.push(result.reason);
                            }
                        });
                        // results.successfullyAdded.push(...roomGroupDynamicIds);
                    }
                    catch (error) {
                        results.failedToAdd.push(...addReq.roomGroupDynamicIds);
                    }
                }));
            }
            res.status(200).json(results);
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while retrieving the organization context');
        }
    });
};
//# sourceMappingURL=addRoomGroupFromOrganization.js.map