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

import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
import { SpinalNode } from 'spinal-model-graph';
import { viewInfo_func } from '../routes/geographicContext/viewInfo_func';
import {
  getBuildingStaticDetailsInfo,
  getEquipmentStaticDetailsInfo,
  getFloorStaticDetailsInfo,
  getRoomStaticDetailsInfo,
} from '../utilities/getStaticDetailsInfo';
import { getTicketListInfo } from '../utilities/getTicketListInfo';
import { getNodeInfo } from '../utilities/getNodeInfo';
import { getTicketDetails } from '../utilities/workflow/getTicketDetails';
import { getFloorInventory } from '../utilities/getInventory';

/**
 * A floor inventory to preload : the inventory is run on every floor id, then,
 * when staticDetails is true, static details are preloaded for every item found.
 *
 * @export
 * @interface IInventoryPreload
 */
export interface IInventoryPreload {
  /** Floor dynamic ids (server_id) to run the inventory on */
  ids: number[];
  /** Group context name (ignored when contextId is provided) */
  context: string;
  /** Group context dynamic id (server_id) ; takes precedence over context */
  contextId?: number;
  /** Category name (ignored when categoryId is provided) */
  category: string;
  /** Category dynamic id (server_id) ; takes precedence over category */
  categoryId?: number;
  /** Group names to filter on (empty = every group of the category) */
  groups: string[];
  /** Group dynamic ids (server_id) ; take precedence over groups */
  groupIds?: number[];
  /** When true, preload static details + ticket lists of every item found */
  staticDetails: boolean;
}

export interface IPreloadingScript {

  /**
   * @type {number[]} array of server_id to preload the viewInfo of
   * @memberof IPreloadingScript
   */
  runViewInfo: number[];
  /**
   * @type {number[]} array of server_id to preload static details + ticket list details
   * @memberof IPreloadingScript
   */
  runStaticDetails: number[];
  /**
   * @type {number[]} array of server_id to preload ticket list details
   * @memberof IPreloadingScript
   */
  runTicketLists: number[];
  /**
   * @type {IInventoryPreload[]} array of floor inventories to preload
   * @memberof IPreloadingScript
   */
  inventories: IInventoryPreload[];
}

const BUILDING_TYPE = 'geographicBuilding';
const FLOOR_TYPE = 'geographicFloor';
const ROOM_TYPE = 'geographicRoom';
const EQUIPMENT_TYPE = 'BIMObject';

const tableStaticDetailsTypes = new Map<
  string,
  (
    spinalAPIMiddleware: ISpinalAPIMiddleware,
    profileId: string,
    server_id: number
  ) => Promise<unknown>
>([
  [BUILDING_TYPE, getBuildingStaticDetailsInfo],
  [FLOOR_TYPE, getFloorStaticDetailsInfo],
  [ROOM_TYPE, getRoomStaticDetailsInfo],
  [EQUIPMENT_TYPE, getEquipmentStaticDetailsInfo],
]);

export async function preloadingScript(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  scriptOptions: IPreloadingScript
): Promise<void> {
  if (!scriptOptions) throw new Error('preload script empty');
  const startingTime = Date.now();
  const chunkSize = 100;
  console.log(
    `--- Preloading Script started at : ${new Date(
      startingTime
    ).toLocaleString()} ---`
  );
  let statusMsg = '';
  const intervalId = setInterval(() => {
    const elapsedTime = Date.now() - startingTime;
    console.log('[Preloading Script] %d ms -- %s', elapsedTime, statusMsg);
  }, 5000);

  if (
    Array.isArray(scriptOptions.runViewInfo) &&
    scriptOptions.runViewInfo.length > 0
  ) {
    console.log('START PRELOAD VIEW INFO');
    for (let i = 0; i < scriptOptions.runViewInfo.length; i += 1) {
      console.log(`Preloading viewInfo for server_id ${scriptOptions.runViewInfo[i]}`);
      statusMsg = `viewInfo : visited 0 nodes.`;
      const viewInfoObject = {
        dynamicId: scriptOptions.runViewInfo[i],
        floorRef: true,
        roomRef: true,
        equipements: true
      }
      await viewInfo_func(
        spinalAPIMiddleware,
        profileId,
        viewInfoObject,
        (totalVisited: number) => {
          statusMsg = `viewInfo : visited ${totalVisited} nodes.`;
        }
      );
    }
  }
  // if (scriptOptions.runViewInfo) {
  //   console.log('START PRELOAD VIEW INFO');
  //   statusMsg = `viewInfo : visited 0 nodes.`;
  //   await viewInfo_func(
  //     spinalAPIMiddleware,
  //     profileId,
  //     {},
  //     (totalVisited: number) => {
  //       statusMsg = `viewInfo : visited ${totalVisited} nodes.`;
  //     }
  //   );
  // }
  if (
    Array.isArray(scriptOptions.runStaticDetails) &&
    scriptOptions.runStaticDetails.length > 0
  ) {
    console.log('START PRELOAD STATIC DETAILS');
    for (let i = 0; i < scriptOptions.runStaticDetails.length; i += chunkSize) {
      const chunk = scriptOptions.runStaticDetails.slice(i, i + chunkSize);
      statusMsg = `staticDetails : processing chunk starting at index ${i} to ${i + chunkSize - 1
        } of ${scriptOptions.runStaticDetails.length}.`;
      await Promise.allSettled(
        chunk.map((server_id) =>
          processStaticDetails(spinalAPIMiddleware, profileId, server_id)
        )
      );
    }
  }

  if (
    Array.isArray(scriptOptions.runTicketLists) &&
    scriptOptions.runTicketLists.length > 0
  ) {
    console.log('START PRELOAD TICKET LIST DETAILS');
    for (let i = 0; i < scriptOptions.runTicketLists.length; i += chunkSize) {
      const chunk = scriptOptions.runTicketLists.slice(i, i + chunkSize);
      statusMsg = `ticketListDetails : processing chunk starting at index ${i} to ${i + chunkSize - 1
        } of ${scriptOptions.runTicketLists.length}.`;
      await processTicketList(spinalAPIMiddleware, profileId, chunk);
    }
  }

  if (
    Array.isArray(scriptOptions.inventories) &&
    scriptOptions.inventories.length > 0
  ) {
    console.log('START PRELOAD FLOOR INVENTORIES');
    for (let i = 0; i < scriptOptions.inventories.length; i += 1) {
      statusMsg = `inventories : processing entry ${i + 1} of ${scriptOptions.inventories.length}.`;
      await processInventory(
        spinalAPIMiddleware,
        profileId,
        scriptOptions.inventories[i],
        (msg: string) => {
          statusMsg = msg;
        }
      );
    }
  }
  const endingTime = Date.now();
  clearInterval(intervalId);
  console.log(
    `--- Preloading Script ended at : ${new Date(
      endingTime
    ).toLocaleString()} , total time ${endingTime - startingTime} ms ---`
  );
}
async function processInventory(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  entry: IInventoryPreload,
  setStatus: (msg: string) => void
): Promise<void> {
  if (!entry || !Array.isArray(entry.ids) || entry.ids.length === 0) return;

  const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
  const contexts = await graph.getChildren('hasContext');
  const groupContext = contexts.find((e) =>
    entry.contextId !== undefined
      ? e._server_id === entry.contextId
      : e.getName().get() === entry.context
  );
  if (!groupContext) {
    console.warn(
      `[warn] inventories : context not found (%s)`,
      entry.contextId ?? entry.context
    );
    return;
  }

  // Collect the dynamic ids of every item returned across all the floors of this
  // entry ; dedup them so an item shared by several floors is only detailed once.
  const itemIds = new Set<number>();
  for (let i = 0; i < entry.ids.length; i += 1) {
    const floorId = entry.ids[i];
    setStatus(
      `inventories : floor ${i + 1} of ${entry.ids.length} (server_id ${floorId}).`
    );
    // onlyDynamicId keeps the intermediate result light : we only need the item
    // ids here, the details are preloaded afterwards through processStaticDetails.
    const reqInfo = {
      context: entry.context,
      contextId: entry.contextId,
      category: entry.category,
      categoryId: entry.categoryId,
      groups: entry.groups,
      groupIds: entry.groupIds,
      onlyDynamicId: true,
    };
    try {
      const inventory = await getFloorInventory(
        spinalAPIMiddleware,
        profileId,
        groupContext,
        floorId,
        reqInfo
      );
      for (const group of inventory ?? []) {
        for (const item of group?.groupItems ?? []) {
          if (typeof item?.dynamicId === 'number') itemIds.add(item.dynamicId);
        }
      }
    } catch (err) {
      console.warn(
        `[warn] inventories : failed for floor server_id %d : %s`,
        floorId,
        err?.message ?? err
      );
    }
  }

  if (!entry.staticDetails || itemIds.size === 0) return;

  const ids = Array.from(itemIds);
  const chunkSize = 100;
  console.log(
    `START PRELOAD INVENTORY STATIC DETAILS (${ids.length} items)`
  );
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    setStatus(
      `inventories staticDetails : processing chunk starting at index ${i} to ${i + chunkSize - 1} of ${ids.length}.`
    );
    await Promise.allSettled(
      chunk.map((server_id) =>
        processStaticDetails(spinalAPIMiddleware, profileId, server_id)
      )
    );
  }
}

async function processTicketList(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  server_ids: number[]
): Promise<void> {
  const promises = server_ids.map(async (server_id) => {
    const node: SpinalNode = await spinalAPIMiddleware.load(
      server_id,
      profileId
    );
    const ticketList = await node.getChildren(
      'SpinalSystemServiceTicketHasTicket'
    );
    return ticketList.map((ticket) => ticket?._server_id);
  });
  const ticketIdsArrays = await Promise.all(promises);
  const ticketIds = ticketIdsArrays.flat();
  const uniqueTicketIds = Array.from(new Set(ticketIds));
  const proms = uniqueTicketIds.map(async (server_id) => {
    if (server_id)
      await getTicketDetails(spinalAPIMiddleware, profileId, server_id, true);
  });
  await Promise.allSettled(proms);
}

async function processStaticDetails(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  server_id: number
): Promise<void> {
  const node: SpinalNode = await spinalAPIMiddleware.load(server_id, profileId);
  if (!(node instanceof SpinalNode)) {
    console.warn(`[warn] staticDetails, unidentified server id %d`, server_id);
  }
  const nodeType = node.info.type?.get();
  const funcStaticDetails =
    tableStaticDetailsTypes.get(nodeType) ?? getNodeInfo;
  await Promise.allSettled([
    funcStaticDetails(spinalAPIMiddleware, profileId, server_id),
    getTicketListInfo(spinalAPIMiddleware, profileId, server_id),
  ]);
}
