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
const getUserData_1 = require("../../../utilities/getUserData");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user/{userId}:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Retrieve a SpinalUser by ID
     *     description: Retrieve a SpinalUser by their unique ID.
     *     tags:
     *       - User
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *           description: dynamic ID of the user to retrieve
     *       - in: query
     *         name: attributes
     *         required: false
     *         schema:
     *           type: boolean
     *           description: add the attributes of the user in the response
     *           default: false
     *       - in: query
     *         name: groups
     *         required: false
     *         schema:
     *           type: boolean
     *           description: add the groups which the user belongs to in the response
     *           default: false
     *       - in: query
     *         name: organizations
     *         required: false
     *         schema:
     *           type: boolean
     *           description: add the organizations which the user belongs to in the response
     *           default: false
     *     responses:
     *       200:
     *         description: Retrieve Successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/IUser'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       404:
     *         description: User not found
     *       401:
     *         description: no graph found for the user
     */
    app.get('/api/v1/user/:userId', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            userId: zod_1.z.coerce.number().positive(),
        }),
        query: zod_1.z.strictObject({
            attributes: zod_1.z.coerce.boolean().optional().default(false),
            groups: zod_1.z.coerce.boolean().optional().default(false),
            organizations: zod_1.z.coerce.boolean().optional().default(false),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { userId } = req.params;
            const { attributes, groups, organizations } = req.query;
            try {
                const userNode = await spinalAPIMiddleware.load(userId, profileId);
                if (!userNode ||
                    !(userNode instanceof spinal_model_graph_1.SpinalNode) ||
                    userNode.info.type.get() !== 'SpinalUser') {
                    throw { code: 404, message: `User not found` };
                }
                const result = await (0, getUserData_1.getUserData)(userNode, attributes, groups, organizations);
                res.status(200).json(result);
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
//# sourceMappingURL=getUserById.js.map