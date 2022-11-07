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

import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service'
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
* @swagger
* /api/v1/node/{nodeId}/categoryByName/{categoryName}/delete:
*   delete:
*     security: 
*       - OauthSecurity: 
*         - read
*     description: Delete category from graph
*     summary: Delete category attribut
*     tags:
*       - Node Attribut Categories
*     parameters:
*      - in: path
*        name: nodeId
*        description: use the dynamic ID
*        required: true
*        schema:
*          type: integer
*          format: int64
*      - in: path
*        name: categoryName
*        required: true
*        schema:
*          type: string
*     responses:
*       202:
*         description: Deleted successfully
*       400:
*         description: Bad request
  */

  app.delete("/api/v1/node/:nodeId/categoryByName/:categoryName/delete", async (req, res, next) => {

    try {
      let node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10))
      const result = await serviceDocumentation._categoryExist(node, req.params.categoryName);
      if (result === undefined) {
        res.status(400).send("category not found in node")
      } else {
        result.removeFromGraph();
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("ko");
    }
    res.json();
  })
}
