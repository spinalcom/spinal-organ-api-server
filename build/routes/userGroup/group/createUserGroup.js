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
const spinal_model_user_service_1 = require("spinal-model-user-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const createBasicNode_1 = require("../../../utilities/createBasicNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user-group/context/{contextId}/category/{categoryId}/group:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Create a new user group in a specific category within a user group context
     *     description: Create a new user group in a specific category within a user group context
     *     tags:
     *       - User Group
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *         description: The ID of the user group context to retrieve
     *       - in: path
     *         name: categoryId
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *         description: The ID of the user group category to retrieve
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *                 maxLength: 200
     *                 minLength: 1
     *                 description: name of the user group to create
     *               color:
     *                 type: string
     *                 pattern: '^#([A-Fa-f0-9]{6})$'
     *                 description: Hexadecimal color code for the user group (e.g., #RRGGBB)
     *     responses:
     *       201:
     *         description: Successfully created the user group
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BasicNodeWithColor'
     *       401:
     *         description: no graph found for the user
     */
    app.post('/api/v1/user-group/context/:contextId/category/:categoryId/group', (0, express_zod_safe_1.default)({
        params: zod_1.z.object({
            contextId: zod_1.z.coerce.number().positive(),
            categoryId: zod_1.z.coerce.number().positive(),
        }),
        body: zod_1.z.strictObject({
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
            try {
                const userGroupContexts = await (0, spinal_model_user_service_1.getSpinalUserGroupContext)(userGraph);
                const { contextId, categoryId } = req.params;
                const userGroupContext = userGroupContexts.find((context) => context._server_id === contextId);
                if (!userGroupContext)
                    throw {
                        code: 404,
                        message: `No user group context found with id ${req.params.contextId}`,
                    };
                const categories = await (0, spinal_model_user_service_1.getGroupingCategory)(userGroupContext);
                const category = categories.find((cat) => cat._server_id === categoryId);
                if (!category)
                    throw {
                        code: 404,
                        message: `No user group category found with id ${req.params.categoryId} in context ${req.params.contextId}`,
                    };
                const { name, color } = req.body;
                const group = await (0, spinal_model_user_service_1.createSpinalUserGroup)(userGroupContext, category, name, color);
                const result = await (0, createBasicNode_1.createBasicNodeSync)(group, ['color']);
                res.status(201).json(result);
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to create user group in the specified category and context',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while creating the user group in the specified category and context');
        }
    });
};
//# sourceMappingURL=createUserGroup.js.map