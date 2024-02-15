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
import { CreateNode } from './interfacesNodes';
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';
import {
  SpinalGraphService,
  SpinalNode,
  SpinalContext
} from 'spinal-env-viewer-graph-service';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{id}/delete:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Create a node and return its information
   *     summary: Create a node
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
   *       204:
   *         description: Node successfully deleted
   *       400:
   *         description: Bad request
   */

  app.delete('/api/v1/node/:id/delete', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const nodeId = req.params.id;
      const node : SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(nodeId, 10), profileId);
      SpinalGraphService._addNode(node);
      await SpinalGraphService.removeFromGraph(node.getId().get());
      
      return res.status(204).send("Node successfully deleted");

    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  });
};
