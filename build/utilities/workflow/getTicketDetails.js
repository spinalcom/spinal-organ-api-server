"use strict";
/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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
const loadAndValidateNode_1 = require("../loadAndValidateNode");
function getPriorityNumber(priority) {
    console.log('getPriorityNumber called with priority:', priority);
    if (!priority)
        return 0;
    switch (priority.toLowerCase()) {
        case 'occasionally':
            return 0;
        case 'normal':
            return 1;
        case 'urgent':
            return 2;
        default:
            return Number(priority);
    }
}
async function getTicketDetails(spinalAPIMiddleware, profileId, ticketId, includeAttachedItems = true) {
    await spinalAPIMiddleware.getGraph();
    const { contextNode, processNode, stepNode, ticketNode } = await getTicketNodeTree(ticketId, profileId, spinalAPIMiddleware);
    if (!contextNode || !processNode || !stepNode || !ticketNode) {
        throw new Error('Failed to retrieve ticket node tree');
    }
    const proms = [(0, spinal_service_ticket_1.getNodeFromTicket)(ticketNode), (0, spinal_service_ticket_1.getTicketInfo)(ticketNode)];
    if (includeAttachedItems) {
        proms.push(getTicketNoteNodes(ticketNode), getTicketFiles(ticketNode), getTicketLogDetails(ticketNode, processNode, contextNode));
    }
    const elementSelected = await proms[0];
    const ticketNodeInfo = await proms[1];
    const allAttributes = await spinal_env_viewer_plugin_documentation_service_1.attributeService.getAllAttributes(ticketNode);
    // list of attributes to include even if they are empty : description, declarer_id, username, gmaoId, gmaoDateCreation
    // const allAttributesObject = allAttributes.map(attr => ({ [attr.label.get()]: attr.value.get() }));
    const info = {
        dynamicId: ticketNode._server_id,
        staticId: ticketNode.info.id.get(),
        name: ticketNode.info.name.get(),
        type: ticketNode.info.type.get(),
        priority: getPriorityNumber(ticketNodeInfo.priority),
        creationDate: ticketNode.info.creationDate?.get() || Number(ticketNodeInfo.creationDate) || NaN,
        elementSelected: elementSelected === undefined
            ? ''
            : {
                dynamicId: elementSelected._server_id,
                staticId: elementSelected.info.id.get(),
                name: elementSelected.info.name.get(),
                type: elementSelected.info.type.get(),
            },
        process: processNode === undefined
            ? ''
            : {
                dynamicId: processNode._server_id,
                staticId: processNode.info.id.get(),
                name: processNode.info.name.get(),
                type: processNode.info.type.get(),
            },
        step: stepNode === undefined
            ? ''
            : {
                dynamicId: stepNode._server_id,
                staticId: stepNode.info.id.get(),
                name: stepNode.info.name.get(),
                type: stepNode.info.type.get(),
                color: stepNode.info.color.get(),
                order: stepNode.info.order.get(),
            },
        workflowId: contextNode?._server_id,
        workflowName: contextNode?.info.name.get(),
    };
    for (const attr of allAttributes) {
        const label = attr.label.get();
        if (info[label] === undefined) {
            info[label] = attr.value.get();
        }
    }
    // const info = {
    //   dynamicId: ticketNode._server_id,
    //   staticId: ticketNode.info.id.get(),
    //   name: ticketNode.info.name.get(),
    //   type: ticketNode.info.type.get(),
    //   priority: getPriorityNumber(ticketNodeInfo.priority),
    //   creationDate: Number(ticketNodeInfo.creationDate) || NaN,
    //   description: ticketNodeInfo.description || '',
    //   declarer_id: ticketNodeInfo.declarer_id || '',
    //   elementSelected:
    //     elementSelected === undefined
    //       ? ''
    //       : {
    //         dynamicId: elementSelected._server_id,
    //         staticId: elementSelected.info.id.get(),
    //         name: elementSelected.info.name.get(),
    //         type: elementSelected.info.type.get(),
    //       },
    //   userName: ticketNodeInfo.username || ticketNodeInfo.user || '',
    //   gmaoId: ticketNodeInfo.gmaoId || '',
    //   gmaoDateCreation: ticketNodeInfo.gmaoDateCreation || '',
    //   process:
    //     processNode === undefined
    //       ? ''
    //       : {
    //         dynamicId: processNode._server_id,
    //         staticId: processNode.info.id.get(),
    //         name: processNode.info.name.get(),
    //         type: processNode.info.type.get(),
    //       },
    //   step:
    //     stepNode === undefined
    //       ? ''
    //       : {
    //         dynamicId: stepNode._server_id,
    //         staticId: stepNode.info.id.get(),
    //         name: stepNode.info.name.get(),
    //         type: stepNode.info.type.get(),
    //         color: stepNode.info.color.get(),
    //         order: stepNode.info.order.get(),
    //       },
    //   workflowId: contextNode?._server_id,
    //   workflowName: contextNode?.info.name.get(),
    // };
    if (includeAttachedItems) {
        info['note_list'] = await proms[2];
        info['file_list'] = await proms[3];
        info['log_list'] = await proms[4];
    }
    return info;
}
exports.getTicketDetails = getTicketDetails;
async function getTicketLogDetails(ticketNode, processNode, contextNode) {
    const logs = await (0, spinal_service_ticket_1.getTicketLogs)(ticketNode);
    const logRes = await Promise.all(logs.map(async (log) => ({
        userName: log.user?.name,
        date: log.creationDate,
        event: await formatEvent(log, processNode, contextNode),
        ticketStaticId: log.ticketId,
    })));
    return logRes;
}
async function formatEvent(log, processNode, contextNode) {
    let texte = '';
    if (log.event == spinal_service_ticket_1.LOGS_EVENTS.creation) {
        texte = 'created';
    }
    else if (log.event == spinal_service_ticket_1.LOGS_EVENTS.archived) {
        texte = 'archived';
    }
    else if (log.event == spinal_service_ticket_1.LOGS_EVENTS.unarchive) {
        texte = 'unarchived';
    }
    else {
        const [step1, step2] = await Promise.all([
            (0, spinal_service_ticket_1.getStepFromProcessByStepId)(contextNode, processNode, log.steps[0]),
            (0, spinal_service_ticket_1.getStepFromProcessByStepId)(contextNode, processNode, log.steps[1]),
        ]);
        const stepName1 = step1?.info.name.get();
        const stepName2 = step2?.info.name.get();
        const pre = log.event == spinal_service_ticket_1.LOGS_EVENTS.moveToNext ? true : false;
        texte = pre
            ? `Passed from ${stepName1} to ${stepName2}`
            : `Backward from ${stepName1} to ${stepName2}`;
    }
    return texte;
}
async function getTicketFiles(ticketNode) {
    const _files = [];
    const fileNode = (await ticketNode.getChildren('hasFiles'))?.[0];
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
async function getTicketNoteNodes(ticketNode) {
    const notes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getNotes(ticketNode);
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
async function getTicketNodeTree(ticketId, profileId, spinalAPIMiddleware) {
    const ticketNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, ticketId, profileId, spinal_service_ticket_1.SPINAL_TICKET_SERVICE_TICKET_TYPE);
    //Step
    const stepNode = await (0, spinal_service_ticket_1.getStepFromTicket)(ticketNode);
    if (!stepNode)
        return null;
    const processNode = await (0, spinal_service_ticket_1.getProcessFromStep)(stepNode);
    if (!processNode)
        return null;
    const contextNode = await (0, spinal_service_ticket_1.getContextFromProcess)(processNode);
    if (!contextNode)
        return null;
    return {
        contextNode,
        processNode,
        stepNode,
        ticketNode,
    };
}
exports.default = getTicketDetails;
//# sourceMappingURL=getTicketDetails.js.map