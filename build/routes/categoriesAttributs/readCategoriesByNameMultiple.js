"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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
const requestUtilities_1 = require("../../utilities/requestUtilities");
const getCategoryNameInfo_1 = require("../../utilities/getCategoryNameInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/categoriesByName/read_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Read multiple categories attributes for multiple nodes
     *     summary: Read multiple categories attributes for multiple nodes
     *     tags:
     *      - Node Attribut Categories
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: object
     *               required:
     *                 - dynamicId
     *                 - categoryNames
     *               properties:
     *                 dynamicId:
     *                   type: integer
     *                   format: int64
     *                 categoryNames:
     *                   type: array
     *                   items:
     *                     type: string
     *     responses:
     *       200:
     *         description: Success - All attribute nodes info fetched
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CategoriesAttributeMultiple'
     *       206:
     *         description: Partial Content - Some attribute info could not be fetched
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/CategoriesAttributeMultiple'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: Bad request
     */
    app.post('/api/v1/node/categoriesByName/read_multiple', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const requestInfo = req.body;
            const validationError = (0, requestUtilities_1.validateArrayRequestLimit)(requestInfo, 'items');
            if (validationError) {
                return res.status(400).send(validationError);
            }
            // Map each id to a promise
            const promises = requestInfo.map(async (obj) => {
                const info = await (0, getCategoryNameInfo_1.getCategoryNamesInfo)(spinalAPIMiddleware, profileId, obj.dynamicId, obj.categoryNames);
                return { dynamicId: obj.dynamicId, categoryAttributes: info };
            });
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with id ${requestInfo[index].dynamicId}: ${result.reason}`);
                    return {
                        dynamicId: requestInfo[index].dynamicId,
                        error: result.reason?.message ||
                            result.reason ||
                            'Failed to get Category',
                    };
                }
            });
            const isGotError = settledResults.some((result) => result.status === 'rejected');
            if (isGotError)
                return res.status(206).json(finalResults);
            return res.status(200).json(finalResults);
        }
        catch (error) {
            console.error(error);
            return res
                .status(400)
                .send(error.message || 'Failed to get categories');
        }
    });
};
//# sourceMappingURL=readCategoriesByNameMultiple.js.map