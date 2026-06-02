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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/organization/context/{contextId}/organization:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Retrieve the Organizations from an Organization Context by the context ID
     *     description: Get a list of Organizations linked to a specific Organization Context by its ID, if the name query parameter is provided, it will filter the organizations by name
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
     *           description: ID of the organization context to retrieve
     *       - in: query
     *         name: name
     *         required: false
     *         schema:
     *           type: string
     *           maxLength: 200
     *           minLength: 1
     *           description: name of the organization to filter by
     *     responses:
     *       200:
     *         description: Retrieve Successfully
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - type: array
     *                   items:
     *                     $ref: '#/components/schemas/BasicNodeWithColor'
     *                 - $ref: '#/components/schemas/BasicNodeWithColor'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       404:
     *         description: Organization context not found
     *       401:
     *         description: no graph found for the user
     */
    app.get('/api/v1/organization/context/:contextId/organization', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            contextId: zod_1.z.coerce.number().positive(),
        }),
        query: zod_1.z.strictObject({
            name: zod_1.z.string().max(200).min(1).optional(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { contextId } = req.params;
            const { name } = req.query;
            const organizationContexts = await (0, spinal_model_user_service_1.getOrganizationContext)(userGraph);
            const organizationContext = organizationContexts.find((context) => context._server_id === contextId);
            if (!organizationContext)
                throw {
                    code: 404,
                    message: `No organization context found with the ID ${contextId}`,
                };
            try {
                if (name) {
                    const organization = await (0, spinal_model_user_service_1.getOrganizationFromOrganizationContext)(organizationContext, name);
                    if (!organization)
                        throw {
                            code: 404,
                            message: `No organization found with the name ${name}`,
                        };
                    const result = await (0, createBasicNode_1.createBasicNodeSync)(organization, [
                        'color',
                    ]);
                    res.status(200).json(result);
                }
                else {
                    const organizations = await (0, spinal_model_user_service_1.getOrganizationFromOrganizationContext)(organizationContext);
                    const results = await Promise.all(organizations.map((organization) => (0, createBasicNode_1.createBasicNodeSync)(organization, ['color'])));
                    res.status(200).json(results);
                }
            }
            catch (error) {
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
//# sourceMappingURL=getOrganizationFromContext.js.map