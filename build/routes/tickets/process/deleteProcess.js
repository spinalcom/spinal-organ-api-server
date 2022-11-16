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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
    * @swagger
    * /api/v1/workflow/{workflowId}/process/{processId}/delete_process:
    *   delete:
    *     security:
    *       - OauthSecurity:
    *         - read
    *     description: Delete a process
    *     summary: delete an process
    *     tags:
    *       - Workflow & ticket
    *     parameters:
    *      - in: path
    *        name: workflowId
    *        description: use the dynamic ID
    *        required: true
    *        schema:
    *          type: integer
    *          format: int64
    *      - in: path
    *        name: processId
    *        description: use the dynamic ID
    *        required: true
    *        schema:
    *          type: integer
    *          format: int64
    *     responses:
    *       200:
    *         description: Delete Successfully
    *       400:
    *         description: Bad request
    */
    app.delete("/api/v1/workflow/:workflowId/process/:processId/delete_process", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            let workflow = yield spinalAPIMiddleware.load(parseInt(req.params.workflowId, 10));
            var process = yield spinalAPIMiddleware.load(parseInt(req.params.processId, 10));
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(process);
            if (workflow instanceof spinal_env_viewer_graph_service_1.SpinalContext && process.belongsToContext(workflow)) {
                if (workflow.getType().get() === "SpinalSystemServiceTicket") {
                    process.removeFromGraph();
                }
                else {
                    return res.status(400).send("this context is not a SpinalSystemServiceTicket");
                }
            }
            else {
                res.status(400).send("node not found in context");
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send("ko");
        }
        res.json();
    }));
};
//# sourceMappingURL=deleteProcess.js.map