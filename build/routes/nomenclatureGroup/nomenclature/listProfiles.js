"use strict";
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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_nomenclature_service_1 = require("spinal-env-viewer-plugin-nomenclature-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/nomenclatureGroup/{contextId}/profile_list:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Return list of nomenclature profiles
   *     summary: Gets a list of nomenclature profiles
   *     tags:
   *       - Nomenclature Group
   *     parameters:
   *      - in: path
   *        name: contextId
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
   *                $ref: '#/components/schemas/ProfilesList'
   *       400:
   *         description: Bad request
    */
    app.get("/api/v1/nomenclatureGroup/:contextId/profile_list", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            var context = yield spinalAPIMiddleware.load(parseInt(req.params.contextId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            if (context.getType().get() === "AttributeConfigurationGroupContext") {
                let listProfiles = yield spinal_env_viewer_plugin_nomenclature_service_1.spinalNomenclatureService.findOrGetProfiles(context.getId().get());
                listProfiles = Array.isArray(listProfiles) ? listProfiles : [listProfiles];
                var profile_tab = [];
                for (const profile of listProfiles) {
                    let _profile = profile;
                    var categories_tab = [];
                    for (const category of _profile.categories) {
                        var attr_tab = [];
                        for (const attr of category.attributes) {
                            let info_attr = {
                                name: attr.name,
                                standard_name: attr.standard_name,
                                type: attr.type,
                                unit: attr.unit,
                                id: attr.id,
                                show: attr.show
                            };
                            attr_tab.push(info_attr);
                        }
                        let info_category = {
                            id: category.id,
                            name: category.name,
                            standard_name: category.standard_name,
                            attributes: attr_tab
                        };
                        categories_tab.push(info_category);
                    }
                    const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(_profile.id);
                    const groupProfile = yield realNode.getParents("groupHasAttributeConfiguration");
                    const categoryProfile = yield groupProfile[0].getParents("hasGroup");
                    let info_profile = {
                        dynamicId: realNode._server_id,
                        staticId: realNode.getId().get(),
                        name: _profile.name,
                        type: realNode.getType().get(),
                        groupProfile: {
                            dynamicId: groupProfile[0]._server_id,
                            name: groupProfile[0].getName().get()
                        },
                        categoryProfile: {
                            dynamicId: categoryProfile[0]._server_id,
                            name: categoryProfile[0].getName().get()
                        },
                        contextProfile: {
                            dynamicId: context._server_id,
                            name: context.getName().get()
                        },
                        categories: categories_tab
                    };
                    profile_tab.push(info_profile);
                }
            }
            else {
                res.status(400).send("node is not type of AttributeConfigurationGroupContext ");
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send("list of group is not loaded");
        }
        res.send(profile_tab);
    }));
};
//# sourceMappingURL=listProfiles.js.map