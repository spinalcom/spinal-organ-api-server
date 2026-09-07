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
     * /api/v1/user-group/group/{groupId}/user/{userId}:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Remove user from a specific user group
     *     description: Remove user from a specific user group
     *     tags:
     *       - User Group
     *     parameters:
     *       - in: path
     *         name: groupId
     *         description: The ID of the user group to retrieve
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: userId
     *         description: The ID of the user to remove from the user group
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: query
     *         name: removeControlPoints
     *         description: "Whether to also remove the user from any control points associated with the user group (default: true)"
     *         required: false
     *         schema:
     *           type: boolean
     *           default: true
     *     responses:
     *       204:
     *         description: Successfully removed users from the user group
     *       401:
     *         description: no graph found for the user
     */
    app.delete('/api/v1/user-group/group/:groupId/user/:userId', (0, express_zod_safe_1.default)({
        params: zod_1.z.object({
            groupId: zod_1.z.coerce.number().positive(),
            userId: zod_1.z.coerce.number().positive(),
        }),
        query: zod_1.z.object({
            removeControlPoints: zod_1.z.coerce.boolean().optional().default(true),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            try {
                const { groupId, userId } = req.params;
                const groupNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, groupId, profileId, spinal_model_user_service_1.SPINAL_USER_GROUP_TYPE);
                const userNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, userId, profileId, spinal_model_user_service_1.SPINAL_USER_TYPE);
                await (0, spinal_model_user_service_1.removeSpinalUserFromSpinalUserGroup)(groupNode, userNode, req.query.removeControlPoints);
                res.status(204).send();
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to remove user from the user group',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while removing user from the user group');
        }
    });
};
//# sourceMappingURL=deleteUserInGroup.js.map