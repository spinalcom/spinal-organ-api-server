/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import {
  FLOOR_RELATION,
  ROOM_RELATION,
  REFERENCE_RELATION,
  REFERENCE_ROOM_RELATION,
  EQUIPMENT_RELATION,
} from 'spinal-env-viewer-context-geographic-service';

export async function* getEquipmentInContextIterable(
  geographicContext: SpinalContext,
  buildingNode: SpinalNode,
  bimObjectType: 'bimobject' | 'referenceRoom' | 'referenceFloor'
) {
  const floors = await buildingNode.getChildrenInContext(
    geographicContext,
    FLOOR_RELATION
  );
  for (const floorNode of floors) {
    if (bimObjectType === 'referenceFloor') {
      const referenceFloors = await floorNode.getChildren(REFERENCE_RELATION);
      for (const referenceFloorNode of referenceFloors) {
        yield { node: referenceFloorNode, parentId: floorNode._server_id! };
      }
    } else {
      const rooms = await floorNode.getChildrenInContext(
        geographicContext,
        ROOM_RELATION
      );
      if (bimObjectType === 'referenceRoom') {
        const referenceRooms = await Promise.all(
          rooms.map((roomNode) => {
            return roomNode
              .getChildren(REFERENCE_ROOM_RELATION)
              .then((nodes) => {
                return { nodes, roomNode };
              });
          })
        );
        for (const { nodes, roomNode } of referenceRooms) {
          for (const referenceRoomNode of nodes) {
            yield { node: referenceRoomNode, parentId: roomNode._server_id! };
          }
        }
      } else {
        for (const roomNode of rooms) {
          const equipments = await roomNode.getChildrenInContext(
            geographicContext,
            EQUIPMENT_RELATION
          );
          for (const equipmentNode of equipments) {
            yield { node: equipmentNode, parentId: roomNode._server_id! };
          }
        }
      }
    }
  }
}
