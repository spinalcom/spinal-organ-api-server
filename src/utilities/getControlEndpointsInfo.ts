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

import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { spinalControlPointService } from 'spinal-env-viewer-plugin-control-endpoint-service';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { childrensNode } from './corseChildrenAndParentNode';
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';
import type { ISpinalAPIMiddleware } from '../interfaces';
import type { Relation } from '../routes/interface/Relation';

async function getControlEndpointsInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profilId: string,
  dynamicId: number,
  includeDetails = false
) {
  const node = await spinalAPIMiddleware.load(dynamicId, profilId);
  // @ts-ignore
  SpinalGraphService._addNode(node);
  const profils = await SpinalGraphService.getChildren(node.getId().get(), [
    spinalControlPointService.ROOM_TO_CONTROL_GROUP,
  ]);
  const promises = profils.map(async (profile) => {
    const result = await SpinalGraphService.getChildren(profile.id.get(), [
      SpinalBmsEndpoint.relationName,
    ]);
    const endpoints = await result.map(async (endpoint) => {
      const realNode = SpinalGraphService.getRealNode(endpoint.id.get());
      const childrens_list: Relation[] = childrensNode(realNode);
      const hasTimeSeries = childrens_list.some(
        (child) => child.name === 'hasTimeSeries'
      );
      const element = await endpoint.element.load();
      const currentValue = element.currentValue?.get();
      const unit = element.unit?.get();
      const saveTimeSeries = element.saveTimeSeries?.get();
      let controlValue = undefined;
      let timeSeriesMaxDay = undefined;
      if (includeDetails) {
        const controlValueAttribute =
          await attributeService.findAttributesByLabel(
            realNode,
            'controlValue'
          );
        const maxDayAttribute = await attributeService.findAttributesByLabel(
          realNode,
          'timeSeries maxDay'
        );
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
        lastUpdate: realNode.info?.directModificationDate?.get(),
      };
    });
    return {
      dynamicId: dynamicId,
      profileName: profile.name.get(),
      endpoints: await Promise.all(endpoints),
    };
  });

  return await Promise.all(promises);
}

export { getControlEndpointsInfo };
export default getControlEndpointsInfo;
