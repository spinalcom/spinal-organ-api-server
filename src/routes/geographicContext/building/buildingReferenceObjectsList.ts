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

import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { getBuildingReferenceObjectsListInfo } from '../../../utilities/getBuildingReferenceObjectListInfo';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/building/reference_object_list:
 *   get:
 *     security: 
 *       - bearerAuth: 
 *         - readOnly
 *     description: Return reference objects of the building
 *     summary: Gets reference objects of the building
 *     tags:
 *      - Geographic Context
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: 
 *               type: "object"
 *               properties:
 *                 dynamicId:
 *                   type: "integer"
 *                 staticId:
 *                   type: "string"
 *                 name:
 *                   type: "string"
 *                 type:
 *                   type: "string"
 *                 infoReferencesObjects:
 *                   type: "array"
 *                   items: 
 *                    $ref: '#/components/schemas/Equipement'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/building/reference_object_list", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const info = await getBuildingReferenceObjectsListInfo(spinalAPIMiddleware,profileId);
      return res.send(info);
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of reference_Objects is not loaded");
    }
  });
};
