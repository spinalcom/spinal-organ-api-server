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

import { z } from 'zod';
import validate from 'express-zod-safe';
import { getProfileId } from '../../../utilities/requestUtilities';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { Express } from 'express';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user/context:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: create a user context
   *     summary: create a user context
   *     tags:
   *       - User Context
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 200
   *                 description: name of the user context to create
   *     responses:
   *       201:
   *         description: Create Successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: failed to create user context
   *       401:
   *         description: no graph found for the user
   */
  app.post(
    '/api/v1/user/context',
    validate({
      body: z.strictObject({
        name: z.string().max(200),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph) res.status(401).send(`No graph found for ${profileId}`);

        console.log(
          'Creating user context with name:',
          req.body.name,
          'and type:',
          req.body.type
        );

        res.status(201).json();
      } catch (error: any) {
        if (error.code && error.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send('An unexpected error occurred while creating the user context');
      }
    }
  );
};
