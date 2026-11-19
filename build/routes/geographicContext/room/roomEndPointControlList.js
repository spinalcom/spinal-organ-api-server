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
const getControlEndpointsInfo_1 = require("../../../utilities/getControlEndpointsInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/room/{id}/control_endpoint_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the control endpoints of a room, grouped by profile
     *     description: >-
     *       Returns the control points of a room and of the BMS devices directly under it
     *       (`hasBmsDevice`), grouped by control-point profile : one entry per profile, each holding its
     *       own endpoints with their current values. The node must be of type `geographicRoom`.
     *
     *
     *       Same response as the generic `/api/v1/node/{id}/control_endpoint_list`, which also accepts
     *       `includeDetails`.
     *     tags:
     *       - Geographic Context
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the room.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The control-point profiles of the room, each with its endpoints.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 description: One control-point profile of the room or of one of its BMS devices.
     *                 properties:
     *                   dynamicId:
     *                     type: integer
     *                     format: int64
     *                     description: Dynamic ID of the room (not the profile itself), also for the profiles read from one of its BMS devices.
     *                   profileName:
     *                     type: string
     *                     description: Name of the control-point profile.
     *                   endpoints:
     *                     type: array
     *                     items:
     *                       $ref: '#/components/schemas/EndPointNode'
     *       400:
     *         description: The node is not a room ("node is not of type geographicRoom"), or its control points could not be read.
     *       401:
     *         description: The profile is not allowed to read this room.
     */
    app.get('/api/v1/room/:id/control_endpoint_list', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (!(room.getType().get() === 'geographicRoom')) {
                return res.status(400).send('node is not of type geographicRoom');
            }
            const allNodes = await (0, getControlEndpointsInfo_1.getNodeControlEndpointsInfo)(room);
            res.send(allNodes);
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('list of endpoints is not loaded');
        }
    });
};
//# sourceMappingURL=roomEndPointControlList.js.map