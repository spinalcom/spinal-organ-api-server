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
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import spinalAPIMiddleware from '../../app/spinalAPIMiddleware';
import * as express from 'express';
// import { Room } from '../interfacesGeoContext'
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import { spinalControlPointService } from 'spinal-env-viewer-plugin-control-endpoint-service';
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/analytics/room/{id}/status/{option}:
   *   get:
   *     security:
   *       - OauthSecurity:
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
  app.get(
    '/api/v1/analytics/room/:id/status/:option',
    async (req, res, next) => {
      try {
        await spinalAPIMiddleware.getGraph();
        var room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
        //@ts-ignore
        SpinalGraphService._addNode(room);
        var ticketList = [];
        var ticketListSatandard = [];

        if (room.getType().get() === 'geographicRoom') {
          ///////////////////////////////////////////////////////////////////////////////////
          ////////////////////////////////// Room //////////////////////////////////////////
          ////////////////////////////////////////////////////////////////////////////////////////

          var ticketListRoom =
            await serviceTicketPersonalized.getTicketsFromNode(
              room.getId().get()
            );
          for (let index = 0; index < ticketListRoom.length; index++) {
            var realNodeTicket = SpinalGraphService.getRealNode(
              ticketListRoom[index].id
            );

            //Step
            var _step = await realNodeTicket
              .getParents('SpinalSystemServiceTicketHasTicket')
              .then((steps) => {
                for (const step of steps) {
                  if (
                    step.getType().get() === 'SpinalSystemServiceTicketTypeStep'
                  ) {
                    return step;
                  }
                }
              });

            //Log Ticket Room
            var _logs = [];
            var logs = await serviceTicketPersonalized.getLogs(
              realNodeTicket.getId().get()
            );
            for (const log of logs) {
              let lastActionDate = log.creationDate;
              _logs.push(lastActionDate);
            }

            //Context
            var contextRealNode = SpinalGraphService.getRealNode(
              realNodeTicket.getContextIds()[0]
            );

            var infoTicket = {
              dynamicId: realNodeTicket._server_id,
              staticId: realNodeTicket.getId().get(),
              name: realNodeTicket.getName().get(),
              type: realNodeTicket.getType().get(),
              priority: realNodeTicket.info.priority.get(),
              description:
                realNodeTicket.info.description === undefined
                  ? ''
                  : realNodeTicket.info.description.get(),
              step: _step.getName().get(),
              creationDate: realNodeTicket.info.creationDate.get(),
              lastActionDate: _logs[_logs.length - 1],
              workflowName: contextRealNode.getName().get(),
            };
            var infoTicketStandard = {
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

          var equipementList = [];
          var equipements = await room.getChildren('hasBimObject');
          for (const equipement of equipements) {
            var _ticketListEquipemnt = [];
            var _ticketListEquipemntStandard = [];
            //@ts-ignore
            SpinalGraphService._addNode(equipement);
            var ticketListEquipemnt =
              await serviceTicketPersonalized.getTicketsFromNode(
                equipement.getId().get()
              );

            for (const ticketEquipemnt of ticketListEquipemnt) {
              var realNodeEquipementTicket = SpinalGraphService.getRealNode(
                ticketEquipemnt.id
              );

              //Step
              var _stepTicketEquipement = await realNodeEquipementTicket
                .getParents('SpinalSystemServiceTicketHasTicket')
                .then((steps) => {
                  for (const step of steps) {
                    if (
                      step.getType().get() ===
                      'SpinalSystemServiceTicketTypeStep'
                    ) {
                      return step;
                    }
                  }
                });

              //Log Ticket Room
              var _logsEquipement;
              var _logsTicketEquipement = [];
              var logs = await serviceTicketPersonalized.getLogs(
                realNodeEquipementTicket.getId().get()
              );
              for (const log of logs) {
                let lastActionDate = log.creationDate;
                _logsTicketEquipement.push(lastActionDate);
              }

              //Context
              var contextRealNodeEquipementTicket =
                SpinalGraphService.getRealNode(
                  realNodeEquipementTicket.getContextIds()[0]
                );

              var infoTicketEquipement = {
                dynamicId: realNodeEquipementTicket._server_id,
                staticId: realNodeEquipementTicket.getId().get(),
                name: realNodeEquipementTicket.getName().get(),
                type: realNodeEquipementTicket.getName().get(),
                priority: realNodeEquipementTicket.info.priority.get(),
                description:
                  realNodeEquipementTicket.info.description === undefined
                    ? ''
                    : realNodeEquipementTicket.info.description.get(),
                step: _stepTicketEquipement.getName().get(),
                creationDate: realNodeEquipementTicket.info.creationDate.get(),
                lastActionDate:
                  _logsTicketEquipement[_logsTicketEquipement.length - 1],
                workflowName: contextRealNodeEquipementTicket.getName().get(),
              };
              var infoTicketEquipementStandard = {
                dynamicId: realNodeEquipementTicket._server_id,
                name: realNodeEquipementTicket.getName().get(),
                step: _stepTicketEquipement.getName().get(),
                workflowName: contextRealNodeEquipementTicket.getName().get(),
              };
              _ticketListEquipemnt.push(infoTicketEquipement);
              _ticketListEquipemntStandard.push(infoTicketEquipementStandard);
            }
            var infoEquipement;
            if (req.params.option === 'detail') {
              infoEquipement = {
                dynamicId: equipement._server_id,
                staticId: equipement.getId().get(),
                name: equipement.getName().get(),
                type: equipement.getType().get(),
                equipementTicketList: _ticketListEquipemnt,
              };
            } else if (req.params.option === 'standard') {
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

          var profils = await SpinalGraphService.getChildren(
            room.getId().get(),
            [spinalControlPointService.ROOM_TO_CONTROL_GROUP]
          );
          var promises = profils.map(async (profile) => {
            var result = await SpinalGraphService.getChildren(
              profile.id.get(),
              [SpinalBmsEndpoint.relationName]
            );
            var endpoints = await result.map(async (endpoint) => {
              var realNode = SpinalGraphService.getRealNode(endpoint.id.get());
              var element = await endpoint.element.load();
              var currentValue = element.currentValue.get();
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

          var allNodes = await Promise.all(promises);
          var _alarmList = [];
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
          var info;
          var Occasionally = 0;
          var Normal = 0;
          var Urgent = 0;
          var allTicket = [];

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
            if (
              objectEquipement.priority === 0 ||
              objectEquipement.priority === '0'
            )
              Occasionally++;
            else if (
              objectEquipement.priority === 1 ||
              objectEquipement.priority === '1'
            )
              Normal++;
            else if (
              objectEquipement.priority === 2 ||
              objectEquipement.priority === '2'
            )
              Urgent++;
          }

          ////////////////////////////////// Mark //////////////////////////////////////////
          var mark = 20;
          var sum = 0;
          for (let index = 0; index < allTicket.length; index++) {
            sum = sum + index * allTicket[index].priority;
          }
          mark = mark - (sum + _alarmList.length);
        } else {
          res.status(400).send('node is not of type geographic room');
        }

        if (req.params.option === 'detail') {
          info = {
            dynamicId: room._server_id,
            staticId: room.getId().get(),
            name: room.getName().get(),
            type: room.getType().get(),
            mark: mark,
            roomTicketList: ticketList,
            equipementList: equipementList,
            alarmList: _alarmList,
          };
        } else if (req.params.option === 'summary') {
          info = {
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
          };
        } else if (req.params.option === 'standard') {
          info = {
            dynamicId: room._server_id,
            staticId: room.getId().get(),
            name: room.getName().get(),
            type: room.getType().get(),
            mark: mark,
            roomTicketList: ticketListSatandard,
            equipementList: equipementList,
            alarmList: _alarmList,
          };
        }
      } catch (error) {
        console.log(error);
        res.status(400).send('ko');
      }
      res.json(info);
    }
  );
};
