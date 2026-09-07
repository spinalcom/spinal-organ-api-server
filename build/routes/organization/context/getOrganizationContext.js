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
     * /api/v1/organization/context:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Retrieve all Organization Context or a specific one by name
     *     description: Get all the Organization Context or a specific one if the name query parameter is provided
     *     tags:
     *       - Organization
     *     parameters:
     *       - in: query
     *         name: name
     *         required: false
     *         schema:
     *           type: string
     *           maxLength: 200
     *           minLength: 1
     *           description: name of the organization context to retrieve
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
    app.get('/api/v1/organization/context', (0, express_zod_safe_1.default)({
        query: zod_1.z.strictObject({
            name: zod_1.z.string().max(200).min(1).optional(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { name } = req.query;
            try {
                if (name) {
                    const organizationContext = await (0, spinal_model_user_service_1.getOrganizationContext)(userGraph, name);
                    if (!organizationContext)
                        throw {
                            code: 404,
                            message: `No organization context found with the name ${name}`,
                        };
                    const result = await (0, createBasicNode_1.createBasicNodeSync)(organizationContext, [
                        'color',
                    ]);
                    res.status(200).json(result);
                }
                else {
                    const organizationContexts = await (0, spinal_model_user_service_1.getOrganizationContext)(userGraph);
                    const results = await Promise.all(organizationContexts.map((context) => (0, createBasicNode_1.createBasicNodeSync)(context, ['color'])));
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
//# sourceMappingURL=getOrganizationContext.js.map