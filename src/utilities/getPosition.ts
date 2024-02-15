import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service';

export async function getEquipmentPosition(
    spinalAPIMiddleware: ISpinalAPIMiddleware,
    profileId: string,
    dynamicId: number
) {
    const equipment: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
  //@ts-ignore
  SpinalGraphService._addNode(equipment);

  if (equipment.getType().get() !== "BIMObject") {
    throw new Error("node is not of type BimObject");
  }

  const room = (await equipment.getParents("hasBimObject"))
    .find(parent => parent.getType().get() === "geographicRoom");

  const floor = (await room.getParents("hasGeographicRoom"))
    .find(parent => parent.getType().get() === "geographicFloor");

  const building = (await floor.getParents("hasGeographicFloor"))
    .find(parent => parent.getType().get() === "geographicBuilding");

  const context = (await building.getParents("hasGeographicBuilding"))
    .find(parent => parent.getType().get() === "geographicContext");

  return {
    dynamicId: equipment._server_id,
    staticId: equipment.getId().get(),
    name: equipment.getName().get(),
    type: equipment.getType().get(),
    info: {
      context: {
        dynamicId: context._server_id,
        staticId: context.getId().get(),
        name: context.getName().get(),
        type: context.getType().get()
      },
      building: {
        dynamicId: building._server_id,
        staticId: building.getId().get(),
        name: building.getName().get(),
        type: building.getType().get()
      },
      floor: {
        dynamicId: floor._server_id,
        staticId: floor.getId().get(),
        name: floor.getName().get(),
        type: floor.getType().get()
      },
      room: {
        dynamicId: room._server_id,
        staticId: room.getId().get(),
        name: room.getName().get(),
        type: room.getType().get()
      }
    }
  };
}

export async function getRoomPosition(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId:string, dynamicId: number){
    const room: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
    //@ts-ignore
    SpinalGraphService._addNode(room);
  
    if (room.getType().get() !== "geographicRoom") {
      throw new Error("node is not of type geographicRoom");
    }
  
  
    const floor = (await room.getParents("hasGeographicRoom"))
      .find(parent => parent.getType().get() === "geographicFloor");
  
    const building = (await floor.getParents("hasGeographicFloor"))
      .find(parent => parent.getType().get() === "geographicBuilding");

    const context = (await building.getParents("hasGeographicBuilding"))
      .find(parent => parent.getType().get() === "geographicContext");
  
  
    return {
      dynamicId: room._server_id,
      staticId: room.getId().get(),
      name: room.getName().get(),
      type: room.getType().get(),
      info: {
        context: {
          dynamicId: context._server_id,
          staticId: context.getId().get(),
          name: context.getName().get(),
          type: context.getType().get()
        },
        building: {
          dynamicId: building._server_id,
          staticId: building.getId().get(),
          name: building.getName().get(),
          type: building.getType().get()
        },
        floor: {
          dynamicId: floor._server_id,
          staticId: floor.getId().get(),
          name: floor.getName().get(),
          type: floor.getType().get()
        }
      }
    };
  }

