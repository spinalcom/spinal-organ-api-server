import { SpinalEventService } from 'spinal-env-viewer-task-service';
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import { EndPointNode } from '../routes/nodes/interfacesNodes'
import type { SpinalNode } from 'spinal-model-graph';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalBmsEndpoint, SpinalBmsDevice, SpinalBmsEndpointGroup } from "spinal-model-bmsnetwork";
const BMS_ENDPOINT_RELATIONS = ["hasEndPoint", SpinalBmsDevice.relationName, SpinalBmsEndpoint.relationName, SpinalBmsEndpointGroup.relationName];

async function getEventListInfo(
    spinalAPIMiddleware: SpinalAPIMiddleware,
    dynamicId: number
) {
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

export { getEventListInfo };
export default getEventListInfo;