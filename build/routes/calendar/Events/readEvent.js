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
  * /api/v1/event/{eventId}/read:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Return event
  *     summary: Get event
  *     tags:
  *      - Calendar & Event
  *     parameters:
  *      - in: path
  *        name: eventId
  *        description: use the dynamic ID
  *        required: true
  *        schema:
  *          type: integer
  *          format: int64
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *                $ref: '#/components/schemas/Event'
  *       400:
  *         description: Bad request
    */
    app.get("/api/v1/event/:eventId/read", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var info = await (0, getEventInfo_1.getEventInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.eventId, 10));
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of event is not loaded");
        }
        res.send(info);
    });
};
//# sourceMappingURL=readEvent.js.map