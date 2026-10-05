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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getEventInfo_1 = require("../../../utilities/getEventInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/event/read_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read several calendar events at once
     *     description: >-
     *       Batch version of `/api/v1/event/{eventId}/read` : the body is an array of event dynamic IDs
     *       and the response holds one event per ID, in the same order.
     *
     *
     *       Each event is read independently : a failure turns its slot into an error object and the
     *       response comes back with **206 Partial Content**. At most 1000 IDs per call (configurable
     *       through `MULTIPLE_ROUTE_IDS_LIMIT`).
     *     tags:
     *       - Calendar & Event
     *     requestBody:
     *       required: true
     *       description: The dynamic IDs of the events.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: Every event was read.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Event'
     *       206:
     *         description: At least one event could not be read; those slots hold an error object instead.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/Event'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: >-
     *           The body is not an array, it holds more IDs than the configured limit, or the events
     *           could not be read ("List of events is not loaded").
     */
    app.post('/api/v1/event/read_multiple', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ids = req.body;
            const validationError = (0, requestUtilities_1.validateArrayRequestLimit)(ids);
            if (validationError) {
                return res.status(400).send(validationError);
            }
            // Map each id to a promise
            const promises = ids.map((id) => (0, getEventInfo_1.getEventInfo)(spinalAPIMiddleware, profileId, id));
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with event id ${ids[index]}: ${result.reason}`);
                    return {
                        eventId: ids[index],
                        error: result.reason?.message ||
                            result.reason ||
                            'Failed to get Event Info',
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
            res.status(400).send('List of events is not loaded');
        }
    });
};
//# sourceMappingURL=readEventMultiple.js.map