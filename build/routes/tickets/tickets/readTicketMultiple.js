"use strict";
/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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
Object.defineProperty(exports, "__esModule", { value: true });
const getTicketDetails_1 = require("../../../utilities/workflow/getTicketDetails");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/read_details_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read several tickets at once
     *     description: >-
     *       Batch version of `/api/v1/ticket/{ticketId}/read_details` : the body is an array of ticket
     *       dynamic IDs and the response holds the details of one ticket per ID, in the same order.
     *
     *
     *       Each ticket is read independently : a failure turns its slot into an error object and the
     *       response comes back with **206 Partial Content**. At most 1000 IDs per call (configurable
     *       through `MULTIPLE_ROUTE_IDS_LIMIT`).
     *     tags:
     *       - Workflow & ticket
     *     requestBody:
     *       required: true
     *       description: The dynamic IDs of the tickets.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: Every ticket was read.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/TicketDetails'
     *       206:
     *         description: At least one ticket could not be read; those slots hold an error object instead.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/TicketDetails'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: The body is not an array, or it holds more IDs than the configured limit.
     */
    app.post('/api/v1/ticket/read_details_multiple', async (req, res) => {
        try {
            let ids = req.body;
            const validationError = (0, requestUtilities_1.validateArrayRequestLimit)(ids);
            if (validationError) {
                return res.status(400).send(validationError);
            }
            // check if the array is only numbers or string of numbers
            ids = ids.filter((id) => typeof id === 'number' || (typeof id === 'string' && !isNaN(Number(id))));
            if (!ids.every((id) => typeof id === 'number' ||
                (typeof id === 'string' && !isNaN(Number(id))))) {
                return res
                    .status(400)
                    .send('Expected an array of numbers or strings of numbers.');
            }
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            // Map each id to a promise
            const promises = ids.map((id) => (0, getTicketDetails_1.getTicketDetails)(spinalAPIMiddleware, profileId, +id));
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with ticket id ${ids[index]}: ${result.reason}`);
                    return {
                        dynamicId: ids[index],
                        error: result.reason?.message ||
                            result.reason ||
                            'Failed to get Ticket Details',
                    };
                }
            });
            const didGotError = settledResults.some((result) => result.status === 'rejected');
            if (didGotError)
                return res.status(206).json(finalResults);
            return res.status(200).json(finalResults);
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message || 'ko');
        }
    });
};
//# sourceMappingURL=readTicketMultiple.js.map