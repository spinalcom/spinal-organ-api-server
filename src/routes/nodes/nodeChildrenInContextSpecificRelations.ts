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

import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from '../../utilities/requestUtilities';
import * as express from 'express';
import { getChildrenNodesInfo } from '../../utilities/getChildrenNodesInfo';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/context/{idContext}/node/{idNode}/children:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the children of a node inside a context
   *     description: >-
   *       Returns the children of `idNode` that belong to the context `idContext`, through the relation
   *       names given in the body. An empty array follows every relation of the node that belongs to
   *       the context.
   *
   *
   *       This is the route to use to browse a context branch by branch : unlike
   *       `POST /api/v1/node/{id}/children`, children attached through relations outside the context
   *       are left out.
   *     tags:
   *       - Nodes
   *     parameters:
   *       - in: path
   *         name: idContext
   *         description: Dynamic ID of the context the walk stays in.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: idNode
   *         description: Dynamic ID of the node to walk.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
   *       description: >-
   *         The relation names to follow. An **empty array follows every relation** the node carries.
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: string
   *             example: ["hasGeographicRoom"]
   *     responses:
   *       200:
   *         description: The children of the node inside the context.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: The body is not an array, or the node or context could not be loaded.
   *       401:
   *         description: The profile is not allowed to read the node or the context.
   */
  app.post('/api/v1/context/:idContext/node/:idNode/children', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const contextId = req.params.idContext;
      const nodeId = req.params.idNode;
      const relations: string[] = req.body;

      if (!Array.isArray(relations)) {
        return res
          .status(400)
          .send('Invalid relations format; an array is expected');
      }

      const children = await getChildrenNodesInfo(
        spinalAPIMiddleware,
        profileId,
        parseInt(nodeId, 10),
        relations,
        parseInt(contextId,10)
      );
      return res.status(200).json(children);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(400).send('An error occurred while fetching children.');
    }
  });
};
