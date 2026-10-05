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

import * as express from 'express';
import { Context } from '../interfacesGroupContexts';
import groupManagerService from 'spinal-env-viewer-plugin-group-manager-service';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/groupContext/list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the group contexts
   *     description: >-
   *       Returns every group context the profile can reach, with its name, type and display colour.
   *       Use a returned `dynamicId` to reach its categories with `/api/v1/groupContext/{id}/category_list`.
   *
   *
   *       Group contexts organise items into categories, and categories into groups.
   *
   *     tags:
   *       - Group Context
   *     responses:
   *       200:
   *         description: The group contexts (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Context'
   *       400:
   *         description: The profile graph could not be read.
   *       401:
   *         description: The profile is not allowed to read the graph.
   */

  app.get('/api/v1/groupContext/list', async (req, res, next) => {
    const nodes = [];
    try {
      const profilId = getProfileId(req);
      const graph = await spinalAPIMiddleware.getProfileGraph(profilId);
      const groupContexts = await groupManagerService.getGroupContexts(
        undefined,
        graph
      );
      for (let index = 0; index < groupContexts.length; index++) {
        const realNode = SpinalGraphService.getRealNode(
          groupContexts[index].id
        );
        const info: Context = {
          dynamicId: realNode._server_id,
          staticId: realNode.getId().get(),
          name: realNode.getName().get(),
          type: realNode.getType().get(),
          color: realNode.info.color?.get(),
        };
        nodes.push(info);
      }
      return res.status(200).send(nodes);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      return res.status(400).send('list of group contexts is not loaded');
    }
  });
};
