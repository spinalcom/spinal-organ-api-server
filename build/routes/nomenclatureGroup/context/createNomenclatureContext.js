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
const spinal_env_viewer_plugin_nomenclature_service_1 = require("spinal-env-viewer-plugin-nomenclature-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/nomenclatureGroup/create:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: create nomenclature Group context
   *     summary: create nomenclature Group context
   *     tags:
   *       - Nomenclature Group
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nomenclatureContextName
   *             properties:
   *                nomenclatureContextName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: Bad request
  */
    app.post("/api/v1/nomenclatureGroup/create", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = spinalAPIMiddleware.getGraph(profileId);
            if (!userGraph)
                res.status(406).send(`No graph found for ${profileId}`);
            let context = yield spinal_env_viewer_plugin_nomenclature_service_1.spinalNomenclatureService.createOrGetContext(req.body.nomenclatureContextName);
            userGraph.addContext(context);
            var info = {
                dynamicId: context._server_id,
                staticId: context.getId().get(),
                name: context.getName().get(),
                type: context.getType().get(),
            };
            res.status(200).json(info);
        }
        catch (error) {
            console.error(error);
            res.status(400).send("ko");
        }
    }));
};
//# sourceMappingURL=createNomenclatureContext.js.map