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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user-group/context/{contextId}:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Delete a user group context by its ID
     *     description: Will delete the user group context with the given ID. It will also remove the categories and groups.
     *     tags:
     *       - User Group
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *         description: The ID of the user group context to delete
     *     responses:
     *       204:
     *         description: Successfully deleted the user group context
     *       401:
     *         description: no graph found for the user
     */
    app.delete('/api/v1/user-group/context/:contextId', (0, express_zod_safe_1.default)({
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
                for (const category of categories) {
                    const groups = await (0, spinal_model_user_service_1.getSpinalUserGroup)(category, userGroupContext);
                    for (let i = 0; i < groups.length; i += 10) {
                        const chunk = groups.slice(i, i + 10);
                        await Promise.allSettled(chunk.map((group) => group.removeFromGraph()));
                    }
                    await category.removeFromGraph();
                }
                await userGroupContext.removeFromGraph();
                res.status(204).send();
            }
            catch (error) {
                throw {
                    code: 400,
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to delete user group context',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while deleting the user group context');
        }
    });
};
//# sourceMappingURL=deleteUserGroupContext.js.map