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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from "spinal-env-viewer-task-service";
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/equipementsGroup/{id}/delete:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Delete a group context
   *     description: >-
   *       Removes a group context from the graph, with its categories and groups.
   *
   *
   *       The items that were assigned to those groups are **not** deleted : they keep living in their
   *       own context and simply lose this grouping.
   *     tags:
   *       - Equipements Group
   *     parameters:
   *       - in: path
   *         name: id
   *         description: Dynamic ID of the group context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     responses:
   *       200:
   *         description: The context was deleted.
   *       400:
   *         description: The context could not be loaded.
   *       401:
   *         description: The profile is not allowed to delete this context.
   *       500:
   *         description: The context could not be removed.
   */
  app.delete("/api/v1/equipementsGroup/:id/delete", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      const groupContext: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(groupContext)
      if (groupContext.getType().get() === "BIMObjectGroupContext") {
        await SpinalGraphService.removeFromGraph(groupContext.getId().get())
      } else {
        res.status(400).send("node is not type of BIMObjectGroupContext ");
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  })
}
