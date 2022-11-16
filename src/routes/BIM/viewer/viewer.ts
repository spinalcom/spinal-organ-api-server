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

var proxy = require('express-http-proxy');

import morgan = require('morgan');
function createUrl(urlStr, port) {
  urlStr = urlStr.startsWith('http') ? urlStr : `http://${urlStr}`;
  urlStr = typeof port !== 'undefined' ? `${urlStr}:${port}` : urlStr;
  const url = new URL(urlStr);
  return url;
}

module.exports = function (logger, app, spinalAPIMiddleware) {
  let hubUrl = createUrl(spinalAPIMiddleware.config.spinalConnector.host, spinalAPIMiddleware.config.spinalConnector.port);
  const proxyHub = proxy(hubUrl.origin, {
    limit: '1tb', // 1 tb
    proxyReqPathResolver: function (req) {
      return `${hubUrl.origin}/html/viewerForgeFiles${req.url}`;
    },
  });

  /**
   * @swagger
   * /BIM/file:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: route of the static bim files
   *     tags:
   *       - BIM
   *     responses:
   *       200:
   *         description: the file
   *       404:
   *         description: not found
   */
  app.use('/BIM/file', morgan('tiny'), proxyHub);
};
