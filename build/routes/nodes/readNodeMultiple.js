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
const getNodeInfo_1 = require("../../utilities/getNodeInfo");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/read_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read several nodes at once
     *     description: >-
     *       Batch version of `/api/v1/node/{id}/read` : the body is a JSON array of dynamic IDs and the
     *       response is an array of node summaries in the same order.
     *
     *
     *       Unlike the single-node route, the parent and children relations are included by default here.
     *       Pass `includeChildrenRelations=false` / `includeParentRelations=false` to leave them out -
     *       any other value (including omitting the parameter) keeps them.
     *
     *
     *       Each ID is resolved independently : a node that cannot be read does not fail the request, its
     *       slot is filled with `{ dynamicId, error }` and the whole response is returned with
     *       **206 Partial Content**. At most 1000 IDs per call (configurable on the organ through
     *       `MULTIPLE_ROUTE_IDS_LIMIT`); a longer array is rejected with 400.
     *     tags:
     *       - Nodes
     *     parameters:
     *       - in: query
     *         name: includeChildrenRelations
     *         schema:
     *           type: boolean
     *           default: true
     *         required: false
     *         description: Set to `false` to leave `children_relation_list` empty.
     *       - in: query
     *         name: includeParentRelations
     *         schema:
     *           type: boolean
     *           default: true
     *         required: false
     *         description: Set to `false` to leave `parent_relation_list` empty.
     *     requestBody:
     *       required: true
     *       description: The dynamic IDs to read.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: Every node was read.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Node'
     *       206:
     *         description: At least one node could not be read; those slots hold an error object instead.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/Node'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: The body is not an array, or it holds more IDs than the configured limit.
     *       500:
     *         description: Unexpected error while reading the nodes.
     */
    app.post('/api/v1/node/read_multiple', async (req, res, next) => {
        try {
            const includeChildrenRelations = req.query.includeChildrenRelations !== 'false';
            const includeParentRelations = req.query.includeParentRelations !== 'false';
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ids = req.body;
            const validationError = (0, requestUtilities_1.validateArrayRequestLimit)(ids);
            if (validationError) {
                return res.status(400).send(validationError);
            }
            // Map each id to a promise
            const promises = ids.map((id) => (0, getNodeInfo_1.getNodeInfo)(spinalAPIMiddleware, profileId, id, includeChildrenRelations, includeParentRelations));
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
                            'Failed to get Node info',
                    };
                }
            });
            const isGotError = settledResults.some((result) => result.status === 'rejected');
            if (isGotError) {
                return res.status(206).json(finalResults); // If any errors, send 206 Partial Content
            }
            return res.status(200).json(finalResults); // If all successful, send 200 OK
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send(error.message || 'An error occurred while fetching nodes.');
        }
    });
};
//# sourceMappingURL=readNodeMultiple.js.map