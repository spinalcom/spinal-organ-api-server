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

import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Room } from '../interfacesGeoContext';
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { LOGS_EVENTS } from 'spinal-service-ticket/dist/Constants';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
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
      const profileId = getProfileId(req);
      const equipement = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      //@ts-ignore
      SpinalGraphService._addNode(equipement);

      if (equipement.getType().get() === 'BIMObject') {
        const ticketList = await serviceTicketPersonalized.getTicketsFromNode(
          equipement.getId().get()
        );

        for (let index = 0; index < ticketList.length; index++) {
          const realNodeTicket = SpinalGraphService.getRealNode(
            ticketList[index].id
          );
          //context && workflow
          const workflow = SpinalGraphService.getRealNode(
            realNodeTicket.getContextIds()[0]
          );

          //Step
          const _step = await realNodeTicket
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

          const _process = await _step
            .getParents('SpinalSystemServiceTicketHasStep')
            .then((processes) => {
              for (const process of processes) {
                if (process.getType().get() === 'SpinalServiceTicketProcess') {
                  return process;
                }
              }
            });

          const [notesResult, filesResult, logsResult] =
            await Promise.allSettled([
              fetchTicketNotes(realNodeTicket),
              getFilesFromNode(realNodeTicket),
              getTicketLogs(realNodeTicket),
            ]);

          const info = {
            dynamicId: realNodeTicket._server_id,
            staticId: realNodeTicket.getId().get(),
            name: realNodeTicket.getName().get(),
            type: realNodeTicket.getType().get(),
            priority: realNodeTicket.info.priority?.get(),
            creationDate: realNodeTicket.info.creationDate?.get() ?? '',
            userName: realNodeTicket.info.user?.name?.get() ?? '',
            gmaoId: realNodeTicket.info.gmaoId?.get() ?? '',
            gmaoDateCreation: realNodeTicket.info.gmaoDateCreation?.get() ?? '',
            description: realNodeTicket.info.description?.get() ?? '',
            declarer_id: realNodeTicket.info.declarer_id?.get() ?? '',
            process:
              _process === undefined
                ? ''
                : {
                    dynamicId: _process._server_id,
                    staticId: _process.getId().get(),
                    name: _process.getName().get(),
                    type: _process.getType().get(),
                  },
            step:
              _step === undefined
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
            annotation_list:
              notesResult.status === 'fulfilled' ? notesResult.value : [],
            file_list:
              filesResult.status === 'fulfilled' ? filesResult.value : [],
            log_list: logsResult.status === 'fulfilled' ? logsResult.value : [],
          };
          nodes.push(info);
        }
      } else {
        res.status(400).send('node is not of type BIMObject');
      }
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(400).send('ko');
    }
    res.json(nodes);
  });
};

async function fetchTicketNotes(ticket: SpinalNode) {
  const notes = await serviceDocumentation.getNotes(ticket);
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

async function getTicketLogs(ticket: SpinalNode) {
  const _logs = [];
  const logs = await serviceTicketPersonalized.getLogs(ticket.getId().get());
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

async function getFilesFromNode(ticket: SpinalNode) {
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

function formatEvent(log): string {
  if (log.event == LOGS_EVENTS.creation) {
    return 'created';
  } else if (log.event == LOGS_EVENTS.archived) {
    return 'archived';
  } else if (log.event == LOGS_EVENTS.unarchive) {
    return 'unarchived';
  } else {
    if (log.steps.length < 2) return 'unknown event';
    const step1 =
      SpinalGraphService.getRealNode(log.steps[0])?.info.name.get() ||
      'unknown step';
    const step2 =
      SpinalGraphService.getRealNode(log.steps[1])?.info.name.get() ||
      'unknown step';
    const pre = log.event == LOGS_EVENTS.moveToNext ? true : false;
    return pre
      ? `Passed from ${step1} to ${step2}`
      : `Backward from ${step1} to ${step2}`;
  }
}
