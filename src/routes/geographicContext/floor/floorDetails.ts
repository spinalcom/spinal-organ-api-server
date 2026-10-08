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

// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Floor } from '../interfacesGeoContext';
import { SpinalNode } from 'spinal-model-graph';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import {
  SpinalContext,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { findOneInContext } from '../../../utilities/findOneInContext';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/floor/{id}/floor_details:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get the area and BIM objects of a floor
   *     description: >-
   *       Walks the rooms of a floor and returns two things : `area`, the sum of the `area` attribute
   *       found in the `Spatial` category of every room, and `_bimObjects`, the flat list of the BIM
   *       objects attached to those rooms.
   *
   *
   *       Rooms without a `Spatial` category, or without an `area` attribute in it, simply contribute
   *       nothing to the sum - the total is never reported as incomplete. BIM objects are listed with
   *       their `staticId` only; they carry no `dynamicId` here.
   *     tags:
   *      - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the floor.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The floor area and its BIM objects.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/FloorDetails'
   *       400:
   *         description: The floor could not be loaded, or one of its rooms could not be read.
   *       401:
   *         description: The profile is not allowed to read this floor.
   */

  app.get('/api/v1/floor/:id/floor_details', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      const floor: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      const rooms = await floor.getChildren('hasGeographicRoom');
      let sommes = 0;
      const _bimObjects = [];
      let bimFileId: string;
      for (const room of rooms) {
        const bimObjects = await room.getChildren('hasBimObject');
        for (const bimObject of bimObjects) {
          bimFileId = bimObject.info.bimFileId.get();

          const infoBimObject = {
            staticId: bimObject.getId().get(),
            name: bimObject.getName().get(),
            type: bimObject.getType().get(),
            version: bimObject.info.version.get(),
            externalId: bimObject.info.externalId.get(),
            dbid: bimObject.info.dbid.get(),
            bimFileId: bimObject.info.bimFileId.get(),
          };

          _bimObjects.push(infoBimObject);
        }

        const categories = await room.getChildren(NODE_TO_CATEGORY_RELATION);
        for (const child of categories) {
          if (child.getName().get() === 'Spatial') {
            const attributs = await child.element.load();
            for (const attribut of attributs.get()) {
              if (attribut.label === 'area') {
                sommes = sommes + attribut.value;
              }
            }
          }
        }
      }
      const info = {
        area: sommes,
        _bimObjects: _bimObjects,
      };
      res.json(info);
    } catch (error) {
      console.error(error);
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(400).send('list of floor is not loaded');
    }
  });
};
