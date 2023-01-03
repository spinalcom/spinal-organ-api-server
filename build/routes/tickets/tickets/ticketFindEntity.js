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
const spinal_service_ticket_1 = require("spinal-service-ticket");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/ticket/{ticketId}/find_entity:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Return entity of ticket
  *     summary: Get entity of ticket
  *     tags:
  *       - Workflow & ticket
  *     parameters:
  *      - in: path
  *        name: ticketId
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
  *                $ref: '#/components/schemas/BasicNode'
  *       400:
  *         description: Bad request
  */
    app.get("/api/v1/ticket/:ticketId/find_entity", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var _ticket = yield spinalAPIMiddleware.load(parseInt(req.params.ticketId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(_ticket);
            // var elementSelected = await spinalAPIMiddleware.loadPtr(_ticket.info.elementSelected)
            const parents = yield _ticket.getParents();
            const parent = parents.find(el => el.getType().get() !== spinal_service_ticket_1.STEP_TYPE);
            let info = {};
            if (parent) {
                info = {
                    dynamicId: parent._server_id,
                    staticId: parent.getId().get(),
                    name: parent.getName().get(),
                    type: parent.getType().get(),
                };
            }
            // var info = {
            //   dynamicId: elementSelected._server_id,
            //   staticId: elementSelected.getId().get(),
            //   name: elementSelected.getName().get(),
            //   type: elementSelected.getType().get(),
            // }
            res.status(200).json(info);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
    }));
};
//# sourceMappingURL=ticketFindEntity.js.map