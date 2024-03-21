import { ISpinalAPIMiddleware } from '../interfaces';
import {
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

async function getTicketEntityInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId:string,
  ticketId: number
) {
  const _ticket = await spinalAPIMiddleware.load(ticketId,profileId);
  //@ts-ignore
  SpinalGraphService._addNode(_ticket);

  const elementSelected = await spinalAPIMiddleware.loadPtr(
    _ticket.info.elementSelected
  );

  const info = {
    dynamicId: elementSelected._server_id,
    staticId: elementSelected.getId().get(),
    name: elementSelected.getName().get(),
    type: elementSelected.getType().get(),
  };
  return info;
}

export { getTicketEntityInfo };
export default getTicketEntityInfo;
