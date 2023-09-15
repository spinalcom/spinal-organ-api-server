import { Equipement } from '../routes/geographicContext/interfacesGeoContext'
import { SpinalNode } from 'spinal-model-graph';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';


async function getEquipmentListInfo(spinalAPIMiddleware :SpinalAPIMiddleware, roomId: number): Promise<Equipement[]> {
    let nodes: Equipement[] = [];
    const room: SpinalNode<any> = await spinalAPIMiddleware.load(roomId);

    //@ts-ignore
    SpinalGraphService._addNode(room);

    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographic room");
    }
    
    const childrens = await room.getChildren("hasBimObject");
    for (const child of childrens) {
        const info: Equipement = {
            dynamicId: child._server_id,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get(),
            bimFileId: child.info.bimFileId.get(),
            version: child.info.version.get(),
            externalId: child.info.externalId.get(),
            dbid: child.info.dbid.get(),
        };
        nodes.push(info);
    }
    return nodes;
}

export { getEquipmentListInfo };
export default getEquipmentListInfo;