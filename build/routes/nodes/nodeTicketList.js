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
const getTicketListInfo_1 = require("../../utilities/getTicketListInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/ticket_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the tickets declared on a node
     *     description: >-
     *       Returns the tickets attached to a node through the `SpinalSystemServiceTicketHasTicket`
     *       relation, each with its full details : priority, creation date, declarer, description, the
     *       process and step it currently sits in, its workflow and its attribute categories.
     *
     *
     *       Only the tickets directly attached to this node are returned; tickets declared on its
     *       children are not collected.
     *     tags:
     *       - Nodes
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the node the tickets are declared on.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: query
     *        name: includeAttachedItems
     *        description: >-
     *          Set to `true` to also return, for every ticket, the items attached to it (documents, notes
     *          and linked elements). Off by default because it costs extra reads per ticket.
     *        required: false
     *        schema:
     *          type: boolean
     *          default: false
     *     responses:
     *       200:
     *         description: The tickets declared on the node (an empty array if there are none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Ticket'
     *       400:
     *         description: The node could not be loaded, or its tickets could not be read.
     *       401:
     *         description: The profile is not allowed to read this node.
     */
    app.get('/api/v1/node/:id/ticket_list', async (req, res, next) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const includeAttachedItems = req.query.includeAttachedItems === 'true';
            const result = await (0, getTicketListInfo_1.getTicketListInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10), includeAttachedItems);
            return res.json(result);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            console.error(error);
            return res.status(400).send('ko');
        }
    });
};
//# sourceMappingURL=nodeTicketList.js.map