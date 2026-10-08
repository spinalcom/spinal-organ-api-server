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
const getEndpointInfo_1 = require("../../utilities/getEndpointInfo");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/endpoint_list_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the BMS endpoints of several nodes at once
     *     description: >-
     *       Batch version of `/api/v1/node/{id}/endpoint_list` : the body is an array of dynamic IDs and
     *       the response holds one `{ dynamicId, endpoints }` entry per ID, in the same order.
     *
     *
     *       This route always walks without details (there is no `includeDetails` here), so
     *       `controlValue` and `timeseriesRetentionDays` are not filled. Each node is walked
     *       independently : a failure turns its entry into `{ dynamicId, error }` and the response comes
     *       back with **206 Partial Content**. At most 1000 IDs per call (configurable through
     *       `MULTIPLE_ROUTE_IDS_LIMIT`).
     *     tags:
     *       - Nodes
     *     requestBody:
     *       required: true
     *       description: The dynamic IDs of the nodes to walk.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: Every node was walked.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/EndPointNodeMultiple'
     *       206:
     *         description: At least one node could not be walked; those entries hold an error instead.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/EndPointNodeMultiple'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: The body is not an array, or it holds more IDs than the configured limit.
     */
    app.post('/api/v1/node/endpoint_list_multiple', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ids = req.body;
            const validationError = (0, requestUtilities_1.validateArrayRequestLimit)(ids);
            if (validationError) {
                return res.status(400).send(validationError);
            }
            const promises = ids.map((id) => (0, getEndpointInfo_1.getEndpointsInfo)(spinalAPIMiddleware, profileId, id).then((endpoints) => ({
                dynamicId: id,
                endpoints: endpoints,
            })));
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with id ${ids[index]}: ${result.reason}`);
                    return {
                        dynamicId: ids[index],
                        error: result.reason?.message ||
                            result.reason ||
                            'Failed to get Endpoints',
                    };
                }
            });
            const isGotError = settledResults.some((result) => result.status === 'rejected');
            if (isGotError) {
                return res.status(206).json(finalResults);
            }
            return res.status(200).json(finalResults);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('An error occurred while fetching endpoints.');
        }
    });
};
//# sourceMappingURL=nodeEndPointListMultiple.js.map