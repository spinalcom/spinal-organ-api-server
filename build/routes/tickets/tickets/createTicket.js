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
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const awaitSync_1 = require("../../../utilities/awaitSync");
const loadNode_1 = require("../../../utilities/loadNode");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/create_ticket:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - read
     *     description: add a Ticket
     *     summary: add a Ticket
     *     tags:
     *       - Workflow & ticket
     *     requestBody:
     *       description: For the two parameters *workflow* and *process* you can browse it either by putting the dynamicId or the name
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - workflow
     *               - process
     *               - nodeDynamicId
     *               - name
     *               - priority
     *               - description
     *               - declarer_id
     *               - imageString
     *             properties:
     *               workflow:
     *                 type: string
     *               process:
     *                 type: string
     *               nodeDynamicId:
     *                 type: number
     *               name:
     *                 type: string
     *               priority:
     *                 type: number
     *               description:
     *                 type: string
     *               declarer_id:
     *                 type: string
     *               images:
     *                 type: array
     *                 items:
     *                  type: object
     *                  properties:
     *                    name:
     *                      type: string
     *                    value:
     *                      type: string
     *                    comments:
     *                      type: string
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Ticket'
     *       400:
     *         description: Add not Successfully
     */
    app.post('/api/v1/ticket/create_ticket', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            let ticketCreated;
            let ticketInfo = {
                name: req.body.name,
                priority: req.body.priority,
                description: req.body.description,
                declarer_id: req.body.declarer_id,
            };
            yield spinalAPIMiddleware.getGraph();
            let arrayofServerId = [
                parseInt(req.body.nodeDynamicId, 10),
                parseInt(req.body.workflow, 10),
                parseInt(req.body.process, 10),
            ];
            const [node, workflowById, processById] = yield (0, loadNode_1._load)(arrayofServerId, spinalAPIMiddleware, profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            if (workflowById === undefined && processById === undefined) {
                var allContexts = spinal_service_ticket_1.serviceTicketPersonalized.getContexts();
                for (const context of allContexts) {
                    if (context.name === req.body.workflow) {
                        let result = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(context.id);
                        //@ts-ignore
                        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(result);
                        var workflowByName = result;
                    }
                }
                if (workflowByName) {
                    var allProcess = yield spinal_service_ticket_1.serviceTicketPersonalized.getAllProcess(workflowByName.getId().get());
                    for (const process of allProcess) {
                        if (process.name.get() === req.body.process) {
                            let result = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(process.id.get());
                            //@ts-ignore
                            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(result);
                            var processByName = result;
                        }
                    }
                }
                if (processByName.belongsToContext(workflowByName)) {
                    ticketCreated = yield spinal_service_ticket_1.serviceTicketPersonalized.addTicket(ticketInfo, processByName.getId().get(), workflowByName.getId().get(), node.getId().get());
                }
                else {
                    res.status(400).send('the workflow does not contain this process');
                }
            }
            else {
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(workflowById);
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(processById);
                if (processById) {
                    if (processById.belongsToContext(workflowById)) {
                        ticketCreated = yield spinal_service_ticket_1.serviceTicketPersonalized.addTicket(ticketInfo, processById.getId().get(), workflowById.getId().get(), node.getId().get());
                    }
                    else {
                        res.status(400).send('the workflow does not contain this process');
                    }
                }
            }
            var ticketList = yield spinal_service_ticket_1.serviceTicketPersonalized.getTicketsFromNode(node.getId().get());
            for (let index = 0; index < ticketList.length; index++) {
                if (ticketList[index].id === ticketCreated) {
                    var realNodeTicket = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(ticketList[index].id);
                    yield (0, awaitSync_1.awaitSync)(realNodeTicket);
                    var info = {
                        dynamicId: realNodeTicket._server_id,
                        staticId: realNodeTicket.getId().get(),
                        name: realNodeTicket.getName().get(),
                        type: realNodeTicket.getType().get(),
                        elementSelcted: req.body.nodeDynamicId,
                        priority: realNodeTicket.info.priority.get(),
                        description: (_a = realNodeTicket.info) === null || _a === void 0 ? void 0 : _a.description.get(),
                        declarer_id: (_b = realNodeTicket.info) === null || _b === void 0 ? void 0 : _b.declarer_id.get(),
                        creationDate: realNodeTicket.info.creationDate.get(),
                    };
                }
            }
            if (req.body.images && req.body.images.length > 0) {
                const objImage = new spinal_core_connectorjs_type_1.Lst(req.body.images);
                realNodeTicket.info.add_attr('images', new spinal_core_connectorjs_type_1.Ptr(objImage));
                for (const image of req.body.images) {
                    // @ts-ignore
                    var user = { username: 'admin', userId: 0 };
                    yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addNote(realNodeTicket, user, image.value);
                }
            }
            // var images = req.body.images
            // for (const image of images) {
            //   const fs = require('fs');
            //   var base64 = image.value;
            //   var data = base64.replace(/^data:image\/\w+;base64,/, "");
            //   var ReadableData = require('stream').Readable
            //   const imageBufferData = Buffer.from(data, 'base64')
            //   var streamObj = new ReadableData()
            //   streamObj.push(imageBufferData)
            //   streamObj.push(null)
            //   var pipe = streamObj.pipe(fs.createWriteStream('./' + image.name));
            //   pipe.on('finish', function () {
            //     console.log("pipe.ON");
            //     const fileData = new LocalFileData('./' + image.name)
            //     console.log("filedata", fileData);
            //   });
            // }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send({ ko: error });
        }
        res.json(info);
    }));
};
//# sourceMappingURL=createTicket.js.map