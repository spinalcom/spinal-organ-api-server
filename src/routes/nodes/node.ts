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

// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { childrensNode, parentsNode } from '../../utilities/corseChildrenAndParentNode'
import { Node } from './interfacesNodes'
import { SpinalNode } from 'spinal-model-graph';
import  {getNodeInfo}  from '../../utilities/getNodeInfo'
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/node/{id}/read:
 *   get:
 *     security: 
 *       - bearerAuth: 
 *         - readOnly
 *     description: Return node object with parent and children relation
 *     summary: Gets Node
 *     tags:
 *       - Nodes
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
 *                $ref: '#/components/schemas/Node'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/node/:id/read", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const info : Node = await getNodeInfo(spinalAPIMiddleware,profileId, parseInt(req.params.id, 10));
      return res.json(info);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      if (error.message) return res.status(400).send(error.message);
      console.error(error);
      return res.status(400).send(error);
    }
  });
}

