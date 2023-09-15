/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import type { SpinalNode } from 'spinal-model-graph';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import { EndPointNode } from '../routes/nodes/interfacesNodes'
import { SpinalBmsEndpoint, SpinalBmsDevice, SpinalBmsEndpointGroup } from "spinal-model-bmsnetwork";
const BMS_ENDPOINT_RELATIONS = ["hasEndPoint", SpinalBmsDevice.relationName, SpinalBmsEndpoint.relationName, SpinalBmsEndpointGroup.relationName];

async function getEndpointsInfo(
  spinalAPIMiddleware: SpinalAPIMiddleware,
  dynamicId: number,
): Promise<EndPointNode [] | undefined> {
    let nodes: EndPointNode[] = [];
    spinalAPIMiddleware.getGraph();
      let node: SpinalNode = await spinalAPIMiddleware.load(dynamicId);
      // @ts-ignore
      SpinalGraphService._addNode(node);
      const endpoints = await SpinalGraphService.findNodesByType(node.getId().get(), BMS_ENDPOINT_RELATIONS, SpinalBmsEndpoint.nodeTypeName)
      //     var endpoints = await node.getChildren(["hasEndPoint", "hasBmsEndpoint"]);
      for (const endpoint of endpoints) {
        var element = await endpoint.element.load();
        var currentValue = element.currentValue.get();
        let info: EndPointNode = {
          dynamicId: endpoint._server_id,
          staticId: endpoint.getId().get(),
          name: endpoint.getName().get(),
          type: endpoint.getType().get(),
          currentValue: currentValue,
        };
        nodes.push(info);
    }
    return nodes;
}

export { getEndpointsInfo };
export default getEndpointsInfo;