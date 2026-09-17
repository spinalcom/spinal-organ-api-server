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
     * /api/v1/organization:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Create a new Organization
     *     description: Create a new Organization under a specific Organization Context
     *     tags:
     *       - Organization
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - contextDynamicId
     *               - name
     *             properties:
     *               contextDynamicId:
     *                 type: number
     *                 format: int64
     *                 minimum: 1
     *                 description: ID of the organization context to create the organization under
     *               organizationDynamicId:
     *                 type: number
     *                 format: int64
     *                 minimum: 1
     *                 description: ID of the organization to create the organization under, if not provided will be created under the organization context directly
     *               name:
     *                 type: string
     *                 maxLength: 200
     *                 minLength: 1
     *                 description: Name of the organization to create
     *               color:
     *                 type: string
     *                 pattern: '^#([A-Fa-f0-9]{6})$'
     *                 description: Hexadecimal color code for the organization context (e.g., #RRGGBB)
     *     responses:
     *       201:
     *         description: Organization created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               $ref: '#/components/schemas/BasicNodeWithColor'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       401:
     *         description: no graph found for the user
     */
    app.post('/api/v1/organization', (0, express_zod_safe_1.default)({
        body: zod_1.z.strictObject({
            contextDynamicId: zod_1.z.coerce.number().positive(),
            organizationDynamicId: zod_1.z.coerce.number().positive().optional(),
            name: zod_1.z.string().max(200).min(1),
            color: zod_1.z
                .string()
                .regex(/^#([A-Fa-f0-9]{6})$/)
                .optional(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { contextDynamicId, organizationDynamicId, name, color } = req.body;
            const organizationContexts = await (0, spinal_model_user_service_1.getOrganizationContext)(userGraph);
            const organizationContext = organizationContexts.find((context) => context._server_id === contextDynamicId);
            if (!organizationContext)
                throw {
                    code: 404,
                    message: `No organization context found with the ID ${contextDynamicId}`,
                };
            try {
                let node;
                if (!organizationDynamicId ||
                    (organizationDynamicId &&
                        contextDynamicId === organizationDynamicId)) {
                    node = await (0, spinal_model_user_service_1.createOrganizationToOrganizationContext)(organizationContext, name, color);
                }
                else {
                    const parentNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, organizationDynamicId, profileId, spinal_model_user_service_1.SPINAL_ORGANIZATION_TYPE);
                    node = await (0, spinal_model_user_service_1.createOrganizationToOrganization)(organizationContext, parentNode, name, color);
                }
                const result = await (0, createBasicNode_1.createBasicNodeSync)(node, ['color']);
                res.status(201).json(result);
                // if (name) {
                //   const organization = await getOrganizationFromOrganizationContext(
                //     organizationContext,
                //     name
                //   );
                //   if (!organization)
                //     throw {
                //       code: 404,
                //       message: `No organization found with the name ${name}`,
                //     };
                //   const result = await createBasicNodeSync(organization, [
                //     'color',
                //   ] as const);
                //   res.status(200).json(result);
                // } else {
                //   const organizations = await getOrganizationFromOrganizationContext(
                //     organizationContext
                //   );
                //   const results = await Promise.all(
                //     organizations.map((organization) =>
                //       createBasicNodeSync(organization, ['color'] as const)
                //     )
                //   );
                //   res.status(200).json(results);
                // }
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
//# sourceMappingURL=createOrganization.js.map