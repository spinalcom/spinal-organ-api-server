import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

async function getTicketEntityInfo(
  spinalAPIMiddleware: SpinalAPIMiddleware,
  ticketId: number
) {
  var _ticket = await spinalAPIMiddleware.load(ticketId);
  //@ts-ignore
  SpinalGraphService._addNode(_ticket);

  var elementSelected = await spinalAPIMiddleware.loadPtr(
    _ticket.info.elementSelected
  );

  var info = {
    dynamicId: elementSelected._server_id,
    staticId: elementSelected.getId().get(),
    name: elementSelected.getName().get(),
    type: elementSelected.getType().get(),
  };
  return info;
}

export { getTicketEntityInfo };
export default getTicketEntityInfo;
