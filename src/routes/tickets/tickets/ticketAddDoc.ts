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
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Step } from '../interfacesWorkflowAndTickets';
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { ServiceUser } from 'spinal-service-user';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/ticket/{ticketId}/add_doc:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: Uploads a Doc
   *     summary: Uploads a Doc
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *       - in: path
   *         name: ticketId
   *         description: use the dynamic ID
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
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
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - workflowId
   *             properties:
   *               workflowId:
   *                 type: number
   *     responses:
   *       200:
   *         description: Add Successfully
   *       400:
   *         description: Add not Successfully
   */
  app.post('/api/v1/ticket/:ticketId/add_doc', async (req, res, next) => {
    try {
      // var workflow = await spinalAPIMiddleware.load(parseInt(req.body.workflowId, 10));
      // //@ts-ignore
      // SpinalGraphService._addNode(workflow)

      var ticket: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.params.ticketId, 10)
      );
      //@ts-ignore
      SpinalGraphService._addNode(ticket);

      // @ts-ignore
      if (!req.files) {
        res.send({
          status: false,
          message: 'No file uploaded',
        });
      } else {
        //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
        //@ts-ignore
        let avatar = req.files.file;

        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        // avatar.mv('./uploads/' + avatar.name);
        var user = { username: 'api', userId: 0 };
        var data = {
          name: avatar.name,
          buffer: avatar.data,
        };
        await serviceDocumentation.addFileAsNote(ticket, data, user);

        // send response
        res.send({
          status: true,
          message: 'File is uploaded',
          data: {
            name: avatar.name,
            mimetype: avatar.mimetype,
            size: avatar.size,
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
