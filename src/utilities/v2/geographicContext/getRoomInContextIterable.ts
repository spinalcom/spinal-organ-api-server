/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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
} from 'spinal-env-viewer-context-geographic-service';

export async function* getRoomInContextIterable(
  geographicContext: SpinalContext,
  buildingNode: SpinalNode
) {
  // for each building, load the floors
  const floors = await buildingNode.getChildrenInContext(geographicContext, FLOOR_RELATION);
  for (const floorNode of floors) {
    const rooms = await floorNode.getChildrenInContext(geographicContext, ROOM_RELATION);
    for (const roomNode of rooms) {
      yield roomNode;
    }
  }
}

