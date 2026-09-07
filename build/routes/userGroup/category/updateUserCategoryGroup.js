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
const zodAtLeastOne_1 = require("../../../utilities/zodAtLeastOne");
const safeSetAttr_1 = require("../../../utilities/safeSetAttr");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/user-group/category/{categoryId}:
     *   patch:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Update a user group category by ID
     *     description: Update a user group category by ID
     *     tags:
     *       - User Group
     *     parameters:
     *       - in: path
     *         name: categoryId
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *         description: The ID of the user group category to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               color:
     *                 type: string
     *     responses:
     *       200:
     *         description: Successfully updated the user group category
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               $ref: '#/components/schemas/BasicNodeWithColor'
     *       401:
     *         description: no graph found for the user
     */
    app.patch('/api/v1/user-group/category/:categoryId', (0, express_zod_safe_1.default)({
        params: zod_1.z.object({ categoryId: zod_1.z.coerce.number().positive() }),
        body: (0, zodAtLeastOne_1.atLeastOne)(zod_1.z.strictObject({
            name: zod_1.z.string().max(200).min(1).optional(),
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
            const { categoryId } = req.params;
            const categoryNode = await spinalAPIMiddleware.load(categoryId, profileId);
            if (!categoryNode ||
                categoryNode.getType().get() !== spinal_model_user_service_1.SPINAL_USER_GROUP_CATEGORY_TYPE)
                throw {
                    code: 404,
                    message: `No user group category found with id ${categoryId}`,
                };
            try {
                const { name, color } = req.body;
                (0, safeSetAttr_1.safeSetAttr)(categoryNode.info, 'name', name);
                (0, safeSetAttr_1.safeSetAttr)(categoryNode.info, 'color', color);
                const result = await (0, createBasicNode_1.createBasicNodeSync)(categoryNode, [
                    'color',
                ]);
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
//# sourceMappingURL=updateUserCategoryGroup.js.map