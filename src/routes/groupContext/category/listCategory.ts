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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/groupeContext/{id}/category_list:
 *   get:
 *     security:
 *       - bearerAuth:
 *         - readOnly
 *     description: Return list of category
 *     summary: Gets a list of category
 *     tags:
 *      - Group Context
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
 *                $ref: '#/components/schemas/CategoryEvent'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/groupeContext/:id/category_list", async (req, res, next) => {

    const nodes = [];
    try {
      const profileId = getProfileId(req);
      const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)

      const listCategories = await groupManagerService.getCategories(context.getId().get())

      for (const category of listCategories) {
        // @ts-ignore
        const realNode = SpinalGraphService.getRealNode(category.id.get())
        const info = {
          dynamicId: realNode._server_id,
          staticId: realNode.getId().get(),
          name: realNode.getName().get(),
          type: realNode.getType().get(),
          icon: category.icon.get()
        };
        nodes.push(info);

      }

    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of category event is not loaded");
    }
    res.send(nodes);
  });
};
