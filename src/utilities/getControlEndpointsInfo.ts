import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { spinalControlPointService } from 'spinal-env-viewer-plugin-control-endpoint-service'
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';


async function getControlEndpointsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware,profilId:string,dynamicId: number) {
    let room = await spinalAPIMiddleware.load(dynamicId,profilId);
    // @ts-ignore
    SpinalGraphService._addNode(room);
    var profils = await SpinalGraphService.getChildren(room.getId().get(), [spinalControlPointService.ROOM_TO_CONTROL_GROUP])
    var promises = profils.map(async (profile) => {
      var result = await SpinalGraphService.getChildren(profile.id.get(), [SpinalBmsEndpoint.relationName])
      var endpoints = await result.map(async (endpoint) => {
        var realNode = SpinalGraphService.getRealNode(endpoint.id.get())
        var element = await endpoint.element.load()
        var currentValue = element.currentValue.get();
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