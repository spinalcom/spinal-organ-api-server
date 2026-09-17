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
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user-group/user/move:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Add users to a specific user group within a user group context
     *     description: Add users to a specific user group within a user group context
     *     tags:
     *       - User Group
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *            type: object
     *            required:
     *             - query
     *            properties:
     *             query:
     *               type: array
     *               minLength: 1
     *               items:
     *                 type: object
     *                 required:
     *                   - originGroupDynamicId
     *                   - targetContextDynamicId
     *                   - targetGroupDynamicId
     *                   - userDynamicId
     *                 properties:
     *                   originGroupDynamicId:
     *                     type: integer
     *                     minimum: 1
     *                     format: int64
     *                     description: dynamic ID of the user group from which the user will be moved
     *                   targetContextDynamicId:
     *                     type: integer
     *                     minimum: 1
     *                     format: int64
     *                     description: dynamic ID of the target context to which the user will be moved
     *                   targetGroupDynamicId:
     *                     type: integer
     *                     minimum: 1
     *                     format: int64
     *                     description: dynamic ID of the target user group to which the user will be moved
     *                   userDynamicId:
     *                     type: integer
     *                     minimum: 1
     *                     format: int64
     *                     description: dynamic ID of the user to be moved
     *     responses:
     *       200:
     *         description: Successfully added users to the user group
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 userSuccessfullyMoved:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     format: int64
     *                   description: array of dynamic IDs of the users that were successfully moved to the target user group
     *                 userFailedToMove:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     format: int64
     *                   description: array of dynamic IDs of the users that failed to be moved to the target user group
     *       401:
     *         description: no graph found for the user
     */
    app.post('/api/v1/user-group/user/move', (0, express_zod_safe_1.default)({
        body: zod_1.z.strictObject({
            query: zod_1.z
                .array(zod_1.z.strictObject({
                originGroupDynamicId: zod_1.z.coerce.number().positive(),
                targetContextDynamicId: zod_1.z.coerce.number().positive(),
                targetGroupDynamicId: zod_1.z.coerce.number().positive(),
                userDynamicId: zod_1.z.coerce.number().positive(),
            }))
                .min(1),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            try {
                const results = { userSuccessfullyMoved: [], userFailedToMove: [] };
                const { query } = req.body;
                const userGroupContexts = await (0, spinal_model_user_service_1.getSpinalUserGroupContext)(userGraph);
                // Process query in batches of 25
                for (let i = 0; i < query.length; i += 25) {
                    const batch = query.slice(i, i + 25);
                    await Promise.all(batch.map(async (moveRequest) => {
                        const { originGroupDynamicId, targetContextDynamicId, targetGroupDynamicId, userDynamicId, } = moveRequest;
                        try {
                            const targetuserGroupContext = userGroupContexts.find((context) => context._server_id === targetContextDynamicId);
                            if (!targetuserGroupContext)
                                throw targetuserGroupContext;
                            const userNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, userDynamicId, profileId, spinal_model_user_service_1.SPINAL_USER_TYPE);
                            const originGroupNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, originGroupDynamicId, profileId, spinal_model_user_service_1.SPINAL_USER_GROUP_TYPE);
                            const targetGroupNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, targetGroupDynamicId, profileId, spinal_model_user_service_1.SPINAL_USER_GROUP_TYPE);
                            await (0, spinal_model_user_service_1.moveSpinalUserFromSpinalUserGroup)(userNode, originGroupNode, targetGroupNode, targetuserGroupContext);
                            results.userSuccessfullyMoved.push(userDynamicId);
                        }
                        catch (error) {
                            results.userFailedToMove.push(userDynamicId);
                        }
                    }));
                }
                res.status(200).json(results);
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to add users to the user group',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while adding users to the user group');
        }
    });
};
//# sourceMappingURL=moveUsersInGroup.js.map