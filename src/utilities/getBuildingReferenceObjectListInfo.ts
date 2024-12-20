import { SpinalNode } from 'spinal-model-graph';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { ISpinalAPIMiddleware } from '../interfaces';


async function getBuildingReferenceObjectsListInfo(spinalAPIMiddleware : ISpinalAPIMiddleware, profileId:string) {
    const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
    const contexts = await graph.getChildren("hasContext");
    const geographicContexts = contexts.filter(el => el.getType().get() === "geographicContext");
    const buildings = await geographicContexts[0].getChildren("hasGeographicBuilding");
    const building = buildings[0];
    const referenceObjects = await building.getChildren("hasReferenceObject");
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
        bimFileId: bimFileId,
      };
      _objects.push(infoReferencesObject);
    }
  
    return {
      dynamicId: building._server_id,
      staticId: building.getId().get(),
      name: building.getName().get(),
      type: building.getType().get(),
      infoReferencesObjects: _objects
    };
  }
  
  export { getBuildingReferenceObjectsListInfo };
  export default getBuildingReferenceObjectsListInfo;