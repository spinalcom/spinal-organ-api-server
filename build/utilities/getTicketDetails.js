"use strict";
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
    // Notes
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
    // Files
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
            const result = log.steps.map((el) => spinal_env_viewer_graph_service_1.SpinalGraphService.getNode(el));
            const step1 = result[0]?.name.get();
            const step2 = result[1]?.name.get();
            const pre = log.event == Constants_1.LOGS_EVENTS.moveToNext ? true : false;
            texte = pre
                ? `Passed from ${step1} to ${step2}`
                : `Backward from ${step1} to ${step2}`;
        }
        return texte;
    }
    const logs = await spinal_service_ticket_1.serviceTicketPersonalized.getLogs(_ticket.getId().get());
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
    // element Selected
    let elementSelected;
    const parentsTicket = await _ticket.getParents('SpinalSystemServiceTicketHasTicket');
    for (const parent of parentsTicket) {
        if (!['SpinalSystemServiceTicketTypeStep', 'analyticOutputs'].includes(parent.getType().get())) {
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(parent);
            elementSelected = parent;
        }
    }
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
        userName: _ticket.info.user?.name?.get() || _ticket.info.user?.username?.get() || '',
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
exports.default = getTicketDetails;
//# sourceMappingURL=getTicketDetails.js.map