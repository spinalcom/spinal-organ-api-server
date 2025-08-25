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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const awaitSync_1 = require("../../../utilities/awaitSync");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getSpatialContext_1 = require("../../../utilities/getSpatialContext");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/create_ticket:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: add a Ticket
     *     summary: add a Ticket
     *     tags:
     *       - Workflow & ticket
     *     requestBody:
     *       description: For the two parameters *workflow* and *process* you can use either the dynamicId or the name. To associate the ticket with an element, please fill in the dynamicId parameter
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
     *             properties:
     *               workflow:
     *                 description: The workflow's dynamicId or name
     *                 oneOf:
     *                   - type: string
     *                   - type: integer
     *               process:
     *                 description: The process's dynamicId or name
     *                 oneOf:
     *                   - type: string
     *                   - type: integer
     *               nodeDynamicId:
     *                 type: integer
     *                 description: The node's target dynamicId
     *               nodeStaticId:
     *                 type: string
     *                 deprecated: true
     *                 description: (deprecated) The node's target staticId
     *               name:
     *                 type: string
     *                 description: The ticket's name
     *               priority:
     *                 type: integer
     *                 enum: [0, 1, 2]
     *                 description: "Priority levels — 0 (OCCASIONALLY), 1 (NORMAL), 2 (URGENT)"
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
     *       201:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Ticket'
     *       400:
     *         description: Add not Successfully
     */
    app.post('/api/v1/ticket/create_ticket', validateTicketCreationData, createTicket);
    // validate the body
    function validateTicketCreationData(req, res, next) {
        const { workflow, process, nodeDynamicId, nodeStaticId, name, priority, description, } = req.body;
        const missing = [];
        if (!workflow)
            missing.push('workflow');
        if (!process)
            missing.push('process');
        if (!nodeDynamicId && !nodeStaticId) {
            missing.push('nodeDynamicId');
        }
        else if (nodeDynamicId && isNaN(+nodeDynamicId)) {
            missing.push('nodeDynamicId (must be a number)');
        }
        else if (typeof nodeStaticId !== 'string') {
            missing.push("nodeStaticId (must be a string and it's deprecated)");
        }
        if (priority === undefined)
            missing.push('priority');
        if (!name || typeof name !== 'string')
            missing.push('name (must be a string)');
        if (!description || typeof description !== 'string')
            missing.push('description (must be a string)');
        if (missing.length > 0) {
            return res
                .status(400)
                .send('Missing required attributes: ' + missing.join(', '));
        }
        // validate and normalize priority to allowed values 0,1,2
        const priorityValue = Number(priority);
        if (!Number.isInteger(priorityValue) ||
            ![0, 1, 2].includes(priorityValue)) {
            return res
                .status(400)
                .send('Invalid priority: must be 0 (OCCASIONALLY), 1 (NORMAL), or 2 (URGENT)');
        }
        next();
    }
    async function createTicket(req, res) {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ticketInfo = {
                name: req.body.name,
                priority: Number(req.body.priority),
                description: req.body.description,
                declarer_id: req.body.declarer_id,
            };
            await spinalAPIMiddleware.getGraph();
            const workflowNode = await getWorkflowNode(req.body.workflow, spinalAPIMiddleware, profileId);
            if (!workflowNode)
                return res
                    .status(404)
                    .send('Could not find the workflow : ' + req.body.workflow);
            const processNode = await getProcessNode(workflowNode, req.body.process, spinalAPIMiddleware, profileId);
            if (!processNode)
                return res
                    .status(404)
                    .send('Could not find the process : ' + req.body.process);
            if (!processNode.belongsToContext(workflowNode)) {
                return res
                    .status(400)
                    .send('The process exists, but is not part of the workflow given : ' +
                    req.body.workflow);
            }
            const targetNode = await fetchSpinalNodeTarget(spinalAPIMiddleware, profileId, req.body.nodeDynamicId, req.body.nodeStaticId);
            if (!targetNode)
                return res.status(400).send('invalid nodeDynamicId or nodeStaticId');
            const ticketCreatedNode = await (0, spinal_service_ticket_1.addTicket)(ticketInfo, processNode, workflowNode, targetNode);
            await purgeEmptyChildren(targetNode);
            const ticketList = await (0, spinal_service_ticket_1.getTicketsFromNode)(targetNode);
            const linkedTicket = ticketList.find((element) => element.info.id.get() === ticketCreatedNode.info.id.get());
            if (!linkedTicket) {
                return res
                    .status(400)
                    .send(`Ticket created, but could not be found to be linked to node : ${targetNode
                    .getName()
                    .get()}, the images might not be uploaded correctly too`);
            }
            await (0, awaitSync_1.awaitSync)(ticketCreatedNode);
            const infoFromTicket = await (0, spinal_service_ticket_1.getTicketInfo)(ticketCreatedNode);
            const info = {
                dynamicId: ticketCreatedNode._server_id,
                staticId: ticketCreatedNode.info.id.get(),
                name: infoFromTicket.name || ticketCreatedNode.info.name.get(),
                type: ticketCreatedNode.info.type.get(),
                elementSelcted: targetNode._server_id,
                priority: +infoFromTicket.priority,
                description: infoFromTicket.description,
                declarer_id: infoFromTicket.declarer_id,
                creationDate: +infoFromTicket.creationDate,
            };
            const errorImages = [];
            if (req.body.images && req.body.images.length > 0) {
                for (const image of req.body.images) {
                    // @ts-ignore
                    const user = {
                        username: infoFromTicket.declarer_id || 'user',
                        userId: 0,
                    };
                    try {
                        const imageBufferData = processImageBase64(image.value);
                        await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addFileAsNote(ticketCreatedNode, { name: image.name, buffer: imageBufferData }, user);
                    }
                    catch (error) {
                        errorImages.push(image.name);
                    }
                }
            }
            if (errorImages.length > 0) {
                info.errorImages = 'error uploading images : ' + errorImages.join(', ');
            }
            return res.send(201).json(info);
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send({ ko: error });
        }
    }
};
/**
 * Helper function to process base64 image string, stripping data URL prefix if present.
 */
function processImageBase64(base64Image) {
    if (base64Image.startsWith('data:image/')) {
        const indexOfComma = base64Image.indexOf(',');
        if (indexOfComma !== -1) {
            base64Image = base64Image.slice(indexOfComma + 1);
        }
    }
    return Buffer.from(base64Image, 'base64');
}
async function purgeEmptyChildren(targetNode) {
    // load the SpinalRelation children list
    const lst = await targetNode.children?.PtrLst?.SpinalSystemServiceTicketHasTicket?.children?.load();
    if (lst) {
        const toRemove = [];
        for (const x of lst) {
            if (x.info == undefined) {
                toRemove.push(x);
            }
        }
        for (const emptyModel of toRemove) {
            lst.remove(emptyModel);
        }
    }
}
async function getWorkflowNode(workflowIdOrName, spinalAPIMiddleware, profileId) {
    try {
        const workflowId = +workflowIdOrName;
        if (isNaN(workflowId)) {
            return (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, workflowId, profileId, spinal_service_ticket_1.TICKET_CONTEXT_TYPE);
        }
        // try to find the workflow by name
        const allContexts = await (0, spinal_service_ticket_1.getTicketContexts)();
        for (const context of allContexts) {
            if (context.info.name.get() === workflowIdOrName) {
                return context;
            }
        }
    }
    catch (error) {
        return undefined;
    }
}
async function getProcessNode(contextWorkflowNode, processIdOrName, spinalAPIMiddleware, profileId) {
    try {
        const processId = +processIdOrName;
        if (!isNaN(processId)) {
            return (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, processId, profileId, spinal_service_ticket_1.PROCESS_TYPE);
        }
        // try to find the process by name
        const ticketProcesses = await (0, spinal_service_ticket_1.getAllTicketProcess)(contextWorkflowNode);
        for (const ticketProcess of ticketProcesses) {
            if (ticketProcess.info.name.get() === processIdOrName) {
                return ticketProcess;
            }
        }
    }
    catch (error) {
        return undefined;
    }
}
async function fetchSpinalNodeTarget(spinalAPIMiddleware, profileId, dynamicId, staticId) {
    if (dynamicId) {
        try {
            const node = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, +dynamicId, profileId);
            return node;
        }
        catch (error) {
            return undefined;
        }
    }
    if (staticId && typeof staticId === 'string') {
        const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(staticId);
        if (node !== undefined)
            return node;
        const context = await (0, getSpatialContext_1.getSpatialContext)(spinalAPIMiddleware, profileId);
        if (context === undefined)
            return undefined;
        for await (const node of context.visitChildrenInContext(context)) {
            if (node.info.id.get() === staticId) {
                return node;
            }
        }
    }
}
//# sourceMappingURL=createTicket.js.map