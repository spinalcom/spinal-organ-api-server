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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/room/{id}/read_details:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: read details of room
   *     summary: Gets details of room
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
   *                $ref: '#/components/schemas/RoomDetails'
   *       400:
   *         description: Bad request
    */
    app.get("/api/v1/room/:id/read_details", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            let area = 0;
            let _bimObjects = [];
            var room = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            const t = [];
            var bimFileId;
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            if (room.getType().get() === "geographicRoom") {
                var bimObjects = yield room.getChildren("hasBimObject");
                for (const bimObject of bimObjects) {
                    bimFileId = bimObject.info.bimFileId.get();
                    const infoBimObject = {
                        staticId: bimObject.getId().get(),
                        name: bimObject.getName().get(),
                        type: bimObject.getType().get(),
                        version: bimObject.info.version.get(),
                        externalId: bimObject.info.externalId.get(),
                        dbid: bimObject.info.dbid.get(),
                    };
                    _bimObjects.push(infoBimObject);
                }
                let categories = yield room.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
                for (const child of categories) {
                    if (child.getName().get() === "Spatial") {
                        let attributs = yield child.element.load();
                        for (const attribut of attributs.get()) {
                            if (attribut.label === "area") {
                                area = attribut.value;
                            }
                        }
                    }
                }
                var info = {
                    area: area,
                    bimFileId: bimFileId,
                    _bimObjects: _bimObjects
                };
            }
            else {
                res.status(400).send("node is not of type geographic room");
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send("ko");
        }
        res.json(info);
    }));
};
//# sourceMappingURL=readRoomDetails.js.map