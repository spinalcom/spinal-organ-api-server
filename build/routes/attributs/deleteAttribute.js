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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
    * @swagger
    * /api/v1/node/{idNode}/category/{idCategory}/attribute/{attributName}/delete:
    *   delete:
    *     security:
    *       - OauthSecurity:
    *         - read
    *     description: Delete an attribute
    *     summary: delete an attribut
    *     tags:
    *       - Node Attributs
    *     parameters:
    *      - in: path
    *        name: idNode
    *        description: use the dynamic ID
    *        required: true
    *        schema:
    *          type: integer
    *          format: int64
    *      - in: path
    *        name: idCategory
    *        description: use the dynamic ID
    *        required: true
    *        schema:
    *          type: integer
    *          format: int64
    *      - in: path
    *        name: attributName
    *        required: true
    *        schema:
    *          type: string
    *     responses:
    *       200:
    *         description: Delete Successfully
    *       400:
    *         description: Bad request
    */
    app.delete("/api/v1/node/:idNode/category/:idCategory/attribute/:attributName/delete", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            let node = yield spinalAPIMiddleware.load(parseInt(req.params.idNode, 10), profileId);
            let category = yield spinalAPIMiddleware.load(parseInt(req.params.idCategory), profileId);
            let attributeLabel = req.params.attributName;
            let childrens = yield node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            for (let index = 0; index < childrens.length; index++) {
                if (childrens[index]._server_id === category._server_id) {
                    yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.removeAttributesByLabel(category, attributeLabel);
                    return res.status(200).send("deleted");
                }
                // else {
                // return res.status(400).send("ko");
                // }
            }
            res.status(404).send("category not found");
        }
        catch (error) {
            console.log(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send("ko");
        }
        res.json();
    }));
};
//# sourceMappingURL=deleteAttribute.js.map