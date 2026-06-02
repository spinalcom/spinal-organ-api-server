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
     * /api/v1/user/multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Retrieve multiple SpinalUsers by their IDs
     *     description: Retrieve multiple SpinalUsers by their unique IDs.
     *     tags:
     *       - User
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userDynamicIds
     *             properties:
     *               userDynamicIds:
     *                 type: array
     *                 items:
     *                   type: integer
     *                   format: int64
     *                 maxItems: 100
     *                 minItems: 1
     *                 description: array of dynamic IDs of the users to retrieve
     *               attributes:
     *                 type: boolean
     *                 default: false
     *                 description: whether to include user attributes in the response
     *               groups:
     *                 type: boolean
     *                 default: false
     *                 description: whether to include user groups in the response
     *               organizations:
     *                 type: boolean
     *                 default: false
     *                 description: whether to include user organizations in the response
     *     responses:
     *       200:
     *         description: Retrieve Successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/IUser'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       401:
     *         description: no graph found for the user
     */
    app.post('/api/v1/user/multiple', (0, express_zod_safe_1.default)({
        body: zod_1.z.strictObject({
            userDynamicIds: zod_1.z.array(zod_1.z.coerce.number().positive()).min(1).max(100),
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
            const { userDynamicIds, attributes, groups, organizations } = req.body;
            const results = [];
            // Process userDynamicIds in batches of 25
            for (let i = 0; i < userDynamicIds.length; i += 25) {
                const batch = userDynamicIds.slice(i, i + 25);
                const batchResults = await Promise.all(batch.map(async (userId) => {
                    try {
                        const userNode = await spinalAPIMiddleware.load(userId, profileId);
                        if (!userNode ||
                            !(userNode instanceof spinal_model_graph_1.SpinalNode) ||
                            userNode.info.type.get() !== 'SpinalUser') {
                            return { dynamicId: userId, error: `User not found` };
                        }
                        const result = await (0, getUserData_1.getUserData)(userNode, attributes, groups, organizations);
                        return result;
                    }
                    catch (error) {
                        return {
                            dynamicId: userId,
                            error: `Failed to retrieve user data`,
                        };
                    }
                }));
                results.push(...batchResults);
            }
            res.status(200).json(results);
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
//# sourceMappingURL=getUserMultiple.js.map