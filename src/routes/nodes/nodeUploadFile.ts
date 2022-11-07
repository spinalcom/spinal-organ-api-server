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

import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { FileSystem } from 'spinal-core-connectorjs_type';
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import { FileExplorer } from 'spinal-env-viewer-plugin-documentation-service';
import { ServiceUser } from 'spinal-service-user';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{id}/upload_file:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: Upload a Doc
   *     summary: Upload a Doc
   *     tags:
   *       - Nodes
   *     parameters:
   *      - in: path
   *        name: id
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *           encoding:
   *             file:
   *               style: form
   *     responses:
   *       200:
   *         description: Upload Successfully
   *       400:
   *         description: Upload not Successfully
   */
  app.post('/api/v1/node/:id/upload_file', async (req, res, next) => {
    try {
      var node: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10)
      );
      //@ts-ignore
      SpinalGraphService._addNode(node);

      // @ts-ignore
      if (!req.files) {
        res.send({
          status: false,
          message: 'No file uploaded',
        });
      } else {
        //Use the name of the input field (i.e. "file") to retrieve the uploaded file
        // @ts-ignore
        let file = req.files.file;

        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        // file.mv('./uploads/' + file.name);
        // var user = { username: "string", userId: 0 }
        var data = {
          name: file.name,
          buffer: file.data,
          // mimetype: file.mimetype,
          // size: file.size
        };

        await FileExplorer.uploadFiles(node, data);

        // let directory = await FileExplorer.getDirectory(node);
        // await FileExplorer.addFileUpload(directory, file)
        //send response
        res.send({
          status: true,
          message: 'File is uploaded',
          data: {
            name: file.name,
            mimetype: file.mimetype,
            size: file.size,
          },
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send('ko');
    }
    // res.json();
  });
};
