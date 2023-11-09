import { ISpinalAPIMiddleware } from '../interfaces';
import {
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

async function getTicketEntityInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId:string,
  ticketId: number
) {
  var _ticket = await spinalAPIMiddleware.load(ticketId,profileId);
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
