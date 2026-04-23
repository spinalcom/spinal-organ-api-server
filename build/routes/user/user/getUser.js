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
const consumeBatch_1 = require("../../../utilities/consumeBatch");
const getUserFromContextGen_1 = require("../../../utilities/getUserFromContextGen");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user/context/{contextId}/user:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Get SpinalUser(s) from a SpinalUserContext
     *     description: Get SpinalUsers from a SpinalUserContext or a specific one if the name query parameter is provided, with the possibility to add the groups and organizations which the user belongs to in the response. There is a limit of 100 users that can be retrieved, use the query offset to retrieve the next users if there is more than 100 users in the context.
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
     *       - in: query
     *         name: email
     *         required: false
     *         schema:
     *           type: string
     *           maxLength: 200
     *           minLength: 1
     *           description: name of the user to retrieve
     *       - in: query
     *         name: startingAlphaNum
     *         required: false
     *         schema:
     *           type: string
     *           pattern: '^[a-zA-Z0-9]|(special)$'
     *           description: starting alphanumeric character for filtering users, for example if startingAlphaNum is "A", only users whose name starts with "A" will be retrieved, this filter is case insensitive. Only works with /^[a-zA-Z0-9]|(special)$/, for other characters use 'special'.
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
     *       - in: query
     *         name: offset
     *         required: false
     *         schema:
     *           type: integer
     *           description: offset for pagination
     *           default: 0
     *     responses:
     *       200:
     *         description: Retrieve Successfully
     *         headers:
     *           x-has-more:
     *             description: Indicates if there are more users to retrieve ('true' or 'false')
     *             schema:
     *               type: string
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - type: array
     *                   items:
     *                     $ref: '#/components/schemas/IUser'
     *                 - $ref: '#/components/schemas/IUser'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       404:
     *         description: User context not found
     *       401:
     *         description: no graph found for the user
     */
    app.get('/api/v1/user/context/:contextId/user', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            contextId: zod_1.z.coerce.number().positive(),
        }),
        query: zod_1.z.strictObject({
            email: zod_1.z.string().max(200).min(1).optional(),
            startingAlphaNum: zod_1.z
                .string()
                .regex(/^[a-zA-Z0-9]|(special)$/)
                .optional(),
            attributes: zod_1.z.coerce.boolean().optional().default(false),
            groups: zod_1.z.coerce.boolean().optional().default(false),
            organizations: zod_1.z.coerce.boolean().optional().default(false),
            offset: zod_1.z.coerce.number().int().nonnegative().optional().default(0),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                throw { code: 401, message: `No graph found for ${profileId}` };
            const { contextId } = req.params;
            const { email: name, attributes, startingAlphaNum, groups, organizations, offset, } = req.query;
            try {
                const userContexts = await (0, spinal_model_user_service_1.getSpinalUserContexts)(userGraph);
                const userContext = userContexts.find((context) => context._server_id === contextId);
                if (!userContext)
                    throw {
                        code: 404,
                        message: `No user context found with the ID ${contextId}`,
                    };
                // If a name is provided, we retrieve the specific user,
                if (name) {
                    try {
                        const userNode = await (0, spinal_model_user_service_1.getSpinalUser)(userContext, name);
                        if (!userNode)
                            throw {
                                code: 404,
                                message: `No user found with the name ${name} in the context with the ID ${contextId}`,
                            };
                        const result = await (0, getUserData_1.getUserData)(userNode, attributes, groups, organizations);
                        return res.status(200).json(result);
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
                else if (startingAlphaNum) {
                    const userAlphaGroup = await (0, spinal_model_user_service_1.getSpinalUserAlphaGroup)(userContext, startingAlphaNum === 'special'
                        ? startingAlphaNum
                        : startingAlphaNum.toUpperCase());
                    if (!userAlphaGroup)
                        // should not happen with zod validation but just in case
                        throw {
                            code: 404,
                            message: `No user alpha group found with the starting alphanumeric character ${startingAlphaNum} in the context with the ID ${contextId}`,
                        };
                    const userNodes = await (0, spinal_model_user_service_1.getSpinalUserFromSpinalUserAlphaGroup)(userAlphaGroup, userContext);
                    const resultProms = [];
                    let idx = offset;
                    for (; idx < userNodes.length; idx++) {
                        const userNode = userNodes[idx];
                        resultProms.push(() => (0, getUserData_1.getUserData)(userNode, attributes, groups, organizations));
                        // we retrieve only 100 users at max, if there are more,
                        // the client can make another request with an updated offset to retrieve the next users
                        if (resultProms.length >= 100)
                            break;
                    }
                    const result = await (0, consumeBatch_1.consumeBatch)(resultProms, 25);
                    return res
                        .header('x-has-more', (idx < userNodes.length).toString())
                        .status(200)
                        .json(result);
                }
                else {
                    // if no name is provided, we retrieve the first 100 users after the offset in
                    // the context with the possibility to add the attributes, groups and organizations
                    // in the response based on the query parameters, we also add in the header of the
                    // response if there are more users to retrieve after the 100 first ones based on the offset
                    const resultProms = [];
                    let lastHasMore = false;
                    for await (const { userNode, hasMore } of (0, getUserFromContextGen_1.getUserFromContextGen)(userContext, offset)) {
                        lastHasMore = hasMore;
                        resultProms.push(() => (0, getUserData_1.getUserData)(userNode, attributes, groups, organizations));
                        // we retrieve only 100 users at max, if there are more,
                        // the client can make another request with an updated offset to retrieve the next users
                        if (resultProms.length >= 100)
                            break;
                    }
                    const result = await (0, consumeBatch_1.consumeBatch)(resultProms, 25);
                    return res
                        .header('x-has-more', lastHasMore.toString())
                        .status(200)
                        .json(result);
                }
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
//# sourceMappingURL=getUser.js.map