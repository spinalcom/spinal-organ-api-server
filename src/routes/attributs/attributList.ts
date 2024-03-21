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

import * as express from 'express';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import { NodeAttribut, Attributs } from './interfacesAttributs'
import { FileSystem } from 'spinal-core-connectorjs_type';
import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from "../../utilities/requestUtilities";
import { getAttributeListInfo } from '../../utilities/getAttributeListInfo'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  //deprecated
  app.get("/api/v1/node/:id/attributsList", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);
      const prom = childrens.map(async (child): Promise<NodeAttribut> => {
        const attributs = await child.element.load();
        const info: NodeAttribut = {
          dynamicId: child._server_id,
          staticId: child.getId().get(),
          name: child.getName().get(),
          type: child.getType().get(),
          attributs: attributs.get(),
        };
        return info;
      });
      const json = await Promise.all(prom);
      return res.json(json);
    } catch (error) {
      if (error.code) return res.status(error.code).send({ message: error.message });
      return res.status(400).send(error.message);
    }
  });

  /**
* @swagger
* /api/v1/node/{id}/attribute_list:
*   get:
*     security: 
*       - bearerAuth: 
*         - readOnly
*     description: Returns list of attributs
*     summary: Get list of attributs
*     tags:
*       - Node Attributs
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
*               type: array
*               items: 
*                $ref: '#/components/schemas/NodeAttribut'
*       400:
*         description: Bad request
  */


  app.get("/api/v1/node/:id/attribute_list", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const result = await getAttributeListInfo(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10));
      return res.json(result);
    } catch (error) {
      if (error.code) return res.status(error.code).send({ message: error.message });
      return res.status(400).send(error.message);
    }
  });
};
