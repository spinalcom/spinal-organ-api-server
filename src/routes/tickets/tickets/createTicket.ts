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
import { File, FileSystem, Lst, Ptr } from 'spinal-core-connectorjs';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Step } from '../interfacesWorkflowAndTickets';
import {
  getTicketContexts,
  serviceTicketPersonalized,
} from 'spinal-service-ticket';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { ServiceUser } from 'spinal-service-user';
import { awaitSync } from '../../../utilities/awaitSync';
import { _load } from '../../../utilities/loadNode';
import { LocalFileData } from 'get-file-object-from-local-path';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import getNode from '../../../utilities/getNode';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/ticket/create_ticket:
   *   post:
   *     security:
   *       - bearerAuth:
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
  app.post('/api/v1/ticket/create_ticket', async (req, res) => {
    try {
      const profileId = getProfileId(req);

      const ticketInfo = {
        name: req.body.name,
        priority: req.body.priority,
        description: req.body.description,
        declarer_id: req.body.declarer_id,
      };
      await spinalAPIMiddleware.getGraph();
      const workflowNode = await getWorkflowNode(
        req.body.workflow,
        spinalAPIMiddleware,
        profileId
      );
      if (!workflowNode)
        return res
          .status(400)
          .send('Could not find the workflow : ' + req.body.workflow);
      const processNode = await getProcessNode(
        workflowNode,
        req.body.process,
        spinalAPIMiddleware,
        profileId
      );
      if (!processNode)
        return res
          .status(400)
          .send('Could not find the process : ' + req.body.process);

      const node = await getNode(
        spinalAPIMiddleware,
        req.body.nodeDynamicId,
        req.body.nodeStaticId,
        profileId
      );
      if (!node)
        return res.status(400).send('invalid nodeDynamicId or nodeStaticId');
      //@ts-ignore
      SpinalGraphService._addNode(node);
      //@ts-ignore
      SpinalGraphService._addNode(workflowNode);
      //@ts-ignore
      SpinalGraphService._addNode(processNode);

      if (!processNode.belongsToContext(workflowNode)) {
        return res
          .status(400)
          .send(
            'The process exists, but is not part of the workflow given : ' +
              req.body.workflow
          );
      }

      const ticketCreated = await serviceTicketPersonalized.addTicket(
        ticketInfo,
        processNode.getId().get(),
        workflowNode.getId().get(),
        node.getId().get()
      );

      // clear modèles vides :
      const lst =
        await node.children.PtrLst.SpinalSystemServiceTicketHasTicket.children.load();
      const toRemove = [];
      for (const x of lst) {
        if (x.info == undefined) {
          toRemove.push(x);
        }
      }
      for (const emptyModel of toRemove) {
        lst.remove(emptyModel);
      }
      // fin clear modèles vides

      const ticketList = await serviceTicketPersonalized.getTicketsFromNode(
        node.getId().get()
      );

      const linkedTicket = ticketList.find(
        (element) => element.id === ticketCreated
      );

      if (!linkedTicket) {
        return res
          .status(400)
          .send(
            `Ticket created, but could not be found to be linked to node : ${node
              .getName()
              .get()}`
          );
      }
      const realNodeTicket = SpinalGraphService.getRealNode(linkedTicket.id);
      await awaitSync(realNodeTicket);
      const info = {
        dynamicId: realNodeTicket._server_id,
        staticId: realNodeTicket.getId().get(),
        name: realNodeTicket.getName().get(),
        type: realNodeTicket.getType().get(),
        elementSelcted: req.body.nodeDynamicId,
        priority: realNodeTicket.info?.priority.get(),
        description: realNodeTicket.info?.description.get(),
        declarer_id: realNodeTicket.info?.declarer_id.get(),
        creationDate: realNodeTicket.info?.creationDate.get(),
      };

      if (req.body.images && req.body.images.length > 0) {
        // const objImage = new Lst(req.body.images);
        // realNodeTicket.info.add_attr('images', new Ptr(objImage));
        for (const image of req.body.images) {
          // @ts-ignore
          const user = {
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
      return res.json(info);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(400).send({ ko: error });
    }
  });
};

async function getWorkflowNode(
  workflowIdOrName: string,
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string
) {
  try {
    const allContexts = await getTicketContexts();
    for (const context of allContexts) {
      if (context.name === workflowIdOrName) {
        const result = SpinalGraphService.getRealNode(context.id);
        //@ts-ignore
        SpinalGraphService._addNode(result);
        return result;
      }
    }
    // at this point we couldn't find the workflow by name
    // we will try to find it by id
    const node: SpinalNode<any> = await spinalAPIMiddleware.load(
      parseInt(workflowIdOrName, 10),
      profileId
    );
    return node;
  } catch (error) {
    return undefined;
  }
}

async function getProcessNode(
  workflow: SpinalNode<any>,
  processIdOrName: string,
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string
): Promise<SpinalNode<any>> {
  try {
    const allProcess = await serviceTicketPersonalized.getAllProcess(
      workflow.getId().get()
    );
    for (const process of allProcess) {
      if (process.name.get() === processIdOrName) {
        const result = SpinalGraphService.getRealNode(process.id.get());
        //@ts-ignore
        SpinalGraphService._addNode(result);
        return result;
      }
    }
    // at this point we couldn't find the process by name
    // we will try to find it by id
    const node: SpinalNode<any> = await spinalAPIMiddleware.load(
      parseInt(processIdOrName, 10),
      profileId
    );
    return node;
  } catch (error) {
    return undefined;
  }
}
