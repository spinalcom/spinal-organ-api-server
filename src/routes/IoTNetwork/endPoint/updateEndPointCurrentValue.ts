/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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

import {
  SpinalContext,
  SpinalGraphService,
  SpinalNodeRef,
} from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
import spinalServiceTimeSeries from '../spinalTimeSeries';
import * as express from 'express';
import { CurrentValue } from '../interfacesEndpointAndTimeSeries';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import {
  spinalControlPointService,
  ControlEndpointDataType,
} from 'spinal-env-viewer-plugin-control-endpoint-service';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';

const TIMESERIES_DATA_TYPES = [
  ControlEndpointDataType.Float,
  ControlEndpointDataType.Integer,
  ControlEndpointDataType.Integer16,
  ControlEndpointDataType.Long,
  ControlEndpointDataType.Double,
  ControlEndpointDataType.Real,
  ControlEndpointDataType.Unsigned,
  ControlEndpointDataType.Unsigned8,
  ControlEndpointDataType.Unsigned16,
  ControlEndpointDataType.Unsigned32,
  ControlEndpointDataType.DateTime,
];

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/endpoint/{id}/update:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: Update the current value or control value of the endpoint
   *     summary: Update the current value or control value of the endpoint
   *     tags:
   *       - IoTNetwork & Time Series
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: query
   *        name: updateType
   *        description: Choose between updating the current value or control value
   *        required: true
   *        schema:
   *          type: string
   *          enum: [currentValue, controlValue]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - newValue
   *             properties:
   *                newValue:
   *                 type: number
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/NewValue'
   *       400:
   *         description: Bad request
   */

  app.put('/api/v1/endpoint/:id/update', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const node: SpinalNode = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      SpinalGraphService._addNode(node);
      const newValue = req.body.newValue;
      const nodeInfo = await node.element.load();

      const updateType = req.query.updateType;
      if(updateType != "controlValue"){ 
        const result = await updateCurrentValue(node, nodeInfo, newValue);
        return res.json(result);
      }
      else {
        const result = await updateControlValue(node, nodeInfo, newValue);
        return res.json(result);
      }

    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(400).send(error.message);
    }
  });
};


async function updateCurrentValue(node: SpinalNode<any>, nodeInfo, newValue){
  const dataType = nodeInfo.dataType?.get();
  const isCp = nodeInfo.saveTimeSeries ? true : false;
  if (!dataType)
    throw {
      code: 400,
      message:
        'The node has no dataType ( The node is probably not a BmsEndpoint )',
    };
  console.log('The node is a control point :', isCp);

  if (dataType === 'Boolean' && typeof newValue !== 'boolean') {
    throw { code: 400, message: 'The new value should be a boolean' };
  }
  if (dataType === 'Enum' && typeof newValue !== 'string') {
    throw { code: 400, message: 'The new value should be a string' };
  }

  if (isCp && dataType === 'Enum') {
    const authorizedValues = await getAuthorizedValuesByProfile(
      node,
      newValue
    );
    if (
      authorizedValues.length > 0 &&
      !authorizedValues.includes(newValue)
    ) {
      throw {
        code: 400,
        message:
          'The new value is not authorized. Authorized values : ' +
          authorizedValues.join(' | '),
      };
    }
  }
  if (
    typeof newValue === 'number' &&
    TIMESERIES_DATA_TYPES.includes(dataType)
  ) {
    if ((isCp && nodeInfo.saveTimeSeries.get()) || !isCp) {
      const timeseries =
        await spinalServiceTimeSeries().getOrCreateTimeSeries(
          node.getId().get()
        );
      await timeseries.push(newValue);
    }
  }

  nodeInfo.currentValue.set(newValue);
  node.info.directModificationDate.set(Date.now());
  return { NewValue: nodeInfo.currentValue.get() };
}

async function updateControlValue(node: SpinalNode<any>, nodeInfo, newValue){

  const foundAttribute = await serviceDocumentation.findOneAttributeInCategory(node,'default','controlValue')
  if(foundAttribute != -1){
    const attribute = await serviceDocumentation.addAttributeByCategoryName(node, 'default', 'controlValue', newValue)
    node.info.directModificationDate.set(Date.now());
    return { NewValue: attribute.value.get() };
  }
  else throw Error("The node has no controlValue attribute")
}

async function getProfileReferenceId(
  node: SpinalNode<any>
): Promise<string | null> {
  const parents = await node.getParents(['hasBmsEndpoint']);
  for (const parent of parents) {
    const referenceId = parent.info.referenceId?.get();
    if (referenceId) return referenceId;
  }
  return null;
}

/**
 *  Find the profile among multiple contexts
 * @param contexts
 * @param profileReferenceId
 * @returns
 */
async function findControlPointProfile(
  contexts: SpinalNodeRef[],
  profileReferenceId: string
): Promise<SpinalNodeRef | null> {
  for (const ctxt of contexts) {
    const profilesResult = await SpinalGraphService.findInContext(
      ctxt.id.get(),
      ctxt.id.get(),
      (node) => {
        SpinalGraphService._addNode(node);
        return node.getId().get() === profileReferenceId;
      }
    );
    if (profilesResult.length > 0) return profilesResult[0];
  }
  return null;
}

async function getAuthorizedValuesByProfile(
  node: SpinalNode<any>,
  newValue: string
): Promise<string[]> {
  const authorizedValues = [];
  const profileReferenceId = await getProfileReferenceId(node);
  if (!profileReferenceId)
    throw { code: 400, message: 'The node has no profile reference id' };
  const controlPointContexts = await spinalControlPointService.getContexts();
  const profileNode = await findControlPointProfile(
    controlPointContexts,
    profileReferenceId
  );
  if (!profileNode) {
    throw {
      code: 400,
      message:
        "Couldn't retrieve the profile after examining all control point contexts",
    };
  }
  const realNode = SpinalGraphService.getRealNode(profileNode.id.get());
  const elements = await realNode.element.load();
  for (const element of elements) {
    if (element.name?.get() == node.getName().get()) {
      const configs = element.config.enumeration;
      for (const config of configs) {
        authorizedValues.push(config.name.get());
      }
    }
  }

  return authorizedValues;
}
