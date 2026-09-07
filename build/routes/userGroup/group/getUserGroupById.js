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
const spinal_model_graph_1 = require("spinal-model-graph");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const createBasicNode_1 = require("../../../utilities/createBasicNode");
const spinal_model_user_service_1 = require("spinal-model-user-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user-group/group/{groupId}:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Get a user group by its ID
     *     description: Get a user group by its ID
     *     tags:
     *       - User Group
     *     parameters:
     *       - in: path
     *         name: groupId
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *         description: The ID of the user group to retrieve
     *     responses:
     *       200:
     *         description: Successfully retrieved the user group
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BasicNodeWithColor'
     *       401:
     *         description: no graph found for the user
     */
    app.get('/api/v1/user-group/group/:groupId', (0, express_zod_safe_1.default)({
        params: zod_1.z.object({
            groupId: zod_1.z.coerce.number().positive(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            try {
                const { groupId } = req.params;
                const group = await spinalAPIMiddleware.load(groupId, profileId);
                const parseResult = zod_1.z
                    .instanceof(spinal_model_graph_1.SpinalNode)
                    .refine((node) => node.info.type.get() === spinal_model_user_service_1.SPINAL_USER_GROUP_TYPE)
                    .safeParse(group);
                if (!parseResult.success) {
                    throw { code: 400, message: 'Invalid group data' };
                }
                const result = await (0, createBasicNode_1.createBasicNodeSync)(group, ['color']);
                res.status(200).json(result);
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to retrieve user group with the specified ID',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while retrieving the user group with the specified ID');
        }
    });
};
//# sourceMappingURL=getUserGroupById.js.map