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
     * /api/v1/user-group/context/{contextId}/category:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Get all the user group categories of a user group context
     *     description: Get all the user group categories of a user group context
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
     *     responses:
     *       200:
     *         description: Successfully retrieved the user group categories
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 $ref: '#/components/schemas/BasicNodeWithColor'
     *       401:
     *         description: no graph found for the user
     */
    app.get('/api/v1/user-group/context/:contextId/category', (0, express_zod_safe_1.default)({
        params: zod_1.z.object({ contextId: zod_1.z.coerce.number().positive() }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            try {
                const userGroupContexts = await (0, spinal_model_user_service_1.getSpinalUserGroupContext)(userGraph);
                const userGroupContext = userGroupContexts.find((context) => context._server_id === req.params.contextId);
                if (!userGroupContext)
                    throw {
                        code: 404,
                        message: `No user group context found with id ${req.params.contextId}`,
                    };
                const categories = await (0, spinal_model_user_service_1.getGroupingCategory)(userGroupContext);
                const result = await Promise.all(categories.map((category) => (0, createBasicNode_1.createBasicNodeSync)(category, ['color'])));
                res.status(200).json(result);
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to retrieve user group categories',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while retrieving the user group categories');
        }
    });
};
//# sourceMappingURL=getUserCategoryGroupByContext.js.map