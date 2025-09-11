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
const constants_1 = require("spinal-env-viewer-context-geographic-service/build/constants");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const awaitSync_1 = require("../../../utilities/awaitSync");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/equipementsGroup/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: create equipements Group context
   *     summary: create equipements Group context
   *     tags:
   *       - Equipements Group
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
   *                contextColor:
   *                 type: string
   *                contextIcon:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: Bad request
  */
    app.post("/api/v1/equipementsGroup/create", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                res.status(406).send(`No graph found for ${profileId}`);
            const graph = await spinalAPIMiddleware.getGraph();
            await spinal_env_viewer_graph_service_1.SpinalGraphService.setGraph(graph);
            const contextExist = await graph.getContext(req.body.contextName);
            if (contextExist) {
                return res.status(400).send("Context name already exists");
            }
            const context = await spinal_env_viewer_plugin_group_manager_service_1.default.createGroupContext(req.body.contextName, constants_1.EQUIPMENT_TYPE);
            if (req.body.contextColor) {
                context.info.add_attr({ color: req.body.contextColor });
            }
            if (req.body.contextIcon) {
                context.info.add_attr({ icon: req.body.contextIcon });
            }
            await (0, awaitSync_1.awaitSync)(context); // Wait for the _server_id to be assigned by hub
            //userGraph.addContext(context);
            return res.status(200).json({
                name: context.getName().get(),
                staticId: context.getId().get(),
                dynamicId: context._server_id,
                type: context.getType().get(),
                icon: context.info.icon?.get(),
                color: context.info.color?.get()
            });
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message);
        }
    });
};
//# sourceMappingURL=createGroupContext.js.map