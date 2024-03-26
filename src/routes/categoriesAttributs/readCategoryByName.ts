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
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { CategoriesAttribute } from './interfacesCategoriesAttribute'
import { getProfileId } from '../../utilities/requestUtilities';
import { SpinalNode } from 'spinal-model-graph';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/node/{nodeId}/categoryByName/{categoryName}/read:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: read category attribut in specific node
   *     summary: read category attribut
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
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/CategoriesAttribute'
   *       400:
   *         description: Bad request
   */

  app.get("/api/v1/node/:nodeId/categoryByName/:categoryName/read", async (req, res, next) => {

    let info: CategoriesAttribute;
    try {
      const profileId = getProfileId(req);
      const node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId)
      const result = await serviceDocumentation._categoryExist(node, req.params.categoryName);
      if (result === undefined) {
        res.status(400).send("category not found in node")
      } else {
        info = {
          dynamicId: result._server_id,
          staticId: result.getId().get(),
          name: result.getName().get(),
          type: result.getType().get(),
        };
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(info);
  })
}

