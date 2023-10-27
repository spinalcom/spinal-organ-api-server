import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { Event } from '../routes/calendar/interfacesContextsEvents'

async function getEventInfo(
  spinalAPIMiddleware: SpinalAPIMiddleware,
  dynamicId: number
) {
  var event: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId);
  //@ts-ignore
  SpinalGraphService._addNode(event);
  if (!(event.getType().get() === 'SpinalEvent')) {
    throw new Error('node is not of type SpinalEvent');
  }

  var info: Event = {
    dynamicId: event._server_id,
    staticId: event.getId().get(),
    name: event.getName().get(),
    type: event.getType().get(),
    groupId: event.info.groupId.get(),
    categoryId: event.info.categoryId.get(),
    nodeId: event.info.nodeId.get(),
    repeat: event.info.repeat.get(),
    description: event.info.description.get(),
    startDate: event.info.startDate.get(),
    endDate: event.info.endDate.get(),
  };
  return info;
}

export { getEventInfo };
export default getEventInfo;
