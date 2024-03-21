import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { ISpinalAPIMiddleware } from '../interfaces';

async function getTicketListInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number
) {
  const nodes = [];
  await spinalAPIMiddleware.getGraph();
  const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
  //@ts-ignore
  SpinalGraphService._addNode(node);

  const ticketList = await node.getChildren('SpinalSystemServiceTicketHasTicket');
  for (const ticket of ticketList) {
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
    nodes.push(info);
  }
  return nodes;
}

export { getTicketListInfo };
export default getTicketListInfo;
