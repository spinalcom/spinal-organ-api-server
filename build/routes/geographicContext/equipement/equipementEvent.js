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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_task_service_1 = require("spinal-env-viewer-task-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/equipement/{id}/event_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns events of equipement
   *     summary: Get list events of equipement
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
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
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Event'
   *       400:
   *         description: Bad request
  */
    app.get("/api/v1/equipement/:id/event_list", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var nodes = [];
            const equipement = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(equipement);
            if (equipement.getType().get() === "BIMObject") {
                const listEvents = await spinal_env_viewer_task_service_1.SpinalEventService.getEvents(equipement.getId().get());
                for (const child of listEvents) {
                    // @ts-ignore
                    const _child = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(child.id.get());
                    if (_child.getType().get() === "SpinalEvent") {
                        const info = {
                            dynamicId: _child._server_id,
                            staticId: _child.getId()?.get(),
                            name: _child.getName()?.get(),
                            type: _child.getType()?.get(),
                            groupID: _child.info.groupId?.get(),
                            categoryID: child.categoryId?.get(),
                            nodeId: _child.info.nodeId?.get(),
                            repeat: _child.info.repeat?.get(),
                            description: _child.info.description?.get(),
                            startDate: _child.info.startDate?.get(),
                            endDate: _child.info.endDate?.get(),
                        };
                        nodes.push(info);
                    }
                }
            }
            else {
                res.status(400).send("node is not of type  BIMObject");
                return;
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(nodes);
    });
};
//# sourceMappingURL=equipementEvent.js.map