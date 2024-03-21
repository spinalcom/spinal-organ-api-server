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
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/command/room/{id}/blind:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return blind state of a room
   *     summary: Gets blind state of a room
   *     tags:
   *      - Command
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
   *                $ref: '#/components/schemas/Command'
   *       400:
   *         description: Bad request
    */
    app.get("/api/v1/command/room/:id/blind", async (req, res, next) => {
        let info;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            const controlPoints = await room.getChildren('hasControlPoints');
            for (const controlPoint of controlPoints) {
                if (controlPoint.getName().get() === "Command") {
                    const bmsEndpointsChildControlPoint = await controlPoint.getChildren('hasBmsEndpoint');
                    for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                        if (bmsEndPoint.getName().get() === "COMMAND_BLIND") {
                            // var element = (await bmsEndPoint.element.load()).get();
                            const element = (await bmsEndPoint.element.load());
                            info = {
                                dynamicId: room._server_id,
                                staticId: room.getId().get(),
                                name: room.getName().get(),
                                type: room.getType().get(),
                                currentValue: element.currentValue.get()
                            };
                        }
                    }
                }
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of room is not loaded");
        }
        res.send(info);
    });
};
//# sourceMappingURL=roomCommandBlind.js.map