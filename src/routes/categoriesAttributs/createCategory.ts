
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
import spinalAPIMiddleware from '../../app/spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/node/{id}/category/create:
 *   post:
 *     security:
 *       - OauthSecurity:
 *         - read
 *     description: create category attribute in specific node
 *     summary: create category attribut
 *     tags:
 *       - Node Attribut Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         description: use the dynamic ID
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *               categoryName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created successfully
 *       400:
 *         description:  Bad request
  */

  app.post("/api/v1/node/:id/category/create", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      var node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId)
      var categoryName = req.body.categoryName
      serviceDocumentation.addCategoryAttribute(node, categoryName);
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  })
}
