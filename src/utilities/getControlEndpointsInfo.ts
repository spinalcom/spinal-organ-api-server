import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { spinalControlPointService } from 'spinal-env-viewer-plugin-control-endpoint-service'
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';
import { childrensNode } from './corseChildrenAndParentNode'
import { Relation } from '../routes/nodes/interfacesNodes'
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';


async function getControlEndpointsInfo
  (
    spinalAPIMiddleware: ISpinalAPIMiddleware,
    profilId: string,
    dynamicId: number,
    includeDetails = false
  ) {
  const node = await spinalAPIMiddleware.load(dynamicId, profilId);
  // @ts-ignore
  SpinalGraphService._addNode(node);
  const profils = await SpinalGraphService.getChildren(node.getId().get(), [spinalControlPointService.ROOM_TO_CONTROL_GROUP])
  const promises = profils.map(async (profile) => {
    const result = await SpinalGraphService.getChildren(profile.id.get(), [SpinalBmsEndpoint.relationName])
    const endpoints = await result.map(async (endpoint) => {
      const realNode = SpinalGraphService.getRealNode(endpoint.id.get())
      const childrens_list: Relation[] = childrensNode(realNode);
      const hasTimeSeries = childrens_list.some(child => child.name === "hasTimeSeries");
      const element = await endpoint.element.load()
      const currentValue = element.currentValue.get();
      const unit = element.unit?.get();
      const saveTimeSeries = element.saveTimeSeries?.get();
      let controlValue = undefined;
      let timeSeriesMaxDay = undefined;
      if (includeDetails) {
        const controlValueAttribute = await attributeService.findAttributesByLabel(realNode, "controlValue");
        const maxDayAttribute = await attributeService.findAttributesByLabel(realNode, "timeSeries maxDay");
        if (controlValueAttribute) {
          controlValue = controlValueAttribute.value.get();
        }
        if (maxDayAttribute) {
          timeSeriesMaxDay = maxDayAttribute.value.get();
        }
      }
      return {
        dynamicId: realNode._server_id,
        staticId: endpoint.id.get(),
        name: element.name.get(),
        type: element.type.get(),
        currentValue: currentValue,
        unit: unit,
        saveTimeSeries: saveTimeSeries,
        hasTimeSeries: hasTimeSeries,
        controlValue: controlValue,
        timeseriesRetentionDays: timeSeriesMaxDay,
        lastUpdate: realNode.info.directModificationDate.get()

      };
    })
    return { dynamicId: dynamicId, profileName: profile.name.get(), endpoints: await Promise.all(endpoints) }
  });

  return await Promise.all(promises);
}


export { getControlEndpointsInfo };
export default getControlEndpointsInfo;