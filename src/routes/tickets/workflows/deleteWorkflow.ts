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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
  * @swagger
  * /api/v1/workflow/{id}/delete:
  *   delete:
  *     security:
  *       - bearerAuth:
  *         - read
  *     description: Delete a workflow
  *     summary: delete an workflow
  *     tags:
  *       - Workflow & ticket
  *     parameters:
  *      - in: path
  *        name: id
  *        description: use the dynamic ID
  *        required: true
  *        schema:
  *          type: integer
  *          format: int64
  *     responses:
  *       200:
  *         description: Delete Successfully
  *       400:
  *         description: Bad request
  */

  app.delete("/api/v1/workflow/:id/delete", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      const workflow = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      if (workflow.getType().get() === "SpinalSystemServiceTicket") {
        workflow.removeFromGraph();
      }
      else {
        res.status(400).send("this context is not a SpinalSystemServiceTicket");
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  })
}
