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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const recTree_1 = require("../../utilities/recTree");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/geographicContext/space:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Return space tree of context
   *     summary: Get a space tree context
   *     tags:
   *       - Geographic Context
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/ContextTree'
   *       400:
   *         description: Bad request
   */
    app.get("/api/v1/geographicContext/space", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var contexts;
        try {
            yield spinalAPIMiddleware.getGraph();
            let geographicContexts = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getContextWithType("geographicContext");
            let geographicContext = geographicContexts[0];
            if (geographicContext instanceof spinal_env_viewer_graph_service_1.SpinalContext) {
                contexts = {
                    dynamicId: geographicContext._server_id,
                    staticId: geographicContext.getId().get(),
                    name: geographicContext.getName().get(),
                    type: geographicContext.getType().get(),
                    context: (geographicContext instanceof spinal_env_viewer_graph_service_1.SpinalContext ? "SpinalContext" : ""),
                    children: yield (0, recTree_1.recTreeDepth)(geographicContext, geographicContext, 3)
                };
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send("ko");
        }
        res.json(contexts);
    }));
};
/**
 * @swagger
 * components:
 *   schemas:
 *     ContextTree:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 *         context:
 *           type: "string"
 *         children:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/ContextTree"
 *       example:
 *         dynamicId: 377295296
 *         staticId: SpinalContext-b61aca38-c262-56bd-9b3b-72fba07999a4-173a52a9bd8
 *         name: Scenes
 *         type: SpinalService
 *         context: SpinalContext
 *         children:
 *         - dynamicId: 377301280
 *           staticId: SpinalNode-c04c8302-ef21-7fa1-3435-8bf1ecd717b8-173a52a9bde
 *           name: sqdsq
 *           type: scene
 *           children: []
 */
//# sourceMappingURL=geographicContextSpace.js.map