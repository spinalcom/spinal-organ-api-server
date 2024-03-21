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

import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import getFiles from '../../../utilities/getFiles';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/equipement/{id}/file_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns files of equipement
   *     summary: Get list files of equipement
   *     tags:
   *       - Geographic Context
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
   *                $ref: '#/components/schemas/File'
   *       400:
   *         description: Bad request
   */
  app.get('/api/v1/equipement/:id/file_list', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      const equipement = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10), profileId
      );
      //@ts-ignore
      SpinalGraphService._addNode(equipement);
      if (equipement.getType().get() === 'BIMObject') {
        // Files
        var _files = [];
        const fileNode = (await equipement.getChildren('hasFiles'))[0];
        if (fileNode) {
          const filesfromElement = await fileNode.element.load();
          for (let index = 0; index < filesfromElement.length; index++) {
            const infoFiles = {
              dynamicId: filesfromElement[index]._server_id,
              Name: filesfromElement[index].name.get(),
            };
            _files.push(infoFiles);
          }
        }
      } else {
        res.status(400).send('node is not of type  BIMObject');
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send('ko');
    }
    res.json(_files);
  });
};
