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

import type { ISpinalAPIMiddleware } from '../../interfaces/ISpinalAPIMiddleware';
import { attributeService, serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import {
  getStepFromProcessByStepId,
  getTicketLogs,
  getTicketInfo,
  getNodeFromTicket,
  getStepFromTicket,
  getProcessFromStep,
  getContextFromProcess,
  LOGS_EVENTS,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
} from 'spinal-service-ticket';
import { SpinalNode, SpinalContext } from 'spinal-model-graph';
import { SpinalLogTicketInterface } from 'spinal-models-ticket';
import { loadAndValidateNode } from '../loadAndValidateNode';

function getPriorityNumber(priority: string): number { // compatibility with old tickets
  switch (priority.toLowerCase()) {
    case 'occasionally':
      return 0;
    case 'normal':
      return 1;
    case 'urgent':
      return 2;
    default:
      return Number(priority) ?? 1;
  }
}
async function getTicketDetails(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  ticketId: number,
  includeAttachedItems = true
) {
  await spinalAPIMiddleware.getGraph();
  const { contextNode, processNode, stepNode, ticketNode } =
    await getTicketNodeTree(ticketId, profileId, spinalAPIMiddleware);
  if (!contextNode || !processNode || !stepNode || !ticketNode) {
    throw new Error('Failed to retrieve ticket node tree');
  }
  const proms: any = [getNodeFromTicket(ticketNode), getTicketInfo(ticketNode)];
  if (includeAttachedItems) {
    proms.push(
      getTicketNoteNodes(ticketNode),
      getTicketFiles(ticketNode),
      getTicketLogDetails(ticketNode, processNode, contextNode)
    );
  }
  const elementSelected = await proms[0];
  const ticketNodeInfo = await proms[1];

  const allAttributes = await attributeService.getAllAttributes(ticketNode);
  // list of attributes to include even if they are empty : description, declarer_id, username, gmaoId, gmaoDateCreation
  // const allAttributesObject = allAttributes.map(attr => ({ [attr.label.get()]: attr.value.get() }));

  const info = {
    dynamicId: ticketNode._server_id,
    staticId: ticketNode.info.id.get(),
    name: ticketNode.info.name.get(),
    type: ticketNode.info.type.get(),
    priority: getPriorityNumber(ticketNodeInfo.priority),
    creationDate: ticketNode.info.creationDate?.get() || Number(ticketNodeInfo.creationDate) || NaN,
    elementSelected:
      elementSelected === undefined
        ? ''
        : {
          dynamicId: elementSelected._server_id,
          staticId: elementSelected.info.id.get(),
          name: elementSelected.info.name.get(),
          type: elementSelected.info.type.get(),
        },
    process:
      processNode === undefined
        ? ''
        : {
          dynamicId: processNode._server_id,
          staticId: processNode.info.id.get(),
          name: processNode.info.name.get(),
          type: processNode.info.type.get(),
        },
    step:
      stepNode === undefined
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
  }

  for (const attr of allAttributes) {
    const label = attr.label.get();
    if (!info[label]) {
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

async function getTicketLogDetails(
  ticketNode: SpinalNode,
  processNode: SpinalNode,
  contextNode: SpinalNode
) {
  const logs = await getTicketLogs(ticketNode);
  const logRes = await Promise.all(
    logs.map(async (log) => ({
      userName: log.user?.name,
      date: log.creationDate,
      event: await formatEvent(log, processNode, contextNode),
      ticketStaticId: log.ticketId,
    }))
  );
  return logRes;
}

async function formatEvent(
  log: SpinalLogTicketInterface,
  processNode: SpinalNode,
  contextNode: SpinalContext
) {
  let texte = '';
  if (log.event == LOGS_EVENTS.creation) {
    texte = 'created';
  } else if (log.event == LOGS_EVENTS.archived) {
    texte = 'archived';
  } else if (log.event == LOGS_EVENTS.unarchive) {
    texte = 'unarchived';
  } else {
    const [step1, step2] = await Promise.all([
      getStepFromProcessByStepId(contextNode, processNode, log.steps[0]),
      getStepFromProcessByStepId(contextNode, processNode, log.steps[1]),
    ]);

    const stepName1 = step1?.info.name.get();
    const stepName2 = step2?.info.name.get();
    const pre = log.event == LOGS_EVENTS.moveToNext ? true : false;
    texte = pre
      ? `Passed from ${stepName1} to ${stepName2}`
      : `Backward from ${stepName1} to ${stepName2}`;
  }
  return texte;
}

async function getTicketFiles(ticketNode: SpinalNode) {
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

async function getTicketNoteNodes(ticketNode: SpinalNode) {
  const notes = await serviceDocumentation.getNotes(ticketNode);
  const _notes = [];
  for (const note of notes) {
    const infoNote = {
      userName:
        note.element.username === undefined ? '' : note.element.username.get(),
      date: note.element.date.get(),
      type: note.element.type.get(),
      message: note.element.message.get(),
    };
    _notes.push(infoNote);
  }
  return _notes;
}

async function getTicketNodeTree(
  ticketId: number,
  profileId: string,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  const ticketNode: SpinalNode = await loadAndValidateNode(
    spinalAPIMiddleware,
    ticketId,
    profileId,
    SPINAL_TICKET_SERVICE_TICKET_TYPE
  );
  //Step
  const stepNode = await getStepFromTicket(ticketNode);
  if (!stepNode) return null;
  const processNode = await getProcessFromStep(stepNode);
  if (!processNode) return null;
  const contextNode = await getContextFromProcess(processNode);
  if (!contextNode) return null;

  return {
    contextNode,
    processNode,
    stepNode,
    ticketNode,
  };
}

export { getTicketDetails };
export default getTicketDetails;
