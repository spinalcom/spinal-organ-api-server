/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
import { NetworkService, InputDataEndpoint, InputDataEndpointDataType, InputDataEndpointType , SpinalBmsEndpoint} from "spinal-model-bmsnetwork"
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

import { Val, Bool, Str } from 'spinal-core-connectorjs_type';


import  spinalServiceTimeSeries  from './spinalTimeSeries'
import {
  ControlEndpointDataType,
} from 'spinal-env-viewer-plugin-control-endpoint-service';

/**
    * @param  {SpinalNode} node
    * @param  {any} valueToPush
    * @param  {any} dataType
    * @param  {any} type
    * @returns Promise
    */
export async function updateControlEndpointWithAnalytic(node, valueToPush: any, dataType: any, type: any): Promise<void> {
  const networkService = new NetworkService()
  if (valueToPush != undefined) {
    const input: InputDataEndpoint = {
      id: "",
      name: "",
      path: "",
      currentValue: valueToPush,
      unit: "",
      dataType: dataType,
      type: type,
      nodeTypeName: "BmsEndpoint"// should be SpinalBmsEndpoint.nodeTypeName || 'BmsEndpoint'
    };
    const time = new Date();   //Register in TimeSeries
    await networkService.updateEndpoint(node, input, time);
  }
  else {
    console.log(valueToPush + " value to push in node : " + node.info.name.get() + " -- ABORTED !");
  }
}


/**
 * Update the endpoint with given value. More resilient and can handle string values.
 * This function was coded but not used yet as it was mentionned that the models changing would break all the  bindings on said models.
 */
export async function updateControlEndpointWithValue(node : SpinalNode<any>, valueToPush : string | number | boolean, shouldReplaceDataType = false, ){
  const spinalBmsEndpoint : SpinalBmsEndpoint = await node.element.load();
  if (!spinalBmsEndpoint) {
    throw new Error(`Node ${node.info.name.get()} is not a valid BMS endpoint.`);
  }

  if (isDataTypeValid(valueToPush, spinalBmsEndpoint)) {
    // We can modify the endpoint value without changing the model type
    spinalBmsEndpoint.currentValue.set(valueToPush);


  } else if (shouldReplaceDataType) {
    // We need to change the model type to match the value type
    console.log('Changing data type for node:', node.info.name.get());
    spinalBmsEndpoint.mod_attr('currentValue', valueToPush);
    // Update the dataType based on the value type
    if (typeof valueToPush === 'string') {
      spinalBmsEndpoint.dataType.set(ControlEndpointDataType.String);
      return; // for strings, business ends here
    }
    else if (typeof valueToPush === 'number') {
      spinalBmsEndpoint.dataType.set(ControlEndpointDataType.Float);
    } else if (typeof valueToPush === 'boolean') {
      spinalBmsEndpoint.dataType.set(ControlEndpointDataType.Boolean);
    }
    
  }

  if (spinalBmsEndpoint.saveTimeSeries?.get() === 1  && typeof valueToPush !== 'string'){
      const timeseries =
        await spinalServiceTimeSeries().getOrCreateTimeSeries(
          node.getId().get()
        );
      const finalValueToPush = typeof valueToPush === 'number' ? valueToPush : (valueToPush ? 1 : 0);
      await timeseries.push(finalValueToPush);
    }






}

/**
 * Checks if the value type is compatible with the endpoint value model type (Str, Val, Bool).
 */
function isDataTypeValid( value : string | number | boolean, spinalBmsEndpoint: SpinalBmsEndpoint) : boolean {
  if (typeof value === 'string') return spinalBmsEndpoint.currentValue instanceof Str;
  if (typeof value === 'number') {
    return spinalBmsEndpoint.currentValue instanceof Val;
  }
  if (typeof value === 'boolean') return spinalBmsEndpoint.currentValue instanceof Bool;
}

