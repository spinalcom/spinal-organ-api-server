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
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/room/{id}/read_static_details:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: read static details of room
   *     summary: Gets static details of room
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
    *                $ref: '#/components/schemas/StaticDetailsRoom'
   *       400:
   *         description: Bad request
    */
    app.get("/api/v1/room/:id/read_static_details", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            let equipements = [];
            let CategorieAttributsList = [];
            var room = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            if (room.getType().get() === "geographicRoom") {
                // controle EndPoints
                var profils = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(room.getId().get(), [spinal_env_viewer_plugin_control_endpoint_service_1.spinalControlPointService.ROOM_TO_CONTROL_GROUP]);
                var promises = profils.map((profile) => __awaiter(this, void 0, void 0, function* () {
                    var result = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(profile.id.get(), [spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
                    var endpoints = yield result.map((endpoint) => __awaiter(this, void 0, void 0, function* () {
                        var realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpoint.id.get());
                        var element = yield endpoint.element.load();
                        let category;
                        if (element.type.get() === "Temperature" || element.type.get() === "Hygrometry" || element.type.get() === "Power" || element.type.get() === "Occupation" || element.type.get() === "Light") {
                            category = "Measure";
                        }
                        else if (element.type.get() === "Alarm") {
                            category = "Alarm";
                        }
                        else if (element.type.get() === "Consigne") {
                            category = "Command";
                        }
                        else {
                            category = "Other";
                        }
                        // var currentValue = element.currentValue.get();
                        return {
                            dynamicId: realNode._server_id,
                            staticId: endpoint.id.get(),
                            name: element.name.get(),
                            category: category,
                        };
                    }));
                    return { profileName: profile.name.get(), endpoints: yield Promise.all(endpoints) };
                }));
                var allNodesControlesEndpoints = yield Promise.all(promises);
                //BIMOBJECTS
                var bimObjects = yield room.getChildren("hasBimObject");
                var revitCategory = "";
                var revitFamily = "";
                var revitType = "";
                for (const child of bimObjects) {
                    // attributs BIMObject
                    var categories_bimObjects = yield child.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
                    for (const categorie of categories_bimObjects) {
                        if (categorie.getName().get() === "default") {
                            var attributs_bimObjects = (yield categorie.element.load()).get();
                            for (const child of attributs_bimObjects) {
                                if (child.label === "revit_category") {
                                    revitCategory = child.value;
                                }
                            }
                        }
                    }
                    let info = {
                        dynamicId: child._server_id,
                        staticId: child.getId().get(),
                        name: child.getName().get(),
                        type: child.getType().get(),
                        bimFileId: child.info.bimFileId.get(),
                        version: child.info.version.get(),
                        externalId: child.info.externalId.get(),
                        dbid: child.info.dbid.get(),
                        default_attributs: {
                            revitCategory: revitCategory,
                            revitFamily: revitFamily,
                            revitType: revitType
                        }
                    };
                    equipements.push(info);
                }
                //attributs list
                let categories = yield room.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
                for (const child of categories) {
                    let attributs = (yield child.element.load()).get();
                    var filter_attributs = [];
                    for (const attribut of attributs) {
                        if (attribut.label === "name" || attribut.label === "area" || attribut.label === "perimeter" || attribut.label === "capacity") {
                            filter_attributs.push(attribut);
                        }
                    }
                    let info = {
                        dynamicId: child._server_id,
                        staticId: child.getId().get(),
                        name: child.getName().get(),
                        type: child.getType().get(),
                        attributs: filter_attributs
                    };
                    CategorieAttributsList.push(info);
                }
                // Parents List 
                let parents = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(room.getId().get(), ["hasGeographicRoom", "groupHasgeographicRoom"]);
                var groupParents = [];
                for (const parent of parents) {
                    if (!(parent.type.get() === "RoomContext")) {
                        let info = {
                            dynamicId: parent._server_id,
                            staticId: parent.id.get(),
                            name: parent.name.get(),
                            type: parent.type.get(),
                        };
                        groupParents.push(info);
                    }
                }
                var info = {
                    dynamicId: room._server_id,
                    staticId: room.getId().get(),
                    name: room.getName().get(),
                    type: room.getType().get(),
                    attributsList: CategorieAttributsList,
                    controlEndpoint: allNodesControlesEndpoints,
                    bimObjects: equipements,
                    groupParents: groupParents
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
//# sourceMappingURL=readStaticsDetails.js.map