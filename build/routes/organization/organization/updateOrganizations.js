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
const safeSetAttr_1 = require("../../../utilities/safeSetAttr");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/organization:
     *   patch:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Update Organization(s)
     *     description: Update Organization properties such as name and color. Multiple organizations can be updated in a single request.
     *     tags:
     *       - Organization
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
     *                   - dynamicId
     *                 properties:
     *                   dynamicId:
     *                     type: integer
     *                     minimum: 1
     *                     format: int64
     *                     description: dynamic ID of the organization to update
     *                   name:
     *                     type: string
     *                     maxLength: 200
     *                     minLength: 1
     *                     description: name of the organization to update
     *                   color:
     *                     type: string
     *                     pattern: '^#([A-Fa-f0-9]{6})$'
     *                     description: Hexadecimal color code for the organization context (e.g., #RRGGBB)
     *     responses:
     *       200:
     *         description: Update Successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 successfullyUpdated:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     format: int64
     *                   description: array of dynamic IDs of the organizations that were successfully updated
     *                 failedToUpdate:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     format: int64
     *                   description: array of dynamic IDs of the organizations that failed to be updated
     *       404:
     *         description: Organization context not found
     *       401:
     *         description: no graph found for the user
     */
    app.patch('/api/v1/organization', (0, express_zod_safe_1.default)({
        body: zod_1.z.strictObject({
            query: zod_1.z
                .array(zod_1.z.strictObject({
                dynamicId: zod_1.z.coerce.number().positive(),
                name: zod_1.z.string().max(200).min(1).optional(),
                color: zod_1.z
                    .string()
                    .regex(/^#([A-Fa-f0-9]{6})$/)
                    .optional(),
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
                const { query } = req.body;
                const results = { successfullyUpdated: [], failedToUpdate: [] };
                for (let i = 0; i < query.length; i += 25) {
                    const batch = query.slice(i, i + 25);
                    await Promise.all(batch.map(async (updateReq) => {
                        const { dynamicId, name, color } = updateReq;
                        if (!name && !color) {
                            results.failedToUpdate.push(dynamicId);
                            return;
                        }
                        try {
                            const organizationNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, dynamicId, profileId, spinal_model_user_service_1.SPINAL_ORGANIZATION_TYPE);
                            (0, safeSetAttr_1.safeSetAttr)(organizationNode.info, 'name', name);
                            (0, safeSetAttr_1.safeSetAttr)(organizationNode.info, 'color', color);
                            results.successfullyUpdated.push(dynamicId);
                        }
                        catch (error) {
                            results.failedToUpdate.push(dynamicId);
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
                        : 'Failed to update organization context',
                };
            }
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while updating the organization context');
        }
    });
};
//# sourceMappingURL=updateOrganizations.js.map