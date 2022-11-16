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
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import spinalAPIMiddleware from '../../../app/spinalAPIMiddleware';
import * as express from 'express';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/workflow/create:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: create a workflow
   *     summary: create a workflow
   *     tags:
   *       - Workflow & ticket
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nameWorkflow
   *             properties:
   *               nameWorkflow:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: create not Successfully
   */
  app.post('/api/v1/workflow/create', async (req, res, next) => {
    try {
      const graph = await spinalAPIMiddleware.getGraph();
      var childrens = await graph.getChildren('hasContext');
      for (const child of childrens) {
        if (child.getName().get() === req.body.nameWorkflow) {
          return res.status(400).send('the name context already exists');
        }
      }
      if (req.body.nameWorkflow !== 'string') {
        await serviceTicketPersonalized.createContext(
          req.body.nameWorkflow,
          []
        );
      } else {
        return res.status(400).send('string is invalide name');
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send('ko');
    }
    res.json();
  });
};
