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
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/floor/{id}/room_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return list of room
   *     summary: Gets a list of room
   *     tags:
   *      - Geographic Context
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
   *                $ref: '#/components/schemas/Room'
   *       400:
   *         description: Bad request
    */
    app.get("/api/v1/floor/:id/room_list", async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const floor = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(floor);
            const { spec } = req.query;
            const rooms = await floor.getChildren("hasGeographicRoom");
            for (const room of rooms) {
                var info;
                const categories = await room.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
                if (spec === "archipel") {
                    for (const category of categories) {
                        if (category.getName().get() === "default") {
                            var attributs = (await category.element.load()).get();
                            for (const attr of attributs) {
                                if (attr.label === "showOccupant") {
                                    if (attr.value === true || attr.value === "true") {
                                        info = {
                                            dynamicId: room._server_id,
                                            staticId: room.getId().get(),
                                            name: room.getName().get(),
                                            type: room.getType().get(),
                                            aliasOccupant: showInfo("aliasOccupant", attributs),
                                            idOccupant: showInfo("idOccupant", attributs),
                                            bureauOccupant: showInfo("bureauOccupant", attributs),
                                            showOccupant: showInfo("showOccupant", attributs),
                                        };
                                        nodes.push(info);
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    const categoriesTab = [];
                    for (const category of categories) {
                        var attributs = (await category.element.load()).get();
                        const catInfo = {
                            dynamicId: category._server_id,
                            staticId: category.getId().get(),
                            name: category.getName().get(),
                            type: category.getType().get(),
                            attributs: attributs
                        };
                        categoriesTab.push(catInfo);
                    }
                    info = {
                        dynamicId: room._server_id,
                        staticId: room.getId().get(),
                        name: room.getName().get(),
                        type: room.getType().get(),
                        categories: categoriesTab
                    };
                    nodes.push(info);
                }
            }
            function showInfo(name, attributes) {
                for (const attr of attributes) {
                    if (attr.label === name) {
                        return attr.value;
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of room is not loaded");
        }
        res.send(nodes);
    });
};
//# sourceMappingURL=roomList.js.map