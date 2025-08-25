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
const spinal_env_viewer_task_service_1 = require("spinal-env-viewer-task-service");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const moment = require("moment");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
const awaitSync_1 = require("../../../utilities/awaitSync");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/{id}/create_event:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: create event of ticket
     *     summary: create event of ticket
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *      - in: path
     *        name: ticketDynamicId
     *        description: use the dynamic ID of a ticket
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - startDate
     *               - endDate
     *               - description
     *               - repeat
     *               - repeatEnd
     *               - count
     *               - period
     *               - user
     *             properties:
     *               name:
     *                 type: string
     *               startDate:
     *                 type: string
     *                 default: DD MM YYYY HH:mm:ss
     *               endDate:
     *                 type: string
     *                 default: DD MM YYYY HH:mm:ss
     *               description:
     *                 type: string
     *               repeat:
     *                 type: boolean
     *               repeatEnd:
     *                 type: string
     *                 default: DD MM YYYY HH:mm:ss
     *               count:
     *                 type: number
     *               period:
     *                 type: string
     *                 default: day|week|month|year
     *               user:
     *                 type: object
     *                 required:
     *                   - userName
     *                   - email
     *                   - gsm
     *                 properties:
     *                   userName:
     *                     type: string
     *                   email:
     *                     type: string
     *                   gsm:
     *                     type: string
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Event'
     *       400:
     *         description: Bad request
     */
    app.post('/api/v1/ticket/:ticketDynamicId/create_event', async (req, res) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ticketNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.params.ticketDynamicId, 10), profileId, spinal_service_ticket_1.SPINAL_TICKET_SERVICE_TICKET_TYPE);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(ticketNode);
            const tree = await spinal_env_viewer_task_service_1.SpinalEventService.createOrgetDefaultTreeStructure();
            const contextNodeRef = tree.context;
            const categoryNodeRef = tree.category;
            const groupNodeRef = tree.group;
            if (contextNodeRef.type.get() !== 'SpinalEventGroupContext')
                return res
                    .status(400)
                    .send('this context is not a SpinalEventGroupContext');
            const eventInfo = {
                contextId: contextNodeRef.id?.get(),
                groupId: groupNodeRef.id?.get(),
                categoryId: categoryNodeRef.id?.get(),
                nodeId: ticketNode.info.id?.get(),
                startDate: moment(req.body.startDate, 'DD MM YYYY HH:mm:ss', true).toString(),
                description: req.body.description,
                endDate: moment(req.body.endDate, 'DD MM YYYY HH:mm:ss', true).toString(),
                periodicity: {
                    count: req.body.count,
                    period: spinal_env_viewer_task_service_1.Period[req.body.period],
                },
                repeat: req.body.repeat,
                name: req.body.name,
                creationDate: moment(new Date().toISOString()).toString(),
                repeatEnd: moment(req.body.repeatEnd, 'DD MM YYYY HH:mm:ss', true).toString(),
            };
            const userInfo = {
                username: req.body.user.userName,
                email: req.body.user.email,
                gsm: req.body.user.gsm,
            };
            let eventRefs = await spinal_env_viewer_task_service_1.SpinalEventService.createEvent(contextNodeRef.id.get(), groupNodeRef.id.get(), ticketNode.getId().get(), eventInfo, userInfo);
            eventRefs = Array.isArray(eventRefs) ? eventRefs : [eventRefs];
            await Promise.all(eventRefs.map((event) => (0, awaitSync_1.awaitSync)(spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(event.id.get()))));
            const data = eventRefs.map((event) => {
                const eventNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(event.id.get());
                return {
                    dynamicId: eventNode._server_id,
                    staticId: eventNode.info.id.get(),
                    name: eventNode.info.name.get(),
                    type: eventNode.info.type.get(),
                    groupID: eventNode.info.groupId?.get(),
                    categoryID: eventNode.info.categoryId?.get(),
                    nodeId: eventNode.info.nodeId?.get(),
                    startDate: eventNode.info.startDate?.get(),
                    endDate: eventNode.info.endDate?.get(),
                    creationDate: eventNode.info.creationDate?.get(),
                    user: {
                        username: eventNode.info.user?.username?.get(),
                        email: eventNode.info.user?.email?.get() || undefined,
                        gsm: eventNode.info.user?.gsm?.get() || undefined,
                    },
                };
            });
            if (data.length === 1)
                return res.json(data[0]);
            return res.json(data);
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=ticketCreateEvent.js.map