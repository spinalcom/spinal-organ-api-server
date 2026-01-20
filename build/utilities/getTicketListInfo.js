"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
exports.getTicketListInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const Constants_1 = require("spinal-service-ticket/dist/Constants");
const spinal_service_ticket_1 = require("spinal-service-ticket");
async function getTicketListInfo(spinalAPIMiddleware, profileId, dynamicId, includeAttachedItems = false) {
    const nodes = [];
    await spinalAPIMiddleware.getGraph();
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
    const ticketList = await node.getChildren('SpinalSystemServiceTicketHasTicket');
    for (const ticket of ticketList) {
        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(ticket);
        //context && workflow
        const workflow = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(ticket.getContextIds()[0]);
        //Step
        const _step = await ticket
            .getParents('SpinalSystemServiceTicketHasTicket')
            .then((steps) => {
            let foundStep = undefined;
            for (const step of steps) {
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(step);
                if (step.getType().get() === 'SpinalSystemServiceTicketTypeStep') {
                    foundStep = step;
                }
            }
            return foundStep;
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
        const info = {
            dynamicId: ticket._server_id,
            staticId: ticket.getId().get(),
            name: ticket.getName().get(),
            type: ticket.getType().get(),
            priority: ticket.info.priority?.get(),
            creationDate: ticket.info.creationDate?.get() ?? '',
            userName: ticket.info.user?.name?.get() ?? '',
            gmaoId: ticket.info.gmaoId?.get() ?? '',
            gmaoDateCreation: ticket.info.gmaoDateCreation?.get() ?? '',
            description: ticket.info.description?.get() ?? '',
            declarer_id: ticket.info.declarer_id?.get() ?? '',
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
                    color: _step.info.color?.get(),
                    order: _step.info.order?.get(),
                },
            workflowId: workflow?._server_id,
            workflowName: workflow?.getName().get(),
        };
        if (includeAttachedItems) {
            const [notesResult, filesResult, logsResult] = await Promise.allSettled([
                fetchTicketNotes(ticket),
                getFilesFromNode(ticket),
                getTicketLogs(ticket),
            ]);
            info['annotation_list'] =
                notesResult.status === 'fulfilled' ? notesResult.value : [];
            info['file_list'] =
                filesResult.status === 'fulfilled' ? filesResult.value : [];
            info['log_list'] =
                logsResult.status === 'fulfilled' ? logsResult.value : [];
        }
        nodes.push(info);
    }
    return nodes;
}
exports.getTicketListInfo = getTicketListInfo;
async function fetchTicketNotes(ticket) {
    const notes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getNotes(ticket);
    const _notes = [];
    for (const note of notes) {
        const infoNote = {
            userName: note.element.username?.get(),
            date: note.element.date?.get(),
            type: note.element.type?.get(),
            message: note.element.message?.get(),
        };
        _notes.push(infoNote);
    }
    return _notes;
}
async function getTicketLogs(ticket) {
    const _logs = [];
    const logs = await spinal_service_ticket_1.serviceTicketPersonalized.getLogs(ticket.getId().get());
    for (const log of logs) {
        const infoLogs = {
            userName: log.user.name,
            date: log.creationDate,
            event: formatEvent(log),
            ticketStaticId: log.ticketId,
        };
        _logs.push(infoLogs);
    }
    return _logs;
}
async function getFilesFromNode(ticket) {
    const _files = [];
    const fileNode = (await ticket.getChildren('hasFiles'))[0];
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
    return _files;
}
// Logs
function formatEvent(log) {
    if (log.event == Constants_1.LOGS_EVENTS.creation) {
        return 'created';
    }
    else if (log.event == Constants_1.LOGS_EVENTS.archived) {
        return 'archived';
    }
    else if (log.event == Constants_1.LOGS_EVENTS.unarchive) {
        return 'unarchived';
    }
    else {
        if (log.steps.length < 2)
            return 'unknown event';
        const step1 = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(log.steps[0])?.info.name.get() ||
            'unknown step';
        const step2 = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(log.steps[1])?.info.name.get() ||
            'unknown step';
        const pre = log.event == Constants_1.LOGS_EVENTS.moveToNext ? true : false;
        return pre
            ? `Passed from ${step1} to ${step2}`
            : `Backward from ${step1} to ${step2}`;
    }
}
exports.default = getTicketListInfo;
//# sourceMappingURL=getTicketListInfo.js.map