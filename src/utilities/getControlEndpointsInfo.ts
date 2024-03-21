import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { spinalControlPointService } from 'spinal-env-viewer-plugin-control-endpoint-service'
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';


async function getControlEndpointsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware,profilId:string,dynamicId: number) {
    const room = await spinalAPIMiddleware.load(dynamicId,profilId);
    // @ts-ignore
    SpinalGraphService._addNode(room);
    const profils = await SpinalGraphService.getChildren(room.getId().get(), [spinalControlPointService.ROOM_TO_CONTROL_GROUP])
    const promises = profils.map(async (profile) => {
      const result = await SpinalGraphService.getChildren(profile.id.get(), [SpinalBmsEndpoint.relationName])
      const endpoints = await result.map(async (endpoint) => {
        const realNode = SpinalGraphService.getRealNode(endpoint.id.get())
        const element = await endpoint.element.load()
        const currentValue = element.currentValue.get();
        return {
          dynamicId: realNode._server_id,
          staticId: endpoint.id.get(),
          name: element.name.get(),
          type: element.type.get(),
          currentValue: currentValue
        };
      })
      return { dynamicId:dynamicId ,profileName: profile.name.get(), endpoints: await Promise.all(endpoints) }
    });
    
    return await Promise.all(promises);
  }


  export { getControlEndpointsInfo };
  export default getControlEndpointsInfo;