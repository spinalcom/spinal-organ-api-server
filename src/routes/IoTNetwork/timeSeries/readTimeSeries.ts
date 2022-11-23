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

import { SpinalContext, SpinalGraphService, SpinalNode } from 'spinal-env-viewer-graph-service'
import spinalServiceTimeSeries from '../spinalTimeSeries'
import SpinalAPIMiddleware from '../../../app/spinalAPIMiddleware';
import { CurrentValue } from '../interfacesEndpointAndTimeSeries'
import asyncIteratorToArray from '../../../utilities/asyncToArray'
import { verifDate } from "../../../utilities/dateFunctions";

import * as express from 'express';
import * as moment from 'moment'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {  /**
  /**
 * @swagger
 * /api/v1/endpoint/{id}/timeSeries/read/{begin}/{end}:
 *   get:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: get time series 
 *     summary: get time series
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
 *      - in: path
 *        name: begin
 *        description: Date Format is DD-MM-YYYY HH:mm:ss or DD MM YYYY HH:mm:ss
 *        required: true
 *        schema:
 *          type: string
 *      - in: path
 *        name: end
 *        description: Date Format is DD-MM-YYYY hh:mm:ss or DD MM YYYY HH:mm:ss
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Timeserie'
 *       400:
 *         description: Bad request
  */


  app.get("/api/v1/endpoint/:id/timeSeries/read/:begin/:end", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      var node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId)
      // @ts-ignore
      SpinalGraphService._addNode(node);

      if (verifDate(req.params.begin) === 1 || verifDate(req.params.end) === 1) {
        throw "invalid date";
      } else {
        const timeSeriesIntervalDate = {
          start: verifDate(req.params.begin),
          end: verifDate(req.params.end)
        }
        var datas = await spinalServiceTimeSeries().getData(node.getId().get(), timeSeriesIntervalDate)
      }

    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      return res.status(400).send("ko")
    }
    res.json(datas);
  })

}
