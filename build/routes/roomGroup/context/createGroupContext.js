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
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("spinal-env-viewer-context-geographic-service/build/constants");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/roomsGroup/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: create Rooms Group context
   *     summary: create Rooms Group context
   *     tags:
   *       - Rooms Group
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - contextName
   *             properties:
   *                contextName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: Bad request
  */
    app.post("/api/v1/roomsGroup/create", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                res.status(406).send(`No graph found for ${profileId}`);
            const graph = await spinalAPIMiddleware.getGraph();
            await spinal_env_viewer_graph_service_1.SpinalGraphService.setGraph(graph);
            const context = await spinal_env_viewer_plugin_group_manager_service_1.default.createGroupContext(req.body.contextName, constants_1.ROOM_TYPE);
            userGraph.addContext(context);
            res.status(200).json({
                name: context.getName().get(),
                staticId: context.getId().get(),
                dynamicId: context._server_id,
                type: context.getType().get()
            });
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=createGroupContext.js.map