import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
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
    
    // tous les objets de la pièce
    const bimObjects = await room.getChildren("hasBimObject");
    let inventories = [];

    for (const bimObject of bimObjects) {
        const equipmentGroups = await bimObject.getParents("groupHasBIMObject");

        for (const equipmentGroup of equipmentGroups) {
            const equipmentCategories = await equipmentGroup.getParents("hasGroup");

            for (const equipmentCategory of equipmentCategories) {
                let categoryInfo = inventories.find(e => e.staticId === equipmentCategory.getId().get());
                if (!categoryInfo) {
                    categoryInfo = { ...getDetail(equipmentCategory), inventory: [] };
                    inventories.push(categoryInfo);
                }

                let groupInfo = categoryInfo.inventory.find(g => g.staticId === equipmentGroup.getId().get());
                if (!groupInfo) {
                    groupInfo = { ...getDetail(equipmentGroup), equipments: [] };
                    categoryInfo.inventory.push(groupInfo);
                }

                groupInfo.equipments.push(getDetail(bimObject));
            }
        }
    }

    const roomDetail = getDetail(room);
    return {
        dynamicId: roomDetail.dynamicId,
        staticId: roomDetail.staticId,
        type: roomDetail.type,
        name: roomDetail.name,
        inventories: inventories
    };
}

function getDetail(obj : SpinalNode<any>){
    const infoObject = {
        staticId: obj.getId().get(),
        dynamicId: obj._server_id,
        name: obj.getName().get(),
        type: obj.getType().get(),

    };
    return infoObject;
}
export { getRoomInventory };
export default getRoomInventory;
