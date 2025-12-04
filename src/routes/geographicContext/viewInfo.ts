/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

import type { Response, Request, Express } from 'express';
import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from '../../utilities/requestUtilities';
import {
  viewInfo_func,
  type IViewInfoBody,
  type IViewInfoRes,
} from './viewInfo_func';

type ViweInfoRes = Response<string | IViewInfoRes[], IViewInfoBody>;
type ViweInfoReq = Request<never, IViewInfoRes[] | string, IViewInfoBody>;

export default function (
  logger,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/geographicContext/viewInfo:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: Fetches view information based on the geographical context for specified IDs and options
   *     summary: Fetch view information for geographical context
   *     tags:
   *       - Geographic Context
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - dynamicId
   *             properties:
   *               dynamicId:
   *                 type: integer
   *                 format: int64
   *                 description: Unique identifier for the node
   *               floorRef:
   *                 type: boolean
   *                 description: Flag to include floor reference, defaults to false
   *               roomRef:
   *                 type: boolean
   *                 description: Flag to include room reference, defaults to true
   *               equipements:
   *                 type: boolean
   *                 description: Flag to include equipment details, defaults to false
   *     responses:
   *       200:
   *         description: Successfully retrieved view information
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   dynamicId:
   *                     type: integer
   *                     format: int64
   *                     description: Server ID of the node
   *                   data:
   *                     type: array
   *                     items:
   *                       type: object
   *                       properties:
   *                         bimFileId:
   *                           type: string
   *                           description: Identifier for the BIM file
   *                         dbIds:
   *                           type: array
   *                           items:
   *                             type: string
   *                           description: Database IDs associated with the node
   *       206:
   *         description: Some retrieved informations were not found and are omitted from the response, content type same as 200
   *       400:
   *         description: Bad request, typically missing required 'dynamicId'
   */
  app.post(
    '/api/v1/geographicContext/viewInfo',
    async (req: ViweInfoReq, res: ViweInfoRes): Promise<void> => {
      try {
        const body = req.body;
        const profilId = getProfileId(req);
        const options: Required<IViewInfoBody> = {
          dynamicId: body.dynamicId,
          floorRef: body.floorRef || false,
          roomRef: body.roomRef || true,
          equipements: body.equipements || false,
        };
        const result = await viewInfo_func(
          spinalAPIMiddleware,
          profilId,
          options
        );
        if (result.dataType === 'text')
          res.status(result.code).send(result.data);
        else if (result.dataType === 'json')
          res.status(result.code).json(result.data);
      } catch (error) {
        logger?.error?.(
          `Error in viewInfo route: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        res.status(500).send('Internal server error');
      }
    }
  );
}
