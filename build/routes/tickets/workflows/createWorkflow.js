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
const spinal_service_ticket_1 = require("spinal-service-ticket");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
    * @swagger
    * /api/v1/workflow/create:
    *   post:
    *     security:
    *       - OauthSecurity:
    *         - read
    *     description: create a workflow
    *     summary: create a workflow
    *     tags:
    *       - Workflow & ticket
    *     requestBody:
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required:
    *               - nameWorkflow
    *             properties:
    *               nameWorkflow:
    *                 type: string
    *     responses:
    *       200:
    *         description: Create Successfully
    *       400:
    *         description: create not Successfully
    */
    app.post("/api/v1/workflow/create", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = spinalAPIMiddleware.getGraph(profileId);
            const graph = spinal_env_viewer_graph_service_1.SpinalGraphService.getGraph();
            var childrens = yield graph.getChildren("hasContext");
            for (const child of childrens) {
                if (child.getName().get() === req.body.nameWorkflow) {
                    return res.status(400).send("the name context already exists");
                }
            }
            if (req.body.nameWorkflow !== "string") {
                const context = yield spinal_service_ticket_1.serviceTicketPersonalized.createContext(req.body.nameWorkflow, []);
                yield userGraph.addContext(context);
                return res.status(200).json({
                    name: context.getName().get(),
                    type: context.getType().get(),
                    staticId: context.getId().get(),
                    dynamicId: context._server_id,
                });
            }
            else {
                return res.status(400).send("string is invalide name");
            }
        }
        catch (error) {
            console.log(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send("ko");
        }
    }));
};
//# sourceMappingURL=createWorkflow.js.map