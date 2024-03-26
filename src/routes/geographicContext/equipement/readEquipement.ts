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
import { Room } from '../interfacesGeoContext'
import { SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/equipement/{id}/read:
 *   get:
 *     security: 
 *       - bearerAuth: 
 *         - readOnly
 *     description: read equipement 
 *     summary: Gets equipement
 *     tags:
 *       - Geographic Context
 *     parameters:
 *      - in: path
 *        name: id
 *        description: use the dynamic ID
 *        required: true
 *        schema:
 *          type: integer
 *          format: int64
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: 
 *                $ref: '#/components/schemas/Equipement'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/equipement/:id/read", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      const equipement: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(equipement)

      if (equipement.getType().get() === "BIMObject") {
        var info = {
          dynamicId: equipement._server_id,
          staticId: equipement.getId().get(),
          name: equipement.getName().get(),
          type: equipement.getType().get(),
          bimFileId: equipement.info.bimFileId.get(),
          version: equipement.info.version.get(),
          externalId: equipement.info.externalId.get(),
          dbid: equipement.info.dbid.get(),
        }
      } else {
        res.status(400).send("node is not of type geographic room");
      }

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(info);
  });
}
