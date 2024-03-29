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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_task_service_1 = require("spinal-env-viewer-task-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const moment = require("moment");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/event/{eventId}/update:
  *   put:
  *     security:
  *       - bearerAuth:
  *         - read
  *     description: update event
  *     summary: update event
  *     tags:
  *       - Calendar & Event
  *     parameters:
  *      - in: path
  *        name: eventId
  *        description: use the dynamic ID
  *        required: true
  *        schema:
  *          type: integer
  *          format: int64
  *     requestBody:
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             required:
  *               - contextId
  *               - name
  *               - repeat
  *               - startDate
  *               - endDate
  *             properties:
  *               contextId:
  *                 type: integer
  *               name:
  *                 type: string
  *               startDate:
  *                 type: string
  *                 default: DD MM YYYY HH:mm:ss
  *               endDate:
  *                 type: string
  *                 default: DD MM YYYY HH:mm:ss
  *               repeat:
  *                 type: boolean
  *               count:
  *                 type: number
  *               period:
  *                 type: number
  *                 default: day|week|month|year
  *               repeatEnd:
  *                 type: number
  *                 default: DD MM YYYY HH:mm:ss
  *     responses:
  *       200:
  *         description: Updated successfully
  *       400:
  *         description: Bad request
    */
    app.put("/api/v1/event/:eventId/update", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.body.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const event = await spinalAPIMiddleware.load(parseInt(req.params.eventId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(event);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext && event.belongsToContext(context)) {
                if (context.getType().get() === "SpinalEventGroupContext") {
                    const newEventInfo = {
                        name: req.body.name,
                        nodeId: event.info.nodeId,
                        repeat: req.body.repeat,
                        startDate: new Date((moment(req.body.startDate, "DD MM YYYY HH:mm:ss", true)).toISOString()).toISOString(),
                        endDate: new Date((moment(req.body.endDate, "DD MM YYYY HH:mm:ss", true)).toISOString()).toISOString(),
                        periodicity: { count: req.body.count, period: req.body.period },
                        creationDate: new Date(moment(Date.now(), true).toISOString()).toISOString(),
                        repeatEnd: new Date((moment(req.body.repeatEnd, "DD MM YYYY HH:mm:ss", true)).toISOString()).toISOString()
                    };
                    await spinal_env_viewer_task_service_1.SpinalEventService.updateEvent(event.getId().get(), newEventInfo);
                }
                else {
                    return res.status(400).send("this context is not a SpinalEventGroupContext");
                }
            }
            else {
                return res.status(400).send("node not found in context");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json();
    });
};
//# sourceMappingURL=updateEvent.js.map