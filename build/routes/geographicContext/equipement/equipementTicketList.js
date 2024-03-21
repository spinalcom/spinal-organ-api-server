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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const Constants_1 = require("spinal-service-ticket/dist/Constants");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/equipement/{id}/ticket_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Returns list of tickets of equipement
     *     summary: Get list of tickets of equipement
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
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Ticket'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/equipement/:id/ticket_list', async (req, res, next) => {
        const nodes = [];
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const equipement = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(equipement);
            if (equipement.getType().get() === 'BIMObject') {
                const ticketList = await spinal_service_ticket_1.serviceTicketPersonalized.getTicketsFromNode(equipement.getId().get());
                for (let index = 0; index < ticketList.length; index++) {
                    const realNodeTicket = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(ticketList[index].id);
                    //context && workflow
                    const workflow = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(realNodeTicket.getContextIds()[0]);
                    //Step
                    const _step = await realNodeTicket
                        .getParents('SpinalSystemServiceTicketHasTicket')
                        .then((steps) => {
                        for (const step of steps) {
                            if (step.getType().get() === 'SpinalSystemServiceTicketTypeStep') {
                                return step;
                            }
                        }
                    });
                    const _process = await _step
                        .getParents('SpinalSystemServiceTicketHasStep')
                        .then((processes) => {
                        for (const process of processes) {
                            if (process.getType().get() === 'SpinalServiceTicketProcess') {
                                return process;
                            }
                        }
                    });
                    // Notes
                    const notes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getNotes(realNodeTicket);
                    const _notes = [];
                    for (const note of notes) {
                        const infoNote = {
                            userName: note.element.username.get(),
                            date: note.element.date.get(),
                            type: note.element.type.get(),
                            message: note.element.message.get(),
                        };
                        _notes.push(infoNote);
                    }
                    // Files
                    const _files = [];
                    const fileNode = (await realNodeTicket.getChildren('hasFiles'))[0];
                    if (fileNode) {
                        const filesfromElement = await fileNode.element.load();
                        for (let index = 0; index < filesfromElement.length; index++) {
                            const infoFiles = {
                                dynamicId: filesfromElement[index]._server_id,
                                Name: filesfromElement[index].name.get(),
                            };
                            _files.push(infoFiles);
                        }
                    }
                    // Logs
                    async function formatEvent(log) {
                        let texte = '';
                        if (log.event == Constants_1.LOGS_EVENTS.creation) {
                            texte = 'created';
                        }
                        else if (log.event == Constants_1.LOGS_EVENTS.archived) {
                            texte = 'archived';
                        }
                        else if (log.event == Constants_1.LOGS_EVENTS.unarchive) {
                            texte = 'unarchived';
                        }
                        else {
                            const promises = log.steps.map((el) => spinal_env_viewer_graph_service_1.SpinalGraphService.getNodeAsync(el));
                            texte = await Promise.all(promises).then((result) => {
                                //@ts-ignore
                                const step1 = result[0].name.get();
                                //@ts-ignore
                                const step2 = result[1].name.get();
                                const pre = log.event == Constants_1.LOGS_EVENTS.moveToNext ? true : false;
                                return pre
                                    ? `Passed from ${step1} to ${step2}`
                                    : `Backward from ${step1} to ${step2}`;
                            });
                        }
                        return texte;
                    }
                    const logs = await spinal_service_ticket_1.serviceTicketPersonalized.getLogs(realNodeTicket.getId().get());
                    const _logs = [];
                    for (const log of logs) {
                        const infoLogs = {
                            userName: log.user.name,
                            date: log.creationDate,
                            event: await formatEvent(log),
                            ticketStaticId: log.ticketId,
                        };
                        _logs.push(infoLogs);
                    }
                    const info = {
                        dynamicId: realNodeTicket._server_id,
                        staticId: realNodeTicket.getId().get(),
                        name: realNodeTicket.getName().get(),
                        type: realNodeTicket.getType().get(),
                        priority: realNodeTicket.info.priority.get(),
                        creationDate: realNodeTicket.info.creationDate.get(),
                        description: realNodeTicket.info.description == undefined
                            ? ''
                            : realNodeTicket.info.description.get(),
                        declarer_id: realNodeTicket.info.declarer_id == undefined
                            ? ''
                            : realNodeTicket.info.declarer_id.get(),
                        userName: realNodeTicket.info.user == undefined
                            ? ''
                            : realNodeTicket.info.user.name.get(),
                        gmaoId: realNodeTicket.info.gmaoId == undefined
                            ? ''
                            : realNodeTicket.info.gmaoId.get(),
                        gmaoDateCreation: realNodeTicket.info.gmaoDateCreation == undefined
                            ? ''
                            : realNodeTicket.info.gmaoDateCreation.get(),
                        process: _process === undefined
                            ? ''
                            : {
                                dynamicId: _process._server_id,
                                staticId: _process.getId().get(),
                                name: _process.getName().get(),
                                type: _process.getType().get(),
                            },
                        step: _step === undefined
                            ? ''
                            : {
                                dynamicId: _step._server_id,
                                staticId: _step.getId().get(),
                                name: _step.getName().get(),
                                type: _step.getType().get(),
                                color: _step.info.color.get(),
                                order: _step.info.order.get(),
                            },
                        workflowId: workflow?._server_id,
                        workflowName: workflow?.getName().get(),
                        annotation_list: _notes,
                        file_list: _files,
                        log_list: _logs,
                    };
                    nodes.push(info);
                }
            }
            else {
                res.status(400).send('node is not of type BIMObject');
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
        res.json(nodes);
    });
};
//# sourceMappingURL=equipementTicketList.js.map