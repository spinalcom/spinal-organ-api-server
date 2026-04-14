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
const getUserData_1 = require("../../../utilities/getUserData");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user/context/{contextId}/user:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: create a SpinalUser in a SpinalUserContext
     *     description: Create a SpinalUser in a SpinalUserContext.
     *     tags:
     *       - User
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *           description: dynamic ID of the user context to retrieve
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 maxLength: 200
     *               attributes:
     *                 type: object
     *                 additionalProperties:
     *                   type: string
     *     responses:
     *       201:
     *         description: Create Successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/IUser'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       404:
     *         description: User context not found
     *       401:
     *         description: no graph found for the user
     */
    app.post('/api/v1/user/context/:contextId/user', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            contextId: zod_1.z.coerce.number().positive(),
        }),
        body: zod_1.z.strictObject({
            email: zod_1.z.string().max(200),
            attributes: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { contextId } = req.params;
            const { email, attributes } = req.body;
            try {
                const userContexts = await (0, spinal_model_user_service_1.getSpinalUserContexts)(userGraph);
                const userContext = userContexts.find((context) => context._server_id === contextId);
                if (!userContext)
                    throw {
                        code: 404,
                        message: `No user context found with the ID ${contextId}`,
                    };
                const newUser = await (0, spinal_model_user_service_1.createSpinalUser)(userContext, email, attributes);
                const result = await (0, getUserData_1.getUserData)(newUser, true, false, false);
                res.status(201).json(result);
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to retrieve user data',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while retrieving the user data');
        }
    });
};
//# sourceMappingURL=createUser.js.map