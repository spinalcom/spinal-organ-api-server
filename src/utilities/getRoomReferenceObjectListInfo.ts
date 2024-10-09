import { SpinalNode } from 'spinal-model-graph';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { ISpinalAPIMiddleware } from '../interfaces';


async function getRoomReferenceObjectsListInfo(spinalAPIMiddleware : ISpinalAPIMiddleware, profileId:string, dynamicId: number) {
    const room: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
    //@ts-ignore
    SpinalGraphService._addNode(room);
  
    if (room.getType().get() !== "geographicRoom") {
      throw new Error("node is not of type geographic room");
    }
  
    const referenceObjects = await room.getChildren("hasReferenceObject.ROOM");
    const _objects = [];
    let bimFileId: string;
  
    for (const referenceObject of referenceObjects) {
      bimFileId = referenceObject.info.bimFileId.get();
      const infoReferencesObject = {
        dynamicId: referenceObject._server_id,
        staticId: referenceObject.getId().get(),
        name: referenceObject.getName().get(),
        type: referenceObject.getType().get(),
        version: referenceObject.info.version?.get(),
        externalId: referenceObject.info.externalId.get(),
        dbid: referenceObject.info.dbid.get(),
        bimFileId: referenceObject.info.bimFileId.get(),
      };
      _objects.push(infoReferencesObject);
    }
  
    return {
      dynamicId: room._server_id,
      staticId: room.getId().get(),
      name: room.getName().get(),
      type: room.getType().get(),
      bimFileId,
      infoReferencesObjects: _objects
    };
  }
  
  export { getRoomReferenceObjectsListInfo };
  export default getRoomReferenceObjectsListInfo;