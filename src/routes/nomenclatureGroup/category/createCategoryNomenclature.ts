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

import SpinalAPIMiddleware from '../../../app/spinalAPIMiddleware';
import * as express from 'express';
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { spinalNomenclatureService } from "spinal-env-viewer-plugin-nomenclature-service"

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: SpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/nomenclatureGroup/{id}/create_category:
 *   post:
 *     security:
 *       - OauthSecurity:
 *         - read
 *     description: create category Nomenclature 
 *     summary: create category Nomenclature 
 *     tags:
 *       - Nomenclature Group
 *     parameters:
 *      - in: path
 *        name: id
 *        description: use the dynamic ID
 *        required: true
 *        schema:
 *          type: integer
 *          format: int64
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - iconName
 *             properties:
 *                categoryName:
 *                 type: string
 *                iconName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Create Successfully
 *       400:
 *         description: Bad request
*/

  app.post("/api/v1/nomenclatureGroup/:id/create_category", async (req, res, next) => {

    try {

      var context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      //@ts-ignore
      SpinalGraphService._addNode(context)
      if (context.getType().get() === "AttributeConfigurationGroupContext") {
        var category = await spinalNomenclatureService.createCategory(req.body.categoryName, req.body.iconName, context.getId().get())
        var info = {
          dynamicId: category._server_id,
          staticId: category.getId().get(),
          name: category.getName().get(),
          type: category.getType().get(),
          icon: category.info.icon.get()
        };

        // groupManagerService.addCategory(context.getId().get(), req.body.categoryName, req.body.iconName)
      } else {
        res.status(400).send("node is not type of AttributeConfigurationGroupContext ");
      }
    } catch (error) {
      console.error(error)
      res.status(400).send("ko")
    }
    res.json(info);
  })

}
