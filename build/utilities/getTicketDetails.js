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
exports.getTicketDetails = void 0;
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const Constants_1 = require("spinal-service-ticket/dist/Constants");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getTicketDetails(spinalAPIMiddleware, profileId, ticketId) {
    await spinalAPIMiddleware.getGraph();
    const _ticket = await spinalAPIMiddleware.load(ticketId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(_ticket);
    //Step
    const _step = await _ticket
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
    // retrieve all allSteps
    const allSteps = await _process.getChildren('SpinalSystemServiceTicketHasStep');
    for (const stp of allSteps) {
        //@ts-ignore
        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(stp);
    }
    //Context
    const contextRealNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(_ticket.getContextIds()[0]);
    // Execute all async operations concurrently
    const [_notes, _files, _logs, elementSelected] = await Promise.all([
        getTicketNotes(_ticket),
        getTicketFiles(_ticket),
        getTicketLog(_ticket),
        getElementSelectedTicket(_ticket),
    ]);
    const info = {
        dynamicId: _ticket._server_id,
        staticId: _ticket.getId().get(),
        name: _ticket.getName().get(),
        type: _ticket.getType().get(),
        priority: _ticket.info.priority?.get() || '',
        creationDate: _ticket.info.creationDate?.get() || '',
        description: _ticket.info.description?.get() || '',
        declarer_id: _ticket.info.declarer_id?.get() || '',
        elementSelected: elementSelected === undefined
            ? ''
            : {
                dynamicId: elementSelected._server_id,
                staticId: elementSelected.getId().get(),
                name: elementSelected.getName().get(),
                type: elementSelected.getType().get(),
            },
        userName: _ticket.info.user?.name?.get() ||
            _ticket.info.user?.username?.get() ||
            '',
        gmaoId: _ticket.info.gmaoId?.get() || '',
        gmaoDateCreation: _ticket.info.gmaoDateCreation?.get() || '',
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
        workflowId: contextRealNode?._server_id,
        workflowName: contextRealNode?.getName().get(),
        annotation_list: _notes,
        file_list: _files,
        log_list: _logs,
    };
    return info;
}
exports.getTicketDetails = getTicketDetails;
async function getElementSelectedTicket(_ticket) {
    let elementSelected = undefined;
    const parentsTicket = await _ticket.getParents('SpinalSystemServiceTicketHasTicket');
    for (const parent of parentsTicket) {
        if (!['SpinalSystemServiceTicketTypeStep', 'analyticOutputs'].includes(parent.getType().get())) {
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(parent);
            elementSelected = parent;
        }
    }
    return elementSelected;
}
async function getTicketNotes(_ticket) {
    const notes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getNotes(_ticket);
    const _notes = [];
    for (const note of notes) {
        const infoNote = {
            userName: note.element.username === undefined ? '' : note.element.username.get(),
            date: note.element.date.get(),
            type: note.element.type.get(),
            message: note.element.message.get(),
        };
        _notes.push(infoNote);
    }
    return _notes;
}
async function getTicketFiles(_ticket) {
    const _files = [];
    const fileNode = (await _ticket.getChildren('hasFiles'))[0];
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
async function getTicketLog(_ticket) {
    const _logs = [];
    const logs = await spinal_service_ticket_1.serviceTicketPersonalized.getLogs(_ticket.getId().get());
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
exports.default = getTicketDetails;
//# sourceMappingURL=getTicketDetails.js.map