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

import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { Lst, spinalCore, Model } from "spinal-core-connectorjs";
import * as path from "path";

import { HealthStatus } from './interfacesHealth';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/healthStatus:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Return list of health Status organ
   *     summary: Gets a list of health Status organ
   *     tags:
   *      - Health
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/HealthStatus'
   *       400:
   *         description: Bad request
   */

  app.get('/api/v1/healthStatus', async (req, res, next) => {
    let organs = [];
    try {
      const fileName = "spinal-organ-api-server-config";
      spinalAPIMiddleware.conn.load_or_make_dir("/etc/Organs", async (directory: spinal.Directory) => {
        for (const file of directory) {
          var fileLoaded = await file.load()
          if (file._info.model_type.get() === "ConfigFile") {
            let state: string;
            function isWithinTwoMinutes(timestamp) {
              var twoMinutesAgo = Date.now() - (2 * 60 * 1000); // calculate timestamp for 2 minutes ago
              return (timestamp >= twoMinutesAgo && timestamp <= Date.now()); // check if timestamp is within 2 minutes
            }
            if (isWithinTwoMinutes(fileLoaded.genericOrganData.lastHealthTime.get())) {
              state = "ON"
            } else {
              state = "OFF"
            }

            let infoHealth: HealthStatus = {
              name: fileLoaded.genericOrganData.name.get(),
              bootTimestamp: fileLoaded.genericOrganData.bootTimestamp.get(),
              lastHealthTime: fileLoaded.genericOrganData.lastHealthTime.get(),
              ramHeapUsed: fileLoaded.genericOrganData.ramHeapUsed.get(),
              state: state,
              logList: []
            };
            organs.push(infoHealth)
          }
        }
        res.send(organs);
      })
    } catch (error) {
      console.error(error);
      res.status(400).send('list of healthStatus organs is not loaded');
    }
  });
};
