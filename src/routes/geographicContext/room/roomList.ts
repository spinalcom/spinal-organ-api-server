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

// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalNode } from 'spinal-model-graph';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/floor/{id}/room_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return list of room
   *     summary: Gets a list of room
   *     tags:
   *      - Geographic Context
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
   *                $ref: '#/components/schemas/Room'
   *       400:
   *         description: Bad request
   */

  app.get('/api/v1/floor/:id/room_list', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const floor = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      //@ts-ignore
      SpinalGraphService._addNode(floor);
      const rooms = await floor.getChildren('hasGeographicRoom');
      const nodes = await Promise.all(
        rooms.map(async (room) => {
          const categories = await getSpinalCategoriesAndAttributes(room);

          return {
            dynamicId: room._server_id,
            staticId: room.getId().get(),
            name: room.getName().get(),
            type: room.getType().get(),
            categories,
          };
        })
      );
      return res.status(200).send(nodes);
    } catch (error) {
      console.error(error);
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res
        .status(400)
        .send(
          'An error occurred while retrieving the room list and their attributes.'
        );
    }
  });
};

async function getSpinalCategoriesAndAttributes(node: SpinalNode<any>) {
  const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);
  return Promise.all(
    categories.map(async (category) => {
      const attributes = (await category.element.load()).get();

      return {
        dynamicId: category._server_id,
        staticId: category.getId().get(),
        name: category.getName().get(),
        type: category.getType().get(),
        attributs: attributes,
      };
    })
  );
}
