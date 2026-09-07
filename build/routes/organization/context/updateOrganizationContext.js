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
const zodAtLeastOne_1 = require("../../../utilities/zodAtLeastOne");
const safeSetAttr_1 = require("../../../utilities/safeSetAttr");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/organization/context/{contextId}:
     *   patch:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Update an Organization Context by ID
     *     description: Update a specific Organization Context by its ID
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
     *           description: ID of the organization context to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 maxLength: 200
     *                 minLength: 1
     *                 description: name of the organization context to update
     *               color:
     *                 type: string
     *                 pattern: '^#([A-Fa-f0-9]{6})$'
     *                 description: Hexadecimal color code for the organization context (e.g., #RRGGBB)
     *     responses:
     *       200:
     *         description: Update Successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BasicNodeWithColor'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       404:
     *         description: Organization context not found
     *       401:
     *         description: no graph found for the user
     */
    app.patch('/api/v1/organization/context/:contextId', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            contextId: zod_1.z.coerce.number().positive(),
        }),
        body: (0, zodAtLeastOne_1.atLeastOne)(zod_1.z.strictObject({
            name: zod_1.z.string().max(200).min(1).optional(),
            color: zod_1.z
                .string()
                .regex(/^#([A-Fa-f0-9]{6})$/)
                .optional(),
        })),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { contextId } = req.params;
            try {
                const organizationContexts = await (0, spinal_model_user_service_1.getOrganizationContext)(userGraph);
                const organizationContext = organizationContexts.find((context) => context._server_id === contextId);
                if (!organizationContext)
                    throw {
                        code: 404,
                        message: `No organization context found with the ID ${contextId}`,
                    };
                const { name, color } = req.body;
                (0, safeSetAttr_1.safeSetAttr)(organizationContext.info, 'name', name);
                (0, safeSetAttr_1.safeSetAttr)(organizationContext.info, 'color', color);
                const result = await (0, createBasicNode_1.createBasicNodeSync)(organizationContext, [
                    'color',
                ]);
                res.status(200).json(result);
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to update organization context',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while updating the organization context');
        }
    });
};
//# sourceMappingURL=updateOrganizationContext.js.map