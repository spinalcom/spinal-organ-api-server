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

import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { ISpinalAPIMiddleware } from '../interfaces';
import { getTicketDetails } from '../utilities/workflow/getTicketDetails';

async function getTicketListInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId: number,
  includeAttachedItems = false
) {
  const nodes = [];
  await spinalAPIMiddleware.getGraph();
  const node: SpinalNode = await spinalAPIMiddleware.load(dynamicId, profileId);
  //@ts-ignore
  SpinalGraphService._addNode(node);
  const ticketList = await node.getChildren(
    'SpinalSystemServiceTicketHasTicket'
  );
  for (const ticket of ticketList) {
    //@ts-ignore
    SpinalGraphService._addNode(ticket);
    const info = await getTicketDetails(
      spinalAPIMiddleware,
      profileId,
      ticket._server_id,
      includeAttachedItems
    );
    nodes.push(info);
  }
  return nodes;
}

export { getTicketListInfo };
export default getTicketListInfo;
