import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

async function getRoomInventory(
  spinalAPIMiddleware: SpinalAPIMiddleware,
  dynamicId: number
) {

    const room: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId);
    //@ts-ignore
    SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographic room");
    }
    
    const bimObjects = await room.getChildren("hasBimObject");
    for (const bimObject of bimObjects) {
        

        const infoBimObject = {
            staticId: bimObject.getId().get(),
            name: bimObject.getName().get(),
            type: bimObject.getType().get(),
            version: bimObject.info.version.get(),
            externalId: bimObject.info.externalId.get(),
            dbid: bimObject.info.dbid.get(),
        };
        
    }

    

    return {
        test : "test"
    };
}

export { getRoomInventory };
export default getRoomInventory;
