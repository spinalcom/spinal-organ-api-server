import { SpinalEventService } from 'spinal-env-viewer-task-service';
import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

async function getEventListInfo(
    spinalAPIMiddleware: ISpinalAPIMiddleware,
    profileId:string,
    dynamicId: number
) {
  await spinalAPIMiddleware.getGraph();
  const nodes = [];
  const node = await spinalAPIMiddleware.load(dynamicId,profileId);
  //@ts-ignore
  SpinalGraphService._addNode(node);
  const listEvents = await SpinalEventService.getEvents(node.getId().get());

  for (const child of listEvents) {
    // @ts-ignore
    const _child = SpinalGraphService.getRealNode(child.id.get());
    if (_child.getType().get() === 'SpinalEvent') {
      const info = {
        dynamicId: _child._server_id,
        staticId: _child.getId().get(),
        name: _child.getName().get(),
        type: _child.getType().get(),
        groupID: _child.info.groupId.get(),
        categoryID: child.categoryId.get(),
        nodeId: _child.info.nodeId.get(),
        repeat: _child.info.repeat.get(),
        description: _child.info.description.get(),
        startDate: _child.info.startDate.get(),
        endDate: _child.info.endDate.get(),
      };
      nodes.push(info);
    }
  }
  return nodes;
}

export { getEventListInfo };
export default getEventListInfo;