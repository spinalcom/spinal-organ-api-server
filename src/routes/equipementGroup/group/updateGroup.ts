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

// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/equipementsGroup/{contextId}/category/{categoryId}/group/{groupId}/update:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Rename a group and change its colour
   *     description: >-
   *       Updates the name and the colour of a group. Both fields are applied, so send the current
   *       colour to keep it. The category and the group must belong to the given context.
   *     tags:
   *       - Equipements Group
   *     parameters:
   *       - in: path
   *         name: contextId
   *         description: Dynamic ID of the group context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: categoryId
   *         description: Dynamic ID of the category, which must belong to that context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: groupId
   *         description: Dynamic ID of the group, which must belong to that category.
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
   *               - newNameGroup
   *             properties:
   *               newNameGroup:
   *                 type: string
   *               newNameColor:
   *                 type: string
   *                 description: New display colour.
   *     responses:
   *       200:
   *         description: The updated group.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: >-
   *           The context, category or group could not be resolved ("context not found",
   *           "category not found", "group not found").
   *       401:
   *         description: The profile is not allowed to write on this context.
   */



  app.put("/api/v1/equipementsGroup/:contextId/category/:categoryId/group/:groupId/update", async (req, res, next) => {

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
          const dataObject = {
            name: req.body.newNameGroup,
            color: req.body.newNameColor
          }
          groupManagerService.updateGroup(group.getId().get(), dataObject)
        } else {
          res.status(400).send("node is not type of BIMObjectGroupContext ");
        }
      } else {
        res.status(400).send("category or group not found in context");
      }
    } catch (error) {
      console.error(error)
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send(error.message)
    }
    res.json();
  })

}
