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
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/endPointsGroup/{contextId}/category/{categoryId}/read:
 *   get:
 *     security: 
 *       - bearerAuth: 
 *         - readOnly
 *     description: read category endPoints Group 
 *     summary: Get category endPoints Group 
 *     tags:
 *       - EndPoints Group
 *     parameters:
 *      - in: path
 *        name: contextId
 *        description: use the dynamic ID
 *        required: true
 *        schema:
 *          type: integer
 *          format: int64
 *      - in: path
 *        name: categoryId
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
 *                $ref: '#/components/schemas/BasicNode'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/endPointsGroup/:contextId/category/:categoryId/read", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)

      const category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(category)
      if (context instanceof SpinalContext && category.belongsToContext(context)) {
        if (context.getType().get() === "BmsEndpointGroupContext") {
          var info = {
            dynamicId: category._server_id,
            staticId: category.getId().get(),
            name: category.getName().get(),
            type: category.getType().get()
          }
        } else {
          res.status(400).send("node is not type of BmsEndpointGroupContext ");
        }

      } else {
        res.status(400).send("category not found in context");
      }

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      return res.status(500).send(error.message);
    }
    res.json(info);
  });
}
