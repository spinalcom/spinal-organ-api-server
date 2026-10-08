
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
// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';
import { awaitSync } from '../../utilities/awaitSync';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/node/{id}/category/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create an attribute category on a node
   *     description: >-
   *       Attaches a new, empty attribute category to a node. Attributes are then added to it with
   *       `/api/v1/node/{IdNode}/category/{IdCategory}/attribut/create`, using the `id` returned here.
   *
   *
   *       Category names are not unique : creating a category with a name the node already carries adds
   *       a second one. The route waits for the hub to acknowledge the write before answering, so the
   *       returned `id` is usable right away.
   *     tags:
   *       - Node Attribut Categories
   *     parameters:
   *       - in: path
   *         name: id
   *         description: Dynamic ID of the node the category is attached to.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
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
   *         description: The category was created.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                   description: Name of the created category.
   *                 id:
   *                   type: integer
   *                   format: int64
   *                   description: Dynamic ID of the created category node.
   *       401:
   *         description: The profile is not allowed to write on this node.
   *       500:
   *         description: The node could not be loaded or the category could not be created.
   */

  app.post("/api/v1/node/:id/category/create", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId)
      const categoryName = req.body.categoryName
      const category = await serviceDocumentation.addCategoryAttribute(node, categoryName);
      await awaitSync(category.node)
      res.status(200).json({
        name: category.nameCat,
        id: category.node._server_id
      });
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  })
}
