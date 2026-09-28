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
     * /api/v1/ticket/{ticketId}/read_details:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read a ticket
     *     description: >-
     *       Returns a ticket with its full details : priority, creation date, declarer, description, the
     *       element it concerns, the process and step it currently sits in, its workflow, and its
     *       attribute categories.
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: ticketId
     *         description: Dynamic ID of the ticket.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       200:
     *         description: The ticket details.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/TicketDetails'
     *       400:
     *         description: The ticket could not be loaded or read (body is `ko`).
     *       401:
     *         description: The profile is not allowed to read this ticket.
     */
    app.get('/api/v1/ticket/:ticketId/read_details', async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const details = await (0, getTicketDetails_1.getTicketDetails)(spinalAPIMiddleware, profileId, +req.params.ticketId);
            return res.json(details);
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send('ko');
        }
    });
};
//# sourceMappingURL=readTicket.js.map