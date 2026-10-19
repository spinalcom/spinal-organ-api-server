/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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

import validate from 'express-zod-safe';
import type { Express } from 'express';
import { SpinalContext } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getNodeData } from '../../../utilities/v2/node/getNodeData';
import {
  applyPreparedNode,
  prepareNodeCreation,
} from '../../../utilities/v2/node/prepareNodeCreation';
import { createErrorMsgItem } from '../../../utilities/v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../../utilities/v2/errorHandler/EApiErrorType';
import { sendResponseError } from '../../../utilities/v2/errorHandler/sendResponseError';
import { createContextSchema } from '../../../utilities/v2/node/creation/schema';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/context:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     tags: [context]
   *     summary: Create a context in the root and profile graphs
   *     description: |-
   *       Creates a `SpinalContext` from the supplied info and adds it to both the root graph and the current profile graph.
   *
   *       - The request body uses the same info, attributes and optional element fields as `POST /api/v2/node`; `parents` is not accepted.
   *       - The exact context name must not already exist in either graph. Name matching is case-sensitive.
   *       - If the profile graph is the root graph, the context is added only once.
   *       - Writes to the two graphs are not transactional. An error during the second graph write can leave the first write in place.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             additionalProperties: false
   *             required: [info]
   *             properties:
   *               info:
   *                 type: object
   *                 required: [name, type]
   *                 properties:
   *                   name:
   *                     type: string
   *                     minLength: 1
   *                     maxLength: 200
   *                   type:
   *                     type: string
   *                     minLength: 1
   *                     maxLength: 200
   *                 additionalProperties:
   *                   $ref: '#/components/schemas/INodeElementValue'
   *               attributes:
   *                 $ref: '#/components/schemas/ICreateNodeItemAttr'
   *               element:
   *                 $ref: '#/components/schemas/ICreateNodeElement'
   *           example:
   *             info:
   *               name: Energy Analysis
   *               type: Analysis
   *             attributes:
   *               Settings:
   *                 enabled: "true"
   *             element:
   *               unit: kWh
   *     responses:
   *       201:
   *         description: Context created and added to both graphs.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required: [data]
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/INodeItem'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       409:
   *         description: A context with the exact name already exists in the root or profile graph.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/IErrorItem'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
   */
  app.post(
    '/api/v2/context',
    validate({ body: createContextSchema }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const profileGraph =
          await spinalAPIMiddleware.getProfileGraph(profileId);
        const rootGraph = await spinalAPIMiddleware.getGraph();
        if (!profileGraph || !rootGraph) {
          throw createErrorMsgItem(
            EApiErrorType.ERROR_DATABASE,
            `No graph found for ${profileId}`
          );
        }

        const { info, attributes, element } = req.body;
        const existingInProfile = await profileGraph.getContext(info.name);
        const existingInRoot =
          profileGraph === rootGraph
            ? existingInProfile
            : await rootGraph.getContext(info.name);
        if (existingInProfile || existingInRoot) {
          throw createErrorMsgItem(
            EApiErrorType.CONFLICT,
            `A context named "${info.name}" already exists`
          );
        }

        const prepared = await prepareNodeCreation(
          info.name,
          info.type,
          info,
          element,
          attributes,
          undefined,
          spinalAPIMiddleware,
          profileId
        );
        const context = new SpinalContext(
          info.name,
          info.type,
          await prepared.getElement(true)
        );
        await applyPreparedNode(context, prepared);

        await rootGraph.addContext(context);
        if (profileGraph !== rootGraph) {
          await profileGraph.addContext(context);
        }

        return res
          .status(201)
          .json({ data: await getNodeData(context, true, true) });
      } catch (error) {
        sendResponseError(res, error);
      }
    }
  );
};
