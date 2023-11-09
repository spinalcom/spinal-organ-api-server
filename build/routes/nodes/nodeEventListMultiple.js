"use strict";
/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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
const getEventListInfo_1 = require("../../utilities/getEventListInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/node/event_list_multiple:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns events of multiple nodes, including error details where applicable.
   *     summary: Get list of events for multiple nodes
   *     tags:
   *       - Nodes
   *     requestBody:
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
   *         description: Success - All events fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   dynamicId:
   *                     type: integer
   *                   events:
   *                     type: array
   *                     items:
   *                       $ref: '#/components/schemas/Event'
   *       206:
   *         description: Partial Content - Some events could not be fetched
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
   *                       events:
   *                         type: array
   *                         items:
   *                           $ref: '#/components/schemas/Event'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request
   */
    app.post('/api/v1/node/event_list_multiple', async (req, res, next) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ids = req.body;
            if (!Array.isArray(ids)) {
                return res.status(400).send('Expected an array of IDs.');
            }
            const promises = ids.map(id => (0, getEventListInfo_1.getEventListInfo)(spinalAPIMiddleware, profileId, id).then(events => ({ dynamicId: id, events })));
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with id ${ids[index]}: ${result.reason}`);
                    return {
                        dynamicId: ids[index],
                        error: result.reason?.message || result.reason || "Failed to get Events"
                    };
                }
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
            res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=nodeEventListMultiple.js.map