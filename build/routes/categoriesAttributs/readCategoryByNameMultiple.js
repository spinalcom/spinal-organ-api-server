"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../utilities/requestUtilities");
const getCategoryNameInfo_1 = require("../../utilities/getCategoryNameInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/categoryByName/{categoryName}/read_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read one category, by name, on several nodes at once
     *     description: >-
     *       Looks up the same category name on a batch of nodes. The body is an array of dynamic IDs and
     *       the response holds one `{ dynamicId, categoryAttribute }` entry per ID, in the same order.
     *
     *
     *       A node that does not carry this category is a failure for that entry : it becomes
     *       `{ dynamicId, error }` and the whole response comes back with **206 Partial Content**. At
     *       most 1000 IDs per call (configurable through `MULTIPLE_ROUTE_IDS_LIMIT`).
     *     tags:
     *       - Node Attribut Categories
     *     parameters:
     *       - in: path
     *         name: categoryName
     *         description: Name of the category to look up on every node (exact match).
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       description: The dynamic IDs of the nodes to read.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: Every node carries the category.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   dynamicId:
     *                     type: integer
     *                     format: int64
     *                   categoryAttribute:
     *                     $ref: '#/components/schemas/CategoriesAttribute'
     *       206:
     *         description: At least one node does not carry the category, or could not be read.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - type: object
     *                     properties:
     *                       dynamicId:
     *                         type: integer
     *                       categoryAttribute:
     *                         $ref: '#/components/schemas/CategoriesAttribute'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: The body is not an array, or it holds more IDs than the configured limit.
     */
    app.post('/api/v1/node/categoryByName/:categoryName/read_multiple', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ids = req.body;
            const validationError = (0, requestUtilities_1.validateArrayRequestLimit)(ids);
            if (validationError) {
                return res.status(400).send(validationError);
            }
            // Map each id to a promise
            const promises = ids.map(async (id) => {
                const info = await (0, getCategoryNameInfo_1.getCategoryNameInfo)(spinalAPIMiddleware, profileId, id, req.params.categoryName);
                return { dynamicId: id, categoryAttribute: info };
            });
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with id ${ids[index]}: ${result.reason}`);
                    return {
                        id: ids[index],
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
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res
                .status(400)
                .send(error.message || 'Failed to get categories');
        }
    });
};
//# sourceMappingURL=readCategoryByNameMultiple.js.map