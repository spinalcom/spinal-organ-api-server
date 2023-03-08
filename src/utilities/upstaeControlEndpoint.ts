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
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { NetworkService, InputDataEndpoint, InputDataEndpointDataType, InputDataEndpointType } from "spinal-model-bmsnetwork"

/**
    * @param  {SpinalNodeRef} model
    * @param  {any} valueToPush
    * @param  {any} dataType
    * @param  {any} type
    * @returns Promise
    */
export async function updateControlEndpointWithAnalytic(model, valueToPush: any, dataType: any, type: any): Promise<void> {

  var networkService = new NetworkService()
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
    await networkService.updateEndpoint(model, input, time);
    console.log(model.name.get() + " ==>  is updated ");
  }
  else {
    console.log(valueToPush + " value to push in node : " + model.name.get() + " -- ABORTED !");
  }
}

