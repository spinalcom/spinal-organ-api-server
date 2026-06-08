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
const createBasicNode_1 = require("../../../utilities/createBasicNode");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/organization/context/{contextId}/organization/{organizationId}/room-group:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Retrieve all the room groups from an Organization
     *     description: Get all the room groups linked to a specific Organization by their ID
     *     tags:
     *       - Organization
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: number
     *           format: int64
     *           minimum: 1
     *           description: ID of the organization context
     *       - in: path
     *         name: organizationId
     *         required: true
     *         schema:
     *           type: number
     *           format: int64
     *           minimum: 1
     *           description: ID of the organization to retrieve the room group from
     *     responses:
     *       200:
     *         description: Retrieve Successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNodeWithColor'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       404:
     *         description: Organization context not found
     *       401:
     *         description: no graph found for the user
     */
    app.get('/api/v1/organization/context/:contextId/organization/:organizationId/room-group', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            contextId: zod_1.z.coerce.number().positive(),
            organizationId: zod_1.z.coerce.number().positive(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { contextId, organizationId } = req.params;
            const organizationContexts = await (0, spinal_model_user_service_1.getOrganizationContext)(userGraph);
            const organizationContext = organizationContexts.find((context) => context._server_id === contextId);
            try {
                if (!organizationContext)
                    throw {
                        code: 404,
                        message: `No organization context found with the ID ${contextId}`,
                    };
                const organizationParent = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, organizationId, profileId, spinal_model_user_service_1.SPINAL_ORGANIZATION_TYPE);
                const roomGroups = await (0, spinal_model_user_service_1.getgeographicRoomGroupFromOrganization)(organizationParent, organizationContext);
                const results = await Promise.all(roomGroups.map((roomGroup) => (0, createBasicNode_1.createBasicNodeSync)(roomGroup, ['color'])));
                res.status(200).json(results);
            }
            catch (error) {
                if (error?.code && error?.message) {
                    throw error;
                }
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to retrieve organization context',
                };
            }
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
//# sourceMappingURL=getRoomGroupsFromOrganization.js.map