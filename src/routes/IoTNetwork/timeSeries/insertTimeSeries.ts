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

import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import spinalServiceTimeSeries from '../spinalTimeSeries'
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import * as moment from 'moment'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/endpoint/{id}/timeSeries/insert:
 *   post:
 *     security:
 *       - bearerAuth:
 *         - read
 *     description: insert new value
 *     summary: insert new value
 *     tags:
 *       - IoTNetwork & Time Series
 *     parameters:
 *      - in: path
 *        name: id
 *        description: use the dynamic ID
 *        required: true
 *        schema:
 *          type: integer
 *          format: int64
 *     requestBody:
 *       description: the date format is "DD-MM-YYYY HH:mm:ss" or "DD MM YYYY HH:mm:ss" or "DD/MM/YYYY HH:mm:ss"
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newValue
 *               - date
 *             properties:
 *                newValue:
 *                 type: number
 *                date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Create Successfully
 *       400:
 *         description: Bad request
*/



  app.post("/api/v1/endpoint/:id/timeSeries/insert", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId)
      // @ts-ignore
      SpinalGraphService._addNode(node);
      const timeseries = await spinalServiceTimeSeries().getOrCreateTimeSeries(node.getId().get())
      const newValue = req.body.newValue;
      const date = moment(req.body.date, ["DD-MM-YYYY HH:mm:ss", "DD MM YYYY HH:mm:ss", "DD/MM/YYYY HH:mm:ss"], true)
      await timeseries.insert(newValue, date.toDate())


    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      res.status(400).send()
    }
    res.json();
  })

}
