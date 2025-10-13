/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { Lst } from 'spinal-core-connectorjs';
import type { ISpinalAPIMiddleware } from '../../../interfaces/ISpinalAPIMiddleware';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import * as express from 'express';
import {
  addTicket,
  getAllTicketProcess,
  getTicketContexts,
  getTicketInfo,
  getTicketsFromNode,
  PROCESS_TYPE,
  TICKET_CONTEXT_TYPE,
} from 'spinal-service-ticket';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { awaitSync } from '../../../utilities/awaitSync';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getSpatialContext } from '../../../utilities/getSpatialContext';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

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
   *       description: For the two parameters *workflow* and *process* you can use either the dynamicId or the name. To associate the ticket with an element, please fill in the dynamicId parameter
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - workflow
   *               - process
   *               - nodeDynamicId
   *               - name
   *               - priority
   *               - description
   *             properties:
   *               workflow:
   *                 description: The workflow's dynamicId or name
   *                 oneOf:
   *                   - type: string
   *                   - type: integer
   *               process:
   *                 description: The process's dynamicId or name
   *                 oneOf:
   *                   - type: string
   *                   - type: integer
   *               nodeDynamicId:
   *                 type: integer
   *                 description: The node's target dynamicId
   *               nodeStaticId:
   *                 type: string
   *                 deprecated: true
   *                 description: (deprecated) The node's target staticId
   *               name:
   *                 type: string
   *                 description: The ticket's name
   *               priority:
   *                 type: integer
   *                 enum: [0, 1, 2]
   *                 description: "Priority levels — 0 (OCCASIONALLY), 1 (NORMAL), 2 (URGENT)"
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
   *       201:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Ticket'
   *       400:
   *         description: Add not Successfully
   */
  app.post(
    '/api/v1/ticket/create_ticket',
    validateTicketCreationData,
    createTicket
  );

  // validate the body
  function validateTicketCreationData(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const {
      workflow,
      process,
      nodeDynamicId,
      nodeStaticId,
      name,
      priority,
      description,
    } = req.body;
    const missing: string[] = [];
    if (!workflow) missing.push('workflow');
    if (!process) missing.push('process');
    if (!nodeDynamicId && !nodeStaticId) {
      missing.push('nodeDynamicId | nodeStaticId (one is required)');
    } else if (nodeDynamicId && isNaN(+nodeDynamicId)) {
      missing.push('nodeDynamicId (must be a number)');
    } 
    if (priority === undefined) missing.push('priority');
    if (!name || typeof name !== 'string')
      missing.push('name (must be a string)');
    if (!description || typeof description !== 'string')
      missing.push('description (must be a string)');

    if (missing.length > 0) {
      return res
        .status(400)
        .send('Missing required attributes: ' + missing.join(', '));
    }
    // validate and normalize priority to allowed values 0,1,2
    const priorityValue = Number(priority);
    if (
      !Number.isInteger(priorityValue) ||
      ![0, 1, 2].includes(priorityValue)
    ) {
      return res
        .status(400)
        .send(
          'Invalid priority: must be 0 (OCCASIONALLY), 1 (NORMAL), or 2 (URGENT)'
        );
    }

    next();
  }

  async function createTicket(req: express.Request, res: express.Response) {
    try {
      const profileId = getProfileId(req);
      const ticketInfo = {
        name: req.body.name,
        priority: Number(req.body.priority),
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
          .status(404)
          .send('Could not find the workflow : ' + req.body.workflow);
      const processNode = await getProcessNode(
        workflowNode,
        req.body.process,
        spinalAPIMiddleware,
        profileId
      );
      if (!processNode)
        return res
          .status(404)
          .send('Could not find the process : ' + req.body.process);
      if (!processNode.belongsToContext(workflowNode)) {
        return res
          .status(400)
          .send(
            'The process exists, but is not part of the workflow given : ' +
              req.body.workflow
          );
      }

      const targetNode = await fetchSpinalNodeTarget(
        spinalAPIMiddleware,
        profileId,
        req.body.nodeDynamicId,
        req.body.nodeStaticId
      );
      if (!targetNode)
        return res.status(400).send('invalid nodeDynamicId or nodeStaticId');

      const ticketCreatedNode = await addTicket(
        ticketInfo,
        processNode,
        workflowNode,
        targetNode
      );

      await purgeEmptyChildren(targetNode);

      const ticketList = await getTicketsFromNode(targetNode);

      const linkedTicket = ticketList.find(
        (element) => element.info.id.get() === ticketCreatedNode.info.id.get()
      );

      if (!linkedTicket) {
        return res
          .status(400)
          .send(
            `Ticket created, but could not be found to be linked to node : ${targetNode
              .getName()
              .get()}, the images might not be uploaded correctly too`
          );
      }

      await awaitSync(ticketCreatedNode);
      const infoFromTicket = await getTicketInfo(ticketCreatedNode);
      const info: Record<string, string | number> = {
        dynamicId: ticketCreatedNode._server_id,
        staticId: ticketCreatedNode.info.id.get(),
        name: infoFromTicket.name || ticketCreatedNode.info.name.get(),
        type: ticketCreatedNode.info.type.get(),
        elementSelcted: targetNode._server_id,
        priority: +infoFromTicket.priority,
        description: infoFromTicket.description,
        declarer_id: infoFromTicket.declarer_id,
        creationDate: +infoFromTicket.creationDate,
      };

      const errorImages: string[] = [];
      if (req.body.images && req.body.images.length > 0) {
        for (const image of req.body.images) {
          // @ts-ignore
          const user = {
            username: infoFromTicket.declarer_id || 'user',
            userId: 0,
          };
          try {
            const imageBufferData = processImageBase64(image.value as string);
            await serviceDocumentation.addFileAsNote(
              ticketCreatedNode,
              { name: image.name, buffer: imageBufferData },
              user
            );
          } catch (error) {
            errorImages.push(image.name);
          }
        }
      }
      if (errorImages.length > 0) {
        info.errorImages = 'error uploading images : ' + errorImages.join(', ');
      }
      return res.status(201).json(info);
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(400).send({ ko: error });
    }
  }
};

/**
 * Helper function to process base64 image string, stripping data URL prefix if present.
 */
function processImageBase64(base64Image: string): Buffer {
  if (base64Image.startsWith('data:image/')) {
    const indexOfComma = base64Image.indexOf(',');
    if (indexOfComma !== -1) {
      base64Image = base64Image.slice(indexOfComma + 1);
    }
  }
  return Buffer.from(base64Image, 'base64');
}

async function purgeEmptyChildren(targetNode: SpinalNode) {
  // load the SpinalRelation children list
  const lst: Lst =
    await targetNode.children?.PtrLst?.SpinalSystemServiceTicketHasTicket?.children?.load();
  if (lst) {
    const toRemove = [];
    for (const x of lst) {
      if (x.info == undefined) {
        toRemove.push(x);
      }
    }
    for (const emptyModel of toRemove) {
      lst.remove(emptyModel);
    }
  }
}

async function getWorkflowNode(
  workflowIdOrName: string | number,
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string
) {
  try {
    const workflowId = +workflowIdOrName;
    if (!isNaN(workflowId)) {
      return loadAndValidateNode(
        spinalAPIMiddleware,
        workflowId,
        profileId,
        TICKET_CONTEXT_TYPE
      );
    }
    // try to find the workflow by name
    const allContexts = await getTicketContexts();
    for (const context of allContexts) {
      if (context.info.name.get() === workflowIdOrName) {
        return context;
      }
    }
  } catch (error) {
    return undefined;
  }
}

async function getProcessNode(
  contextWorkflowNode: SpinalContext,
  processIdOrName: string | number,
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string
): Promise<SpinalNode> {
  try {
    const processId = +processIdOrName;
    if (!isNaN(processId)) {
      return loadAndValidateNode(
        spinalAPIMiddleware,
        processId,
        profileId,
        PROCESS_TYPE
      );
    }
    // try to find the process by name
    const ticketProcesses = await getAllTicketProcess(contextWorkflowNode);
    for (const ticketProcess of ticketProcesses) {
      if (ticketProcess.info.name.get() === processIdOrName) {
        return ticketProcess;
      }
    }
  } catch (error) {
    return undefined;
  }
}

async function fetchSpinalNodeTarget(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  dynamicId?: number,
  staticId?: string
): Promise<SpinalNode> {
  if (dynamicId) {
    try {
      const node: SpinalNode = await loadAndValidateNode(
        spinalAPIMiddleware,
        +dynamicId,
        profileId
      );
      return node;
    } catch (error) {
      return undefined;
    }
  }

  if (staticId && typeof staticId === 'string') {
    const node = SpinalGraphService.getRealNode(staticId);
    if (node !== undefined) return node;
    const context = await getSpatialContext(spinalAPIMiddleware, profileId);
    if (context === undefined) return undefined;
    for await (const node of context.visitChildrenInContext(context)) {
      if (node.info.id.get() === staticId) {
        return node;
      }
    }
  }
}
