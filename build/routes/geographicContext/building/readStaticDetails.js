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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getStaticDetailsInfo_1 = require("../../../utilities/getStaticDetailsInfo");
const getTicketListInfo_1 = require("../../../utilities/getTicketListInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/building/{id}/read_static_details:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get everything known about a building
     *     description: >-
     *       The full read of a building in one call : its identity, its attribute categories with their
     *       attributes, its control points, its BMS endpoints with their current values, and `tickets`,
     *       the tickets declared directly on the building node.
     *
     *
     *       Only the tickets of the building node itself are returned; those declared on its floors,
     *       rooms or equipment are not collected. The node must be of type `geographicBuilding`.
     *     tags:
     *       - Geographic Context
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the building.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The complete static description of the building, plus its tickets.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/StaticDetailsFloor'
     *       401:
     *         description: The profile is not allowed to read this building.
     *       500:
     *         description: The building could not be loaded, or the node is not a `geographicBuilding`.
     */
    app.get("/api/v1/building/:id/read_static_details", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const info = await (0, getStaticDetailsInfo_1.getBuildingStaticDetailsInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10));
            const ticketList = await (0, getTicketListInfo_1.getTicketListInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10));
            const merge = { ...info, tickets: ticketList };
            return res.json(merge);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=readStaticDetails.js.map