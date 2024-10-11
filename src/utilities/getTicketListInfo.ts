import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { ISpinalAPIMiddleware } from '../interfaces';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { LOGS_EVENTS } from 'spinal-service-ticket/dist/Constants';
import getFiles from './getFiles';
import { serviceTicketPersonalized } from 'spinal-service-ticket';

async function getTicketListInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number,
  includeAttachedItems = false
) {
  const nodes = [];
  await spinalAPIMiddleware.getGraph();
  const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
  //@ts-ignore
  SpinalGraphService._addNode(node);

  const ticketList = await node.getChildren('SpinalSystemServiceTicketHasTicket');
  for (const ticket of ticketList) {
    
    //@ts-ignore
    SpinalGraphService._addNode(ticket);
    //context && workflow
    const workflow = SpinalGraphService.getRealNode(ticket.getContextIds()[0]);
    //Step
    const _step = await ticket
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
      

    const info = {
      dynamicId: ticket._server_id,
      staticId: ticket.getId().get(),
      name: ticket.getName().get(),
      type: ticket.getType().get(),
      priority: ticket.info.priority == undefined ? '' : ticket.info.priority.get(),
      creationDate: ticket.info.creationDate.get(),
      userName:
        ticket.info.user?.name == undefined ? '' : ticket.info.user.name.get(),
      gmaoId: ticket.info.gmaoId == undefined ? '' : ticket.info.gmaoId.get(),
      gmaoDateCreation:
        ticket.info.gmaoDateCreation == undefined
          ? ''
          : ticket.info.gmaoDateCreation.get(),
      description:
        ticket.info.description == undefined
          ? ''
          : ticket.info.description.get(),
      declarer_id:
        ticket.info.declarer_id == undefined
          ? ''
          : ticket.info.declarer_id.get(),
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
    };

    if(includeAttachedItems){
      // Notes
      const notes = await serviceDocumentation.getNotes(ticket);
      const _notes = [];
      for (const note of notes) {
        const infoNote = {
          userName: note.element.username.get(),
          date: note.element.date.get(),
          type: note.element.type.get(),
          message: note.element.message.get(),
        };
        _notes.push(infoNote);
      }

       // Files
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
       //Logs
       const logs = await serviceTicketPersonalized.getLogs(
        ticket.getId().get()
      );

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
      info['annotation_list'] = _notes;
      info['file_list'] = _files;
      info['log_list'] = _logs;
    }

    nodes.push(info);
  }
  return nodes;
}


// Logs
async function formatEvent(log) {
  let texte = '';
  if (log.event == LOGS_EVENTS.creation) {
    texte = 'created';
  } else if (log.event == LOGS_EVENTS.archived) {
    texte = 'archived';
  } else if (log.event == LOGS_EVENTS.unarchive) {
    texte = 'unarchived';
  } else {
    const promises = log.steps.map((el) =>
      SpinalGraphService.getNodeAsync(el)
    );
    texte = await Promise.all(promises).then((result) => {
      //@ts-ignore
      const step1 = result[0].name.get();
      //@ts-ignore
      const step2 = result[1].name.get();
      const pre = log.event == LOGS_EVENTS.moveToNext ? true : false;
      return pre
        ? `Passed from ${step1} to ${step2}`
        : `Backward from ${step1} to ${step2}`;
    });
  }
  return texte;
}

export { getTicketListInfo };
export default getTicketListInfo;
