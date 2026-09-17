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
     * /api/v1/organization/{organizationId}/parents:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Get the direct parents organization of an Organization
     *     description: Retrieve the parent organization of a specific Organization by its ID
     *     tags:
     *       - Organization
     *     parameters:
     *       - in: path
     *         name: organizationId
     *         required: true
     *         schema:
     *           type: number
     *           format: int64
     *           minimum: 1
     *           description: ID of the organization to retrieve the parent organization from
     *     responses:
     *       200:
     *         description: Parents organization retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNodeWithColor'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       404:
     *         description: Organization not found
     *       401:
     *         description: Unauthorized - No graph found for the user
     */
    app.get('/api/v1/organization/:organizationId/parents', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            organizationId: zod_1.z.coerce.number().positive(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { organizationId } = req.params;
            try {
                const organization = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, organizationId, profileId, spinal_model_user_service_1.SPINAL_ORGANIZATION_TYPE);
                const parentOrganizations = await (0, spinal_model_user_service_1.getParentOrganizationFromOrganization)(organization);
                const result = await Promise.all(parentOrganizations.map(async (parentOrganization) => {
                    return (0, createBasicNode_1.createBasicNodeSync)(parentOrganization, [
                        'color',
                    ]);
                }));
                res.status(200).json(result);
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to retrieve organization',
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
//# sourceMappingURL=getOrganizationParents.js.map