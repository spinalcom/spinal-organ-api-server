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
  import spinalAPIMiddleware from '../../spinalAPIMiddleware';
  import * as express from 'express';
  import { serviceTicketPersonalized } from 'spinal-service-ticket';
  import { getTicketListInfo } from '../../utilities/getTicketListInfo';
  
  module.exports = function (
    logger,
    app: express.Express,
    spinalAPIMiddleware: spinalAPIMiddleware
  ) {  
    /**
     * @swagger
     * /api/v1/node/ticket_list_multiple:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Returns a list of ticket objects for multiple nodes
     *     summary: Get list of ticket objects for multiple nodes
     *     tags:
     *       - Nodes
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *           example:
     *             - 1
     *             - 2
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: array
     *                 items:
     *                   $ref: '#/components/schemas/Ticket'
     *       400:
     *         description: Bad request
     *       500:
     *         description: Server error
     */
    app.post('/api/v1/node/ticket_list_multiple', async (req, res, next) => {
      const results = [];
      try {
        const ids: number[] = req.body;
        if (!Array.isArray(ids)) {
          return res.status(400).send('Expected an array of IDs.');
        }
  
        for (let id of ids) {
          const nodes = await getTicketListInfo(spinalAPIMiddleware, id);
          results.push(nodes);
        }
      } catch (error) {
        console.error(error);
        return res
          .status(400)
          .send('An error occurred while fetching ticket list.');
      }
      res.json(results);
    });
  };
  