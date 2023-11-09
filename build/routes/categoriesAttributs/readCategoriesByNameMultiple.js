"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
   *                 $ref: '#/components/schemas/CategoriesAttributesMultiple'
   *       206:
   *         description: Partial Content - Some attribute info could not be fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/CategoriesAttributesMultiple'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request
   */
    app.post('/api/v1/node/categoriesByName/read_multiple', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const requestInfo = req.body;
            if (!Array.isArray(requestInfo)) {
                return res.status(400).send('Invalid format; An array is expected.');
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
                        id: requestInfo[index].dynamicId,
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