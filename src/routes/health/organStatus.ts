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

import { ISpinalAPIMiddleware } from '../../interfaces';
import * as express from 'express';

import { HealthStatus,OrganStatus } from './interfacesHealth';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/organStatus:
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
   *                $ref: '#/components/schemas/OrganStatus'
   *       400:
   *         description: Bad request
   */

  app.get('/api/v1/organStatus', async (req, res, next) => {
    function isWithinTimeLimit(timeStamp) {
      const timeLimit = Date.now() - 5 * 60 * 1000; 
      return timeStamp >= timeLimit && timeStamp <= Date.now(); 
    }

    const organDown = [];
    try {
      spinalAPIMiddleware.conn.load(
        '/etc/Organs/Monitoring',
        async (directory: spinal.Directory) => {
          if (!directory) return;
          for (const file of directory) {
            const fileLoaded = await file.load();
            if (file._info.model_type.get() === 'ConfigFile') {
              console.log("testing file ", fileLoaded.genericOrganData.name.get());

              if (!fileLoaded.genericOrganData) continue;
             
              if (
                !isWithinTimeLimit(
                  fileLoaded.genericOrganData.lastHealthTime.get()
                )
              ) {
                const infoOrganHealth = {
                  name: fileLoaded.genericOrganData?.name?.get(),
                  bootTimestamp:
                    fileLoaded.genericOrganData?.bootTimestamp?.get(),
                  lastHealthTime:
                    fileLoaded.genericOrganData?.lastHealthTime?.get(),
                  ramRssUsed: fileLoaded.genericOrganData?.ramRssUsed?.get(),
                  logList: [],
                };
                organDown.push(infoOrganHealth);
              }
            }
          }
        }
      );
      spinalAPIMiddleware.conn.load_or_make_dir(
        '/etc/Organs',
        async (directory: spinal.Directory) => {
          for (const file of directory) {
            const fileLoaded = await file.load();
            if (file._info.model_type.get() === 'ConfigFile') {
              if (!fileLoaded.genericOrganData) continue;
              if (
                !isWithinTimeLimit(
                  fileLoaded.genericOrganData.lastHealthTime.get()
                )
              ) {
                const infoOrganHealth = {
                  name: fileLoaded.genericOrganData?.name?.get(),
                  bootTimestamp:
                    fileLoaded.genericOrganData?.bootTimestamp?.get(),
                  lastHealthTime:
                    fileLoaded.genericOrganData?.lastHealthTime?.get(),
                  ramRssUsed: fileLoaded.genericOrganData?.ramRssUsed?.get(),
                  logList: [],
                };
                organDown.push(infoOrganHealth);
              }
            }
          }

          const healObject = {
            message:
              organDown.length === 0
                ? 'All organs are up'
                : 'Some organs are down',
            organs_down: organDown,
          };
          res.send(healObject);
        }
      );
    } catch (error) {
      console.error(error);
      res.status(400).send('list of healthStatus organs is not loaded');
    }
  });
};
