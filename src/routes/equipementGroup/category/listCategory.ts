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
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/equipementsGroup/{id}/category_list:
 *   get:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: Return list of category equipements Group
 *     summary: Gets a list of category equipements Group
 *     tags:
 *       - Equipements Group
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

  app.get("/api/v1/equipementsGroup/:id/category_list", async (req, res, next) => {

    let nodes = [];
    try {
      var context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      //@ts-ignore
      SpinalGraphService._addNode(context)

      if (context.getType().get() === "BIMObjectGroupContext") {
        var listCategories = await groupManagerService.getCategories(context.getId().get())

        for (const category of listCategories) {
          // @ts-ignore
          const realNode = SpinalGraphService.getRealNode(category.id.get())
          let info = {
            dynamicId: realNode._server_id,
            staticId: realNode.getId().get(),
            name: realNode.getName().get(),
            type: realNode.getType().get(),
            icon: category.icon.get()
          };
          nodes.push(info);

        }

      } else {
        res.status(400).send("node is not type of BIMObjectGroupContext ");
      }



    } catch (error) {
      console.error(error);
      res.status(400).send("list of category is not loaded");
    }
    res.send(nodes);
  });
};
