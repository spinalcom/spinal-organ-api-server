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
// import { Room } from '../interfacesGeoContext'
const spinal_service_ticket_1 = require("spinal-service-ticket");
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analytics/room/{id}/status/{option}:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Return status of room
     *     summary: Get Return status of room
     *     tags:
     *       - Analytics
     *     parameters:
     *      - in: path
     *        name: id
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: option
     *        description: choose an option among the three options, summary will give -note-the sum of tickets (part and equipment) by level of criticality-the sum of the alarms standard will give -Note -the list of tickets (part and equipment) with their name, note, -their workflow and their status -the list of alarms by equipment in the room detail will give  -Note -detailed list of tickets (part and equipment) -detailed list of alarms by equipment in the room
     *        required: true
     *        schema:
     *          type: string
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
    app.get('/api/v1/analytics/room/:id/status/:option', async (req, res, next) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            const ticketList = [];
            const ticketListSatandard = [];
            if (!(room.getType().get() === 'geographicRoom')) {
                return res.status(400).send('node is not of type geographic room');
            }
            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////// Room //////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////
            const ticketListRoom = await spinal_service_ticket_1.serviceTicketPersonalized.getTicketsFromNode(room.getId().get());
            for (let index = 0; index < ticketListRoom.length; index++) {
                const realNodeTicket = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(ticketListRoom[index].id);
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
                //Log Ticket Room
                const _logs = [];
                const logs = await spinal_service_ticket_1.serviceTicketPersonalized.getLogs(realNodeTicket.getId().get());
                for (const log of logs) {
                    const lastActionDate = log.creationDate;
                    _logs.push(lastActionDate);
                }
                //Context
                const contextRealNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(realNodeTicket.getContextIds()[0]);
                const infoTicket = {
                    dynamicId: realNodeTicket._server_id,
                    staticId: realNodeTicket.getId().get(),
                    name: realNodeTicket.getName().get(),
                    type: realNodeTicket.getType().get(),
                    priority: realNodeTicket.info.priority.get(),
                    description: realNodeTicket.info.description === undefined
                        ? ''
                        : realNodeTicket.info.description.get(),
                    step: _step.getName().get(),
                    creationDate: realNodeTicket.info.creationDate.get(),
                    lastActionDate: _logs[_logs.length - 1],
                    workflowName: contextRealNode.getName().get(),
                };
                const infoTicketStandard = {
                    dynamicId: realNodeTicket._server_id,
                    name: realNodeTicket.getName().get(),
                    step: _step.getName().get(),
                    workflowName: contextRealNode.getName().get(),
                };
                ticketList.push(infoTicket);
                ticketListSatandard.push(infoTicketStandard);
            }
            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////// Equipement //////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////
            // Equipement List
            const equipementList = [];
            const equipements = await room.getChildren('hasBimObject');
            let _ticketListEquipemnt = [];
            let _ticketListEquipemntStandard = [];
            for (const equipement of equipements) {
                _ticketListEquipemnt = [];
                _ticketListEquipemntStandard = [];
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(equipement);
                const ticketListEquipemnt = await spinal_service_ticket_1.serviceTicketPersonalized.getTicketsFromNode(equipement.getId().get());
                for (const ticketEquipemnt of ticketListEquipemnt) {
                    const realNodeEquipementTicket = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(ticketEquipemnt.id);
                    //Step
                    const _stepTicketEquipement = await realNodeEquipementTicket
                        .getParents('SpinalSystemServiceTicketHasTicket')
                        .then((steps) => {
                        for (const step of steps) {
                            if (step.getType().get() === 'SpinalSystemServiceTicketTypeStep') {
                                return step;
                            }
                        }
                    });
                    //Log Ticket Room
                    const _logsTicketEquipement = [];
                    const logs = await spinal_service_ticket_1.serviceTicketPersonalized.getLogs(realNodeEquipementTicket.getId().get());
                    for (const log of logs) {
                        const lastActionDate = log.creationDate;
                        _logsTicketEquipement.push(lastActionDate);
                    }
                    //Context
                    const contextRealNodeEquipementTicket = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(realNodeEquipementTicket.getContextIds()[0]);
                    const infoTicketEquipement = {
                        dynamicId: realNodeEquipementTicket._server_id,
                        staticId: realNodeEquipementTicket.getId().get(),
                        name: realNodeEquipementTicket.getName().get(),
                        type: realNodeEquipementTicket.getName().get(),
                        priority: realNodeEquipementTicket.info.priority.get(),
                        description: realNodeEquipementTicket.info.description === undefined
                            ? ''
                            : realNodeEquipementTicket.info.description.get(),
                        step: _stepTicketEquipement.getName().get(),
                        creationDate: realNodeEquipementTicket.info.creationDate.get(),
                        lastActionDate: _logsTicketEquipement[_logsTicketEquipement.length - 1],
                        workflowName: contextRealNodeEquipementTicket.getName().get(),
                    };
                    const infoTicketEquipementStandard = {
                        dynamicId: realNodeEquipementTicket._server_id,
                        name: realNodeEquipementTicket.getName().get(),
                        step: _stepTicketEquipement.getName().get(),
                        workflowName: contextRealNodeEquipementTicket.getName().get(),
                    };
                    _ticketListEquipemnt.push(infoTicketEquipement);
                    _ticketListEquipemntStandard.push(infoTicketEquipementStandard);
                }
                let infoEquipement;
                if (req.params.option === 'detail') {
                    infoEquipement = {
                        dynamicId: equipement._server_id,
                        staticId: equipement.getId().get(),
                        name: equipement.getName().get(),
                        type: equipement.getType().get(),
                        equipementTicketList: _ticketListEquipemnt,
                    };
                }
                else if (req.params.option === 'standard') {
                    infoEquipement = {
                        dynamicId: equipement._server_id,
                        staticId: equipement.getId().get(),
                        name: equipement.getName().get(),
                        type: equipement.getType().get(),
                        equipementTicketList: _ticketListEquipemntStandard,
                    };
                }
                if (_ticketListEquipemnt.length !== 0) {
                    equipementList.push(infoEquipement);
                }
            }
            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////// Alarm //////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////
            const profils = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(room.getId().get(), [spinal_env_viewer_plugin_control_endpoint_service_1.spinalControlPointService.ROOM_TO_CONTROL_GROUP]);
            const promises = profils.map(async (profile) => {
                const result = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(profile.id.get(), [spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
                const endpoints = await result.map(async (endpoint) => {
                    const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpoint.id.get());
                    const element = await endpoint.element.load();
                    const currentValue = element.currentValue.get();
                    return {
                        dynamicId: realNode._server_id,
                        staticId: endpoint.id.get(),
                        name: element.name.get(),
                        type: element.type.get(),
                        currentValue: currentValue,
                    };
                });
                return {
                    profileName: profile.name.get(),
                    endpoints: await Promise.all(endpoints),
                };
            });
            const allNodes = await Promise.all(promises);
            const _alarmList = [];
            for (const node of allNodes) {
                for (const endpoint of node.endpoints) {
                    if (endpoint.type === 'Alarm') {
                        _alarmList.push(endpoint);
                    }
                }
            }
            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////// Calcul //////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////
            let Occasionally = 0;
            let Normal = 0;
            let Urgent = 0;
            const allTicket = [];
            for (const objectroom of ticketList) {
                allTicket.push(objectroom);
                if (objectroom.priority === 0 || objectroom.priority === '0')
                    Occasionally++;
                else if (objectroom.priority === 1 || objectroom.priority === '1')
                    Normal++;
                else if (objectroom.priority === 2 || objectroom.priority === '2')
                    Urgent++;
            }
            for (const objectEquipement of _ticketListEquipemnt) {
                allTicket.push(objectEquipement);
                if (objectEquipement.priority === 0 ||
                    objectEquipement.priority === '0')
                    Occasionally++;
                else if (objectEquipement.priority === 1 ||
                    objectEquipement.priority === '1')
                    Normal++;
                else if (objectEquipement.priority === 2 ||
                    objectEquipement.priority === '2')
                    Urgent++;
            }
            ////////////////////////////////// Mark //////////////////////////////////////////
            let mark = 20;
            let sum = 0;
            for (let index = 0; index < allTicket.length; index++) {
                sum = sum + index * allTicket[index].priority;
            }
            mark = mark - (sum + _alarmList.length);
            if (req.params.option === 'detail') {
                return res.json({
                    dynamicId: room._server_id,
                    staticId: room.getId().get(),
                    name: room.getName().get(),
                    type: room.getType().get(),
                    mark: mark,
                    roomTicketList: ticketList,
                    equipementList: equipementList,
                    alarmList: _alarmList,
                });
            }
            else if (req.params.option === 'summary') {
                return res.json({
                    dynamicId: room._server_id,
                    staticId: room.getId().get(),
                    name: room.getName().get(),
                    type: room.getType().get(),
                    mark: mark,
                    amountTicket: {
                        'Priority 0': Occasionally,
                        'Priority 1': Normal,
                        'Priority 2': Urgent,
                    },
                    amountAlarm: _alarmList.length,
                });
            }
            else if (req.params.option === 'standard') {
                return res.json({
                    dynamicId: room._server_id,
                    staticId: room.getId().get(),
                    name: room.getName().get(),
                    type: room.getType().get(),
                    mark: mark,
                    roomTicketList: ticketListSatandard,
                    equipementList: equipementList,
                    alarmList: _alarmList,
                });
            }
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            res.status(400).send('ko');
        }
    });
};
//# sourceMappingURL=roomResume.js.map