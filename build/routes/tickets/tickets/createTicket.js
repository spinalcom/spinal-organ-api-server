"use strict";
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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getNode_1 = require("../../../utilities/getNode");
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
     *       description: For the two parameters *workflow* and *process* you can browse it either by putting the dynamicId or the name and to associate the ticket with an element, please fill in the dynamicId or StaticId parameter
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - workflow
     *               - process
     *               - nodeDynamicId
     *               - nodeStaticId
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
     *               nodeStaticId:
     *                 type: string
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
    app.post('/api/v1/ticket/create_ticket', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ticketInfo = {
                name: req.body.name,
                priority: req.body.priority,
                description: req.body.description,
                declarer_id: req.body.declarer_id,
            };
            await spinalAPIMiddleware.getGraph();
            const workflowNode = await getWorkflowNode(req.body.workflow, spinalAPIMiddleware, profileId);
            if (!workflowNode)
                return res
                    .status(400)
                    .send('Could not find the workflow : ' + req.body.workflow);
            const processNode = await getProcessNode(workflowNode, req.body.process, spinalAPIMiddleware, profileId);
            if (!processNode)
                return res
                    .status(400)
                    .send('Could not find the process : ' + req.body.process);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(workflowNode);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(processNode);
            if (!processNode.belongsToContext(workflowNode)) {
                return res
                    .status(400)
                    .send('The process exists, but is not part of the workflow given : ' +
                    req.body.workflow);
            }
            const stepId = await spinal_service_ticket_1.serviceTicketPersonalized.getFirstStep(processNode.getId().get(), workflowNode.getId().get());
            const stepNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(stepId);
            const ticketNode = new spinal_env_viewer_graph_service_1.SpinalNode(ticketInfo.name, 'SpinalSystemServiceTicketTypeTicket');
            ticketNode.info.add_attr({
                processId: processNode.getId().get(),
                stepId: stepId,
                contextId: workflowNode.getId().get(),
                priority: ticketInfo.priority,
                description: ticketInfo.description,
                declarer_id: ticketInfo.declarer_id,
                creationDate: (new Date()).toISOString(),
            });
            spinal_core_connectorjs_type_1.FileSystem._objects_to_send.set(ticketNode.model_id, ticketNode);
            //@ts-ignore
            spinal_core_connectorjs_type_1.FileSystem._send_data_to_hub_func();
            await (0, awaitSync_1.awaitSync)(ticketNode);
            console.log('server_id AFTER sending data', ticketNode._server_id);
            const info = {
                dynamicId: ticketNode._server_id,
                staticId: ticketNode.getId().get(),
                name: ticketNode.getName().get(),
                type: ticketNode.getType().get(),
                elementSelcted: req.body.nodeDynamicId,
                priority: ticketNode.info?.priority?.get(),
                description: ticketNode.info?.description?.get(),
                declarer_id: ticketNode.info?.declarer_id?.get(),
                creationDate: ticketNode.info?.creationDate?.get(),
            };
            const node = await (0, getNode_1.default)(spinalAPIMiddleware, req.body.nodeDynamicId, req.body.nodeStaticId, profileId);
            if (!node)
                return res.status(400).send('invalid nodeDynamicId or nodeStaticId');
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            // Here we call a function that does the rest of the work asynchronously
            doTicketCreationAsyncWork(ticketNode, node, stepNode, processNode, workflowNode, req.body.images);
            return res.json(info);
            //await stepNode.addChildInContext(model, 'SpinalSystemServiceTicketHasTicket','PtrLst', workflowNode);
            // const ticketCreated = await serviceTicketPersonalized.addTicket(
            //   ticketInfo,
            //   processNode.getId().get(),
            //   workflowNode.getId().get(),
            //   node.getId().get()
            // );
            // // clear modèles vides : 
            // const lst = await node.children.PtrLst.SpinalSystemServiceTicketHasTicket.children.load()
            // const toRemove = []
            // for(const x of lst){
            //   if(x.info == undefined){
            //     toRemove.push(x)
            //   }
            // }
            // for(const emptyModel of toRemove){
            //   lst.remove(emptyModel)
            // }
            // // fin clear modèles vides
            // const ticketList = await serviceTicketPersonalized.getTicketsFromNode(
            //   node.getId().get()
            // );
            // const linkedTicket = ticketList.find(
            //   (element) => element.id === ticketCreated
            // );
            // if (!linkedTicket) {
            //   return res
            //     .status(400)
            //     .send(
            //       `Ticket created, but could not be found to be linked to node : ${node
            //         .getName()
            //         .get()}`
            //     );
            // }
            // const realNodeTicket = SpinalGraphService.getRealNode(
            //   linkedTicket.id
            // );
            // await awaitSync(realNodeTicket);
            // const info = {
            //   dynamicId: realNodeTicket._server_id,
            //   staticId: realNodeTicket.getId().get(),
            //   name: realNodeTicket.getName().get(),
            //   type: realNodeTicket.getType().get(),
            //   elementSelcted: req.body.nodeDynamicId,
            //   priority: realNodeTicket.info?.priority.get(),
            //   description: realNodeTicket.info?.description.get(),
            //   declarer_id: realNodeTicket.info?.declarer_id.get(),
            //   creationDate: realNodeTicket.info?.creationDate.get(),
            // };
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send({ ko: error });
        }
    });
};
async function doTicketCreationAsyncWork(ticketNode, anchorNode, stepNode, processNode, workflowNode, images) {
    try {
        const addedTicket = await spinal_service_ticket_1.serviceTicketPersonalized.addTicketFromNode(ticketNode, stepNode, workflowNode, anchorNode);
        if (images && images.length > 0) {
            for (const image of images) {
                console.log('Adding image : ', image.name);
                // @ts-ignore
                const user = {
                    username: ticketNode.info?.declarer_id?.get() || 'user',
                    userId: 0,
                };
                const base64Image = image.value;
                // check if data base64
                if (/^data:image\/\w+;base64,/.test(base64Image) === true) {
                    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
                    const imageBufferData = Buffer.from(imageData, 'base64');
                    await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addFileAsNote(ticketNode, { name: image.name, buffer: imageBufferData }, user);
                }
            }
        }
    }
    catch (error) {
        console.error('Error in ticket creation work : ', ticketNode.getName().get(), error);
        ticketNode.removeFromGraph();
    }
}
async function getWorkflowNode(workflowIdOrName, spinalAPIMiddleware, profileId) {
    try {
        const allContexts = spinal_service_ticket_1.serviceTicketPersonalized.getContexts();
        for (const context of allContexts) {
            if (context.name === workflowIdOrName) {
                const result = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(context.id);
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(result);
                return result;
            }
        }
        // at this point we couldn't find the workflow by name
        // we will try to find it by id
        const node = await spinalAPIMiddleware.load(parseInt(workflowIdOrName, 10), profileId);
        return node;
    }
    catch (error) {
        return undefined;
    }
}
async function getProcessNode(workflow, processIdOrName, spinalAPIMiddleware, profileId) {
    try {
        const allProcess = await spinal_service_ticket_1.serviceTicketPersonalized.getAllProcess(workflow.getId().get());
        for (const process of allProcess) {
            if (process.name.get() === processIdOrName) {
                const result = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(process.id.get());
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(result);
                return result;
            }
        }
        // at this point we couldn't find the process by name
        // we will try to find it by id
        const node = await spinalAPIMiddleware.load(parseInt(processIdOrName, 10), profileId);
        return node;
    }
    catch (error) {
        return undefined;
    }
}
//# sourceMappingURL=createTicket.js.map