import { ISpinalAPIMiddleware } from '../interfaces';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

async function getRoomDetailsInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number
) {
    let area = 0;
    const _bimObjects = [];
    const room: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
    const t: { bimFileId: string, bimFileName: string, dbids: number[] }[] = [];
    let bimFileId: string;

    //@ts-ignore
    SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographic room");
    }
    
    const bimObjects = await room.getChildren("hasBimObject");
    for (const bimObject of bimObjects) {
        bimFileId = bimObject.info.bimFileId.get();

        const infoBimObject = {
            staticId: bimObject.getId().get(),
            name: bimObject.getName().get(),
            type: bimObject.getType().get(),
            version: bimObject.info.version.get(),
            externalId: bimObject.info.externalId.get(),
            dbid: bimObject.info.dbid.get(),
        };
        _bimObjects.push(infoBimObject);
    }

    const categories = await room.getChildren(NODE_TO_CATEGORY_RELATION);
    for (const child of categories) {
        if (child.getName().get() === "Spatial") {
            const attributs = await child.element.load();
            for (const attribut of attributs.get()) {
                if (attribut.label === "area") {
                    area = attribut.value;
                }
            }
        }
    }

    return {
        area: area,
        bimFileId: bimFileId,
        _bimObjects: _bimObjects
    };
}

export { getRoomDetailsInfo };
export default getRoomDetailsInfo;
