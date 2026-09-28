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

import {
  type SpinalContext,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
import type { Lst } from 'spinal-core-connectorjs';
import { FileSystem } from 'spinal-core-connectorjs_type';
import type { ISpinalAPIMiddleware } from '../../../interfaces/ISpinalAPIMiddleware';
import {
  SpinalGraphService,
  SpinalNode,
} from 'spinal-env-viewer-graph-service';
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
import { FileExplorer } from 'spinal-env-viewer-plugin-documentation-service';
import { awaitSync } from '../../../utilities/awaitSync';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getSpatialContext } from '../../../utilities/getSpatialContext';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';
import {
  createSpinalUser,
  createSpinalUserContext,
  getSpinalUser,
  getSpinalUserContexts,
} from 'spinal-model-user-service';

module.exports = function (
  logger: any,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  type TicketCreationMode = 'regular' | 'fast';

  /**
   * @swagger
   * /api/v1/ticket/create_ticket:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Declare a ticket
   *     description: >-
   *       Creates a ticket in a process of a workflow and attaches it to the element it concerns. The
   *       workflow and the process are each named either by dynamic ID or by name, and the element is
   *       given as `nodeDynamicId` or `nodeStaticId` - one of the two is required.
   *
   *
   *       **Creation modes** (`mode` query parameter) :
   *
   *        * `regular` (default) - everything is written before the answer : the ticket is placed in
   *          the first step of the process, linked to its element, and its images, attributes and
   *          declarer are attached. The `dynamicId` returned is ready to use.
   *
   *        * `fast` - the ticket node is created and answered immediately with **201**, while the rest
   *          (placing it in the process and step, linking the element, images, attributes, declarer) is
   *          finished **in the background**. Use it when a caller must not wait; the trade-off is that
   *          the ticket is briefly incomplete and a background failure is not reported back.
   *
   *
   *       `additionalAttributes` maps a category name to the attributes to set in it, creating both if
   *       needed. `email` attaches the declarer as a Spinal user, creating the user if it does not
   *       exist yet. Images are attached as documents of the ticket.
   *
   *
   *       This route accepts a request body of up to 500 MB, so images can be sent inline.
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *       - in: query
   *         name: mode
   *         required: false
   *         schema:
   *           type: string
   *           enum: [regular, fast]
   *           default: regular
   *         description: >-
   *           `regular` finishes every write before answering; `fast` answers as soon as the ticket
   *           node exists and finishes the rest in the background. Any other value is rejected.
   *     requestBody:
   *       description: >-
   *         For `workflow` and `process`, either the dynamic ID or the name may be given. To attach the
   *         ticket to an element, provide `nodeDynamicId` or `nodeStaticId`.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - workflow
   *               - process
   *               - name
   *               - priority
   *               - description
   *             properties:
   *               workflow:
   *                 description: The workflow's dynamicId or name.
   *                 oneOf:
   *                   - type: string
   *                   - type: integer
   *               process:
   *                 description: The process's dynamicId or name, inside that workflow.
   *                 oneOf:
   *                   - type: string
   *                   - type: integer
   *               nodeDynamicId:
   *                 type: integer
   *                 description: Dynamic ID of the element the ticket is about. Provide either this or nodeStaticId.
   *               nodeStaticId:
   *                 type: string
   *                 description: Static ID of the element. Used when nodeDynamicId is not provided.
   *               name:
   *                 type: string
   *                 description: The ticket's name.
   *               priority:
   *                 type: integer
   *                 enum: [0, 1, 2]
   *                 description: "Priority : 0 (OCCASIONALLY), 1 (NORMAL), 2 (URGENT)."
   *               description:
   *                 type: string
   *               declarer_id:
   *                 type: string
   *                 description: Optional - free-text identifier of whoever declares the ticket.
   *               email:
   *                 type: string
   *                 description: >-
   *                   Optional - email of the declarer. The matching Spinal user is attached to the
   *                   ticket, and created if it does not exist.
   *               images:
   *                 type: array
   *                 description: Optional - images attached to the ticket as documents.
   *                 items:
   *                   type: object
   *                   properties:
   *                     name:
   *                       type: string
   *                     value:
   *                       type: string
   *                       description: The image content, base64 encoded.
   *                     comments:
   *                       type: string
   *               additionalAttributes:
   *                 type: object
   *                 description: >-
   *                   Optional - attributes to set on the ticket, keyed by category name. Missing
   *                   categories and attributes are created.
   *                 additionalProperties:
   *                   type: object
   *                   additionalProperties: true
   *                 example:
   *                   categoryName1:
   *                     attributeName1: "value1"
   *                     attributeName2: "value2"
   *                   categoryName2:
   *                     attributeName3: "value3"
   *     responses:
   *       201:
   *         description: >-
   *           The ticket was created. In `fast` mode it is answered before the ticket is fully
   *           attached.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Ticket'
   *       400:
   *         description: >-
   *           A required field is missing, `mode` is not a known value, the workflow or process could
   *           not be resolved, or neither `nodeDynamicId` nor `nodeStaticId` designates a node
   *           ("invalid nodeDynamicId or nodeStaticId").
   *       401:
   *         description: The profile is not allowed to write on the workflow or the element.
   */
  app.post(
    '/api/v1/ticket/create_ticket',
    validateTicketCreationData,
    routeTicketCreationByMode
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
      email,
    } = req.body;
    const missing: string[] = [];
    if (!workflow) missing.push('workflow');
    if (!process) missing.push('process');
    // a target node must be provided via either nodeDynamicId or nodeStaticId
    if (!nodeDynamicId && !nodeStaticId) {
      missing.push('nodeDynamicId or nodeStaticId (one is required)');
    } else if (nodeDynamicId && isNaN(+nodeDynamicId)) {
      missing.push('nodeDynamicId (must be a number)');
    } else if (!nodeDynamicId && typeof nodeStaticId !== 'string') {
      missing.push('nodeStaticId (must be a string)');
    }
    if (priority === undefined) missing.push('priority');
    if (!name || typeof name !== 'string')
      missing.push('name (must be a string)');
    if (!description || typeof description !== 'string')
      missing.push('description (must be a string)');
    if (email && typeof email !== 'string')
      missing.push('email (must be a string)');
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

  function parseTicketCreationMode(mode: unknown): TicketCreationMode {
    if (mode === undefined || mode === null || mode === '') return 'regular';
    if (typeof mode !== 'string') throw { code: 400, message: 'Invalid mode' };
    const normalizedMode = mode.toLowerCase();
    if (normalizedMode !== 'regular' && normalizedMode !== 'fast') {
      throw {
        code: 400,
        message: 'Invalid mode: use "regular" or "fast"',
      };
    }
    return normalizedMode;
  }

  async function getTicketCreationPrerequisites(req: express.Request) {
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
    if (!workflowNode) {
      throw {
        code: 404,
        message: 'Could not find the workflow : ' + req.body.workflow,
      };
    }

    const processNode = await getProcessNode(
      workflowNode,
      req.body.process,
      spinalAPIMiddleware,
      profileId
    );

    if (!processNode) {
      throw {
        code: 404,
        message: 'Could not find the process : ' + req.body.process,
      };
    }

    if (!processNode.belongsToContext(workflowNode)) {
      throw {
        code: 400,
        message:
          'The process exists, but is not part of the workflow given : ' +
          req.body.workflow,
      };
    }

    return {
      profileId,
      ticketInfo,
      workflowNode,
      processNode,
      email: req.body.email,
    };
  }

  async function routeTicketCreationByMode(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const mode = parseTicketCreationMode(req.query.mode);
      if (mode === 'fast') return createTicketFast(req, res);
      return createTicketRegular(req, res);
    } catch (error: any) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(400).send({ ko: error });
    }
  }

  async function createTicketRegular(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const { profileId, ticketInfo, workflowNode, processNode, email } =
        await getTicketCreationPrerequisites(req);

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
        targetNode,
        'Ticket'
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
        dynamicId: ticketCreatedNode._server_id!,
        staticId: ticketCreatedNode.info.id.get(),
        name: infoFromTicket.name || ticketCreatedNode.info.name.get(),
        type: ticketCreatedNode.info.type.get(),
        elementSelected: targetNode._server_id!,
        priority: +infoFromTicket.priority,
        description: infoFromTicket.description,
        declarer_id: infoFromTicket.declarer_id,
        creationDate: +infoFromTicket.creationDate,
      };

      const errorImages = await uploadTicketImages(
        ticketCreatedNode,
        infoFromTicket.declarer_id,
        req.body.images
      );
      if (errorImages.length > 0) {
        info.errorImages = 'error uploading images : ' + errorImages.join(', ');
      }

      // Add additional attributes if provided
      if (req.body.additionalAttributes) {
        await applyAdditionalAttributes(
          ticketCreatedNode,
          req.body.additionalAttributes
        );
      }
      if (email) {
        addTicketToUser(profileId, email, ticketCreatedNode);
      }
      return res.status(201).json(info);
    } catch (error: any) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(400).send({ ko: error });
    }
  }

  async function createTicketFast(req: express.Request, res: express.Response) {
    try {
      const { profileId, ticketInfo, workflowNode, processNode, email } =
        await getTicketCreationPrerequisites(req);
      //@ts-ignore
      const ticketNode = new SpinalNode(
        ticketInfo.name,
        'SpinalSystemServiceTicketTypeTicket'
      );
      FileSystem._objects_to_send.set(ticketNode.model_id, ticketNode);
      //@ts-ignore
      FileSystem._send_data_to_hub_func();


      const creationDate = Date.now();

      await awaitSync(ticketNode);
      const info: Record<string, string | number> = {
        dynamicId: ticketNode._server_id!,
        staticId: ticketNode.info.id.get(),
        name: ticketNode.info.name.get(),
        type: ticketNode.info.type.get(),
        elementSelected: req.body.nodeDynamicId ?? req.body.nodeStaticId,
        description: ticketInfo.description,
        priority: ticketInfo.priority,
        declarer_id: ticketInfo.declarer_id,
        creationDate,
      };

      const images = Array.isArray(req.body.images) ? req.body.images : [];
      const additionalAttributes = req.body.additionalAttributes || null;

      void finalizeFastTicketCreationInBackground(
        profileId,
        ticketInfo,
        workflowNode,
        processNode,
        ticketNode,
        req.body.nodeDynamicId,
        req.body.nodeStaticId,
        email,
        images,
        additionalAttributes
      );

      return res.status(201).json(info);
    } catch (error: any) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(400).send({ ko: error });
    }
  }

  async function finalizeFastTicketCreationInBackground(
    profileId: string,
    ticketInfo: {
      name: string;
      priority: number;
      description: string;
      declarer_id?: string;
    },
    workflowNode: SpinalContext,
    processNode: SpinalNode,
    ticketNode: SpinalNode,
    nodeDynamicId: number,
    nodeStaticId: string | undefined,
    email: string | undefined,
    images: any[] = [],
    additionalAttributes: any = null
  ) {
    try {
      const targetNode = await fetchSpinalNodeTarget(
        spinalAPIMiddleware,
        profileId,
        nodeDynamicId,
        nodeStaticId
      );
      if (!targetNode) {
        console.error(
          '[createTicketFast] invalid nodeDynamicId or nodeStaticId in deferred creation'
        );
        return;
      }

      const ticketCreatedNode = await addTicket(
        ticketInfo,
        processNode,
        workflowNode,
        targetNode,
        'Ticket',
        ticketNode
      );

      await awaitSync(ticketCreatedNode);
      const infoFromTicket = await getTicketInfo(ticketCreatedNode);
      const errorImages = await uploadTicketImages(
        ticketCreatedNode,
        infoFromTicket.declarer_id,
        images
      );
      if (errorImages.length > 0) {
        console.error(
          `[createTicketFast] image upload errors: ${errorImages.join(', ')}`
        );
      }

      // Add additional attributes if provided
      if (additionalAttributes) {
        try {
          await applyAdditionalAttributes(
            ticketCreatedNode,
            additionalAttributes
          );
        } catch (error) {
          console.error(
            '[createTicketFast] error applying additional attributes:',
            error
          );
        }
      }

      if (email) {
        addTicketToUser(profileId, email, ticketCreatedNode);
      }
    } catch (error) {
      console.error('[createTicketFast] deferred creation failed:', error);
    }
  }

  async function uploadTicketImages(
    ticketNode: SpinalNode,
    declarerId: string,
    images: any[]
  ): Promise<string[]> {
    const errorImages: string[] = [];
    if (!images || images.length === 0) return errorImages;

    for (const image of images) {
      // @ts-ignore
      const user = {
        username: declarerId || 'user',
        userId: 0,
      };
      try {
        const imageBufferData = processImageBase64(image.value as string);
        await FileExplorer.uploadFiles(ticketNode, {
          name: image.name,
          buffer: imageBufferData,
        });
        // await serviceDocumentation.addFileAsNote( // BAD PERFORMANCE, ADDING NOTES TURNED OUT TO BE VERY COSTLY BECAUSE THEY ARE ALL STORED IN SAME SPACE :c
        //   ticketNode,
        //   { name: image.name, buffer: imageBufferData },
        //   user
        // );
      } catch (error) {
        errorImages.push(image.name);
      }
    }
    return errorImages;
  }

  async function applyAdditionalAttributes(
    ticketNode: SpinalNode,
    additionalAttributes: any
  ): Promise<void> {
    if (!additionalAttributes || typeof additionalAttributes !== 'object') {
      return;
    }

    for (const categoryName of Object.keys(additionalAttributes)) {
      const attributes = additionalAttributes[categoryName];
      if (attributes && typeof attributes === 'object') {
        await serviceDocumentation.createOrUpdateAttrsAndCategories(
          ticketNode,
          categoryName,
          attributes
        );
      }
    }
  }

  async function addTicketToUser(
    profileId: string,
    email: string,
    ticketNode: SpinalNode
  ) {
    const graph = await spinalAPIMiddleware.getGraph();
    const userContexts = await getSpinalUserContexts(graph);
    let userContext = userContexts[0]; // Assuming the first context is the relevant one, adjust as needed
    if (!userContext) {
      const contextName = 'Default User Context';
      const contextData = await createSpinalUserContext(graph, contextName);
      userContext = contextData.context;
      const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
      if (userGraph && userGraph !== graph)
        await userGraph.addContext(userContext);
    }
    // get user in context by email
    let user = await getSpinalUser(userContext, email);
    // if not found create a new user with this email
    if (!user) {
      user = await createSpinalUser(userContext, email);
    }
    // add the ticket to the user with a 'UserHasTicket' relation
    await user.addChild(
      ticketNode,
      'UserHasTicket',
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }
};

/**
 * Helper function to process base64 image string, stripping data URL prefix if present.
 */
function processImageBase64(base64Image: string): Buffer | undefined {
  // check if data base64
  if (/^data:image\/\w+;base64,/.test(base64Image) === true) {
    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBufferData = Buffer.from(imageData, 'base64');
    return imageBufferData;
  }
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
): Promise<SpinalNode | undefined> {
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
): Promise<SpinalNode | undefined> {
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
): Promise<SpinalNode | undefined> {
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
