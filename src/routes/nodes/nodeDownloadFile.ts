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
import * as fs from 'fs';
import config from '../../config';
var http, hubUri;

if (config.spinalConnector.protocol === 'https') {
  http = require('https');
  hubUri = `https://${config.spinalConnector.host}`;
} else {
  http = require('http');
  hubUri = `http://${config.spinalConnector.host}`;
}
if (config.spinalConnector.port) {
  hubUri = `${hubUri}:${config.spinalConnector.port}`;
}
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{id}/download_file:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: Download a Doc
   *     summary: Download a Doc
   *     tags:
   *       - Nodes
   *     parameters:
   *       - in: path
   *         name: id
   *         description: use the dynamic ID
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     responses:
   *       200:
   *         description: Download Successfully
   *       400:
   *         description: Download not Successfully
   */

  app.use('/api/v1/node/:id/download_file', async (req, res, next) => {
    try {
      await spinalAPIMiddleware.getGraph();
      var path = await spinalAPIMiddleware.load<spinal.File>(
        parseInt(req.params.id, 10)
      );
      var p = await down(path);
      res.download(p, (error) => {
        // remove file after 1min
        setTimeout(() => {
          fs.unlink(p, () => {});
        }, 60000);
      });
    } catch (error) {
      console.log(error);
      res.status(400).send('ko');
    }
  });
};

function down(path: spinal.File): Promise<string> {
  return new Promise((resolve, reject) => {
    path.load((argPath) => {
      const p = `${__dirname}/${path.name.get()}`;
      const f = fs.createWriteStream(p);
      http.get(
        `${hubUri}/sceen/_?u=${argPath._server_id}`,
        function (response) {
          response.pipe(f);
          response.on('end', async () => {
            resolve(p);
          });
          response.on('error', function (err) {
            console.log(err);
          });
        }
      );
    });
  });
}
