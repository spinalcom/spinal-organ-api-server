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
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { awaitSync } from '../../../utilities/awaitSync';
import { _load } from '../../../utilities/loadNode';
import getNode from '../../../utilities/getNode'

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/ticket/create_ticket:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: add a Ticket
   *     summary: add a Ticket
   *     tags:
   *       - Workflow & ticket
   *     requestBody:
   *       description: For the two parameters *workflow* and *process* you can browse it either by putting the dynamicId or the name and to associate the ticket with an element, please fill in the dynamicId or StaticId parameter
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - workflow
   *               - process
   *               - nodeDynamicId
   *               - nodeStaticId
   *               - name
   *               - priority
   *               - description
   *               - declarer_id
   *               - imageString
   *             properties:
   *               workflow:
   *                 type: string
   *               process:
   *                 type: string
   *               nodeDynamicId:
   *                 type: number
   *               nodeStaticId:
   *                 type: string
   *               name:
   *                 type: string
   *               priority:
   *                 type: number
   *               description:
   *                 type: string
   *               declarer_id:
   *                 type: string
   *               images:
   *                 type: array
   *                 items:
   *                  type: object
   *                  properties:
   *                    name:
   *                      type: string
   *                    value:
   *                      type: string
   *                    comments:
   *                      type: string
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Ticket'
   *       400:
   *         description: Add not Successfully
   */
  app.post('/api/v1/ticket/create_ticket', async (req, res, next) => {
    try {
      await spinalAPIMiddleware.getGraph();
      let ticketCreated;
      let ticketInfo = {
        name: req.body.name,
        priority: req.body.priority,
        description: req.body.description,
        declarer_id: req.body.declarer_id,
      };
      let arrayofServerId = [
        parseInt(req.body.workflow, 10),
        parseInt(req.body.process, 10),
      ];
      const [workflowById, processById]: SpinalNode<any>[] = await _load(
        arrayofServerId
      );
      const node = await getNode(spinalAPIMiddleware, req.body.nodeDynamicId, req.body.nodeStaticId)
      if (!node) return res.status(400).send('invalid nodeDynamicId or nodeStaticId');

      //@ts-ignore
      SpinalGraphService._addNode(node);
      if (workflowById === undefined && processById === undefined) {
        var allContexts = serviceTicketPersonalized.getContexts();
        for (const context of allContexts) {
          if (context.name === req.body.workflow) {
            let result = SpinalGraphService.getRealNode(context.id);
            //@ts-ignore
            SpinalGraphService._addNode(result);
            var workflowByName = result;
          }
        }

        if (workflowByName) {
          var allProcess = await serviceTicketPersonalized.getAllProcess(
            workflowByName.getId().get()
          );
          for (const process of allProcess) {
            if (process.name.get() === req.body.process) {
              let result = SpinalGraphService.getRealNode(process.id.get());
              //@ts-ignore
              SpinalGraphService._addNode(result);
              var processByName = result;
            }
          }
        }

        if (processByName.belongsToContext(workflowByName)) {
          ticketCreated = await serviceTicketPersonalized.addTicket(
            ticketInfo,
            processByName.getId().get(),
            workflowByName.getId().get(),
            node.getId().get()
          );
        } else {
          return res
            .status(400)
            .send('the workflow does not contain this process');
        }
      } else {
        //@ts-ignore
        SpinalGraphService._addNode(workflowById);
        //@ts-ignore
        SpinalGraphService._addNode(processById);
        if (processById) {
          if (processById.belongsToContext(workflowById)) {
            ticketCreated = await serviceTicketPersonalized.addTicket(
              ticketInfo,
              processById.getId().get(),
              workflowById.getId().get(),
              node.getId().get()
            );
          } else {
            return res
              .status(400)
              .send('the workflow does not contain this process');
          }
        }
      }

      var ticketList = await serviceTicketPersonalized.getTicketsFromNode(
        node.getId().get()
      );
      for (let index = 0; index < ticketList.length; index++) {
        if (ticketList[index].id === ticketCreated) {
          var realNodeTicket = SpinalGraphService.getRealNode(
            ticketList[index].id
          );
          await awaitSync(realNodeTicket);
          var info = {
            dynamicId: realNodeTicket._server_id,
            staticId: realNodeTicket.getId().get(),
            name: realNodeTicket.getName().get(),
            type: realNodeTicket.getType().get(),
            elementSelected: req.body.nodeDynamicId,
            priority: realNodeTicket.info.priority.get(),
            description: realNodeTicket.info?.description.get(),
            declarer_id: realNodeTicket.info?.declarer_id.get(),
            creationDate: realNodeTicket.info.creationDate.get(),
          };
        }
      }

      if (req.body.images && req.body.images.length > 0) {
        // const objImage = new Lst(req.body.images);
        // realNodeTicket.info.add_attr('images', new Ptr(objImage));

        for (const image of req.body.images) {
          // @ts-ignore
          var user = {
            username: realNodeTicket.info?.declarer_id?.get() || 'user',
            userId: 0,
          };
          const base64Image = image.value as string;
          // check if data base64
          if (/^data:image\/\w+;base64,/.test(base64Image) === true) {
            const imageData = base64Image.replace(
              /^data:image\/\w+;base64,/,
              ''
            );
            const imageBufferData = Buffer.from(imageData, 'base64');
            await serviceDocumentation.addFileAsNote(
              realNodeTicket,
              { name: image.name, buffer: imageBufferData },
              user
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(400).send({ ko: error });
    }
    return res.json(info);
  });
};


