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
 * /api/v1/equipementsGroup/{contextId}/category/{categoryId}/group/{groupId}/delete:
 *   delete:
 *     security:
 *       - bearerAuth:
 *         - read
 *     description: delete group equipements Group
 *     summary: delete group equipements Group
 *     tags:
 *       - Equipements Group
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
 *      - in: path
 *        name: groupId
 *        description: use the dynamic ID
 *        required: true
 *        schema:
 *          type: integer
 *          format: int64
 *     responses:
 *       200:
 *         description: Delete Successfully
 *       400:
 *         description: Bad request
*/
  app.delete("/api/v1/equipementsGroup/:contextId/category/:categoryId/group/:groupId/delete", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)
      const category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(category)
      const group: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(group)

      if (context instanceof SpinalContext && category.belongsToContext(context) && group.belongsToContext(context)) {
        if (context.getType().get() === "BIMObjectGroupContext") {
          await SpinalGraphService.removeFromGraph(group.getId().get())
        } else {
          res.status(400).send("node is not type of BIMObjectGroupContext ");
        }
      } else {
        res.status(400).send("group not found in context");
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  })
}
