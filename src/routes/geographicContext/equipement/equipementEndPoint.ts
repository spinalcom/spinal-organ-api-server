/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { EndPointRoom } from '../interfacesGeoContext'
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/equipement/{id}/endpoint_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the BMS endpoints of an equipment
   *     description: >-
   *       Returns the BMS endpoints attached to a piece of equipment, with the last value known by the
   *       hub. The node must be of type `BIMObject`.
   *
   *
   *       The generic `/api/v1/node/{id}/endpoint_list` does the same on any node type and accepts
   *       `includeDetails`.
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the equipment (a `BIMObject`).
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The requested list (empty when there is nothing).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/EndPointRoom'
   *       400:
   *         description: The node is not a `BIMObject`, or its endpoints could not be read ("list of endpoints is not loaded").
   *       401:
   *         description: The profile is not allowed to read this equipment.
   */

  app.get("/api/v1/equipement/:id/endpoint_list", async (req, res, next) => {

    const nodes = [];
    try {
      const profileId = getProfileId(req);

      const equipement = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      // @ts-ignore
      SpinalGraphService._addNode(equipement);
      if (equipement.getType().get() === "BIMObject") {

        const endpoints = await equipement.getChildren(["hasEndPoint", SpinalBmsEndpoint.relationName]);

        for (const endpoint of endpoints) {
          const element = await endpoint.element.load()
          const currentValue = element.currentValue.get();
          const unit = element.unit.get(); 
          const info: EndPointRoom = {
            dynamicId: endpoint._server_id,
            staticId: endpoint.getId().get(),
            name: endpoint.getName().get(),
            type: endpoint.getType().get(),
            currentValue: currentValue,
            unit: unit
          };
          nodes.push(info);
        }
      } else {
        res.status(400).send("node is not of type BIMObject");
      }


    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of endpoints is not loaded");
    }
    res.send(nodes);
  });
}
