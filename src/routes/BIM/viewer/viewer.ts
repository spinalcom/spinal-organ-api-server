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

import express from 'express';
import * as fs from 'fs';
const proxy = require('express-http-proxy');

import morgan = require('morgan');
function createUrl(urlStr, port, protocol) {
  urlStr = urlStr.startsWith(protocol) ? urlStr : `${protocol}://${urlStr}`;
  urlStr = typeof port !== 'undefined' ? `${urlStr}:${port}` : urlStr;
  const url = new URL(urlStr);
  return url;
}

module.exports = function (logger, app, spinalAPIMiddleware) {
  const hubUrl = createUrl(
    spinalAPIMiddleware.config.spinalConnector.host,
    spinalAPIMiddleware.config.spinalConnector.port,
    spinalAPIMiddleware.config.spinalConnector.protocol
  );
  // Cache policy for the viewer/BIM files.
  // A folder id embeds the model path + an upload timestamp, so a given id is
  // immutable: re-publishing a model produces a new id (a new URL). That makes a
  // long-lived, `immutable` cache safe and is the single biggest strain reducer,
  // since the viewer fetches many small files per model and reloads / different
  // users keep hitting the same building.
  //   BIM_FILE_CACHE_MAXAGE     max-age in seconds (0 / unset = no caching, the
  //                             historical behaviour)
  //   BIM_FILE_CACHE_IMMUTABLE  add the `immutable` directive (default on once a
  //                             max-age is set)
  const cacheMaxAgeSeconds =
    parseInt(process.env.BIM_FILE_CACHE_MAXAGE || '0', 10) || 0;
  const cacheImmutable =
    cacheMaxAgeSeconds > 0 &&
    ['1', 'true', 'yes'].includes(
      (process.env.BIM_FILE_CACHE_IMMUTABLE || '1').toLowerCase()
    );
  const cacheControl =
    cacheMaxAgeSeconds > 0
      ? `public, max-age=${cacheMaxAgeSeconds}${cacheImmutable ? ', immutable' : ''
      }`
      : null;
  if (cacheControl) {
    console.log(`[BIM/file] Cache-Control policy: ${cacheControl}`);
  }

  const proxyHub = proxy(hubUrl.origin, {
    limit: '1tb', // 1 tb
    proxyReqPathResolver: function (req) {
      const url = req.url;
      return `/html/viewerForgeFiles/${url.replace(/^\/+/, '')}`;
    },
    // Apply the same cache policy to files fetched from the hub so proxied
    // responses get cached by the browser too (only on successful responses).
    userResHeaderDecorator: cacheControl
      ? function (
        headers: any,
        _userReq: any,
        _userRes: any,
        _proxyReq: any,
        proxyRes: any
      ) {
        if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
          headers['cache-control'] = cacheControl;
        }
        return headers;
      }
      : undefined,
  });

  // Local file mode.
  // When BIM_FILE_LOCAL_PATH points to the spinalhub's `viewerForgeFiles`
  // directory, the viewer/BIM files are served straight from disk instead of
  // being proxied to the http-server on every request.
  // The static handler uses `fallthrough: true`, so any file that is missing
  // locally transparently falls back to the hub proxy
  const localPath = (process.env.BIM_FILE_LOCAL_PATH || '').trim();
  let localStatic: express.RequestHandler | null = null;
  if (localPath) {
    if (fs.existsSync(localPath) && fs.statSync(localPath).isDirectory()) {
      localStatic = express.static(localPath, {
        index: false,
        redirect: false,
        fallthrough: true, // missing file -> fall back to the hub proxy
        maxAge: cacheMaxAgeSeconds * 1000, // express expects milliseconds
        immutable: cacheImmutable,
      });
      console.log(
        `[BIM/file] Local file mode ENABLED, serving from disk: ${localPath}`
      );
    } else {
      console.warn(
        `[BIM/file] BIM_FILE_LOCAL_PATH is set to "${localPath}" but it is not a valid directory. Falling back to the hub proxy.`
      );
    }
  }

  /**
   * @swagger
   * /BIM/file:
   *   get:
   *     security:
   *       - bearerAuth:
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
  const handlers: express.RequestHandler[] = [morgan('tiny')];
  if (localStatic) handlers.push(localStatic);
  handlers.push(proxyHub);
  app.use('/BIM/file', ...handlers);
};
