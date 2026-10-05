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

import type { Express } from 'express';
import type { Node } from '../interface/Node';
import { getNodeInfo } from '../../utilities/getNodeInfo';
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{id}/read:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Read a node
   *     description: >-
   *       Returns the summary of a single node : its `dynamicId` (the volatile `_server_id`, valid only
   *       for the lifetime of the current hub connection), its persistent `staticId`, its name and type,
   *       and the display fields it carries (`color`, `icon`) plus the BIM link (`dbid`, `bimFileId`)
   *       when they exist.
   *
   *
   *       `children_relation_list` and `parent_relation_list` are always returned **empty** by this
   *       route. To get the relations of a node use `/api/v1/node/{id}/children`,
   *       `/api/v1/node/{id}/parents`, or `/api/v1/node/read_multiple`, which takes
   *       `includeChildrenRelations` / `includeParentRelations` query parameters.
   *     tags:
   *       - Nodes
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the node.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The node summary.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Node'
   *       400:
   *         description: The node could not be loaded (unknown or stale dynamic ID).
   *       401:
   *         description: The profile is not allowed to read this node.
   */

  app.get('/api/v1/node/:id/read', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const info: Node = await getNodeInfo(
        spinalAPIMiddleware,
        profileId,
        parseInt(req.params.id, 10)
      );
      return res.json(info);
    } catch (error: any) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      if (error.message) return res.status(400).send(error.message);
      console.error(error);
      return res.status(400).send(error);
    }
  });
};
