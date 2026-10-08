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
const getChildrenNodesInfo_1 = require("../../utilities/getChildrenNodesInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/{id}/node/children_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the children of several nodes inside one context
     *     description: >-
     *       Batch version of `POST /api/v1/context/{idContext}/node/{idNode}/children` : every entry is
     *       walked inside the same context `id`, and the response holds one `{ dynamicId, nodes }` entry
     *       per request entry, in the same order.
     *
     *
     *       Each node is walked independently : one that cannot be read does not fail the request, its
     *       entry becomes `{ dynamicId, error }` and the response is returned with
     *       **206 Partial Content**.
     *     tags:
     *       - Nodes
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Dynamic ID of the context every walk stays in.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     requestBody:
     *       required: true
     *       description: >-
     *         One entry per node. `relations` is the list of relation names to follow for that node; an
     *         empty array follows every relation it carries. At most 1000 entries per call (configurable
     *         on the organ through `MULTIPLE_ROUTE_IDS_LIMIT`).
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: object
     *               required:
     *                 - dynamicId
     *                 - relations
     *               properties:
     *                 dynamicId:
     *                   type: integer
     *                   format: int64
     *                   description: Dynamic ID of the node to walk.
     *                 relations:
     *                   type: array
     *                   items:
     *                     type: string
     *     responses:
     *       200:
     *         description: Every node was walked.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNodeMultiple'
     *       206:
     *         description: At least one node could not be walked; those entries hold an error instead.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/BasicNodeMultiple'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: The body is not an array, it holds more entries than the configured limit, or the walk failed.
     */
    app.post('/api/v1/context/:id/node/children_multiple', async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextId = req.params.id;
            const nodes = req.body;
            const validationError = (0, requestUtilities_1.validateArrayRequestLimit)(nodes, 'items');
            if (validationError) {
                return res.status(400).send(validationError);
            }
            const promises = nodes.map(async (node) => {
                const children = await (0, getChildrenNodesInfo_1.getChildrenNodesInfo)(spinalAPIMiddleware, profileId, node.dynamicId, node.relations, parseInt(contextId, 10));
                return {
                    dynamicId: node.dynamicId,
                    nodes: children,
                };
            });
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with id ${nodes[index].dynamicId}: ${result.reason}`);
                    return {
                        dynamicId: nodes[index].dynamicId,
                        error: result.reason?.message ||
                            result.reason ||
                            'Failed to get Children',
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
            res.status(400).send('An error occurred while fetching children.');
        }
    });
};
//# sourceMappingURL=nodeChildrenInContextSpecificRelationsMultiple.js.map