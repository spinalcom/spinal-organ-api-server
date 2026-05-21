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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user/context:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Create a user context
     *     description: Create a user context
     *     tags:
     *       - User
     *     requestBody:
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
     *                 description: name of the user context to create
     *               color:
     *                 type: string
     *                 pattern: '^#([A-Fa-f0-9]{6})$'
     *                 description: Hexadecimal color code for the user context (e.g., #RRGGBB)
     *     responses:
     *       201:
     *         description: Create Successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               $ref: '#/components/schemas/BasicNodeWithColor'
     *       400:
     *         description: failed to create user context
     *       401:
     *         description: no graph found for the user
     */
    app.post('/api/v1/user/context', (0, express_zod_safe_1.default)({
        body: (0, zodAtLeastOne_1.atLeastOne)(zod_1.z.strictObject({
            name: zod_1.z.string().max(200).min(1),
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
            const { name, color } = req.body;
            const graph = await spinalAPIMiddleware.getGraph();
            try {
                const userContextAndGroups = await (0, spinal_model_user_service_1.createSpinalUserContext)(graph, name, color);
                await userGraph.addContext(userContextAndGroups.context);
                const result = await (0, createBasicNode_1.createBasicNodeSync)(userContextAndGroups.context, ['color']);
                res.status(201).json(result);
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to create user context',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while creating the user context');
        }
    });
};
//# sourceMappingURL=createUserContext.js.map