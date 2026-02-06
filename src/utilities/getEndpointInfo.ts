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
import { ISpinalAPIMiddleware } from '../interfaces';
import { EndPointNode } from '../routes/nodes/interfacesNodes'
import { attributeService, serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalBmsEndpoint, SpinalBmsDevice, SpinalBmsEndpointGroup } from "spinal-model-bmsnetwork";
import { childrensNode } from './corseChildrenAndParentNode'
import { Relation } from '../routes/nodes/interfacesNodes'
const BMS_ENDPOINT_RELATIONS = ["hasEndPoint", SpinalBmsDevice.relationName, SpinalBmsEndpoint.relationName, SpinalBmsEndpointGroup.relationName];

async function getEndpointsInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profilId: string,
  dynamicId: number,
  includeDetails = false

): Promise<EndPointNode[] | undefined> {
  const nodes: EndPointNode[] = [];
  spinalAPIMiddleware.getGraph();
  const node: SpinalNode = await spinalAPIMiddleware.load(dynamicId, profilId);
  // @ts-ignore
  SpinalGraphService._addNode(node);
  const endpoints = await SpinalGraphService.findNodesByType(node.getId().get(), BMS_ENDPOINT_RELATIONS, SpinalBmsEndpoint.nodeTypeName)
  for (const endpoint of endpoints) {
    //const realNode = SpinalGraphService.getRealNode(endpoint.id.get())

    const element = await endpoint.element.load();
    const currentValue = element.currentValue.get();
    const unit = element.unit?.get();
    let saveTimeSeries = element.saveTimeSeries?.get();

    const childrens_list: Relation[] = childrensNode(endpoint);
    const hasTimeSeries = childrens_list.some(child => child.name === "hasTimeSeries");
    let controlValue = undefined;
    let timeSeriesMaxDay = undefined;

    if (includeDetails) {
      const controlValueAttribute = await attributeService.findAttributesByLabel(endpoint, "controlValue");
      const maxDayAttribute = await attributeService.findAttributesByLabel(endpoint, "timeSeries maxDay");
      if (controlValueAttribute) {
        controlValue = controlValueAttribute.value.get();
      }
      if (maxDayAttribute) {
        timeSeriesMaxDay = maxDayAttribute.value.get();
      }
      if (!saveTimeSeries) {
        saveTimeSeries = maxDayAttribute ? 1 : 0;
      }
    }

    const info: any = {
      dynamicId: endpoint._server_id,
      staticId: endpoint.getId().get(),
      name: endpoint.getName().get(),
      type: endpoint.getType().get(),
      currentValue: currentValue,
      unit: unit,
      saveTimeSeries: saveTimeSeries,
      hasTimeSeries: hasTimeSeries,
      timeseriesRetentionDays: timeSeriesMaxDay,
      controlValue: controlValue,
      lastUpdate: endpoint.info?.directModificationDate?.get()

    };
    nodes.push(info);
  }
  return nodes;
}

async function getEndpointsInfoFormat2(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profilId: string,
  dynamicId: number
): Promise<EndPointNode[] | undefined> {
  const nodes: EndPointNode[] = [];
  spinalAPIMiddleware.getGraph();
  const node: SpinalNode = await spinalAPIMiddleware.load(dynamicId, profilId);
  // @ts-ignore
  SpinalGraphService._addNode(node);
  const endpoints = await SpinalGraphService.findNodesByType(node.getId().get(), BMS_ENDPOINT_RELATIONS, SpinalBmsEndpoint.nodeTypeName)
  for (const endpoint of endpoints) {
    const element = await endpoint.element.load();
    const currentValue = element.currentValue?.get();
    const unit = element.unit?.get();
    const info: EndPointNode = {
      dynamicId: endpoint._server_id,
      staticId: endpoint.getId().get(),
      name: endpoint.getName().get(),
      type: endpoint.getType().get(),
      value: currentValue,
      unit: unit,
    };
    nodes.push(info);
  }
  return nodes;
}

export { getEndpointsInfo, getEndpointsInfoFormat2 };
export default getEndpointsInfo;