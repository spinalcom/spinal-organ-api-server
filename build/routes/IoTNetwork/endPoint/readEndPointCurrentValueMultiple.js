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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endpoint/read_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Reads the current values for multiple endpoints
     *     summary: Read the current values of multiple endpoints
     *     tags:
     *       - IoTNetwork & Time Series
     *     requestBody:
     *       description: An array of endpoint IDs to fetch the current values for
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: Success - All endpoints' current values fetched successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CurrentValueWithId'
     *       206:
     *         description: Partial Content - Some endpoints' current values could not be fetched
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/CurrentValueWithId'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: Bad request - Incorrect request format or server error
     */
    app.post("/api/v1/endpoint/read_multiple", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ids = req.body;
            if (!Array.isArray(ids)) {
                return res.status(400).send("Expected an array of IDs.");
            }
            // Map each id to a promise
            const promises = ids.map(async (id) => {
                try {
                    const node = await spinalAPIMiddleware.load(id, profileId);
                    // @ts-ignore
                    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                    const element = await node.element.load();
                    return { dynamicId: id, currentValue: element.currentValue.get() };
                }
                catch (error) {
                    console.error(`Error with id ${id}: ${error.message || error}`);
                    return {
                        dynamicId: id,
                        error: error.message || "Failed to get current value"
                    };
                }
            });
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map(result => {
                return result.status === 'fulfilled' ? result.value : result.reason;
            });
            const isGotError = settledResults.some(result => result.status === 'rejected');
            if (isGotError) {
                return res.status(206).json(finalResults);
            }
            return res.status(200).json(finalResults);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send(error.message || "Error processing the request");
        }
    });
};
//# sourceMappingURL=readEndPointCurrentValueMultiple.js.map