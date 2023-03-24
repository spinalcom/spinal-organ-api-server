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

import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as cors from 'cors';
import * as _ from 'lodash';

import * as bodyParser from 'body-parser';
import type SpinalAPIMiddleware from './spinalAPIMiddleware';
import routes from './routes/routes';
import morgan = require('morgan');

function APIServer(
  logger,
  spinalAPIMiddleware: SpinalAPIMiddleware
): express.Express {
  const app = express();
  // enable files upload
  app.use(
    fileUpload({
      createParentPath: true,
    })
  );

  app.use(cors());
  app.disable('x-powered-by');
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  const bodyParserDefault = bodyParser.json();
  const bodyParserTicket = bodyParser.json({ limit: '500mb' });
  app.use((req, res, next) => {
    if (
      req.originalUrl === '/api/v1/node/convert_base_64' ||
      req.originalUrl === '/api/v1/ticket/create_ticket'
    )
      return bodyParserTicket(req, res, next);
    return bodyParserDefault(req, res, next);
  });
  if (process.env.LOG_BODY) {
    morgan.token('body-req', (req) => {
      return req.method === 'POST' || req.method === 'PUT'
        ? // @ts-ignore
        JSON.stringify(req.body, null, 2)
        : '';
    });
    app.use(
      '/api/*',
      morgan(
        ':method :url :status :response-time ms - :res[content-length] :body-req'
      )
    );
  } else {
    // app.use('/api/*', morgan('dev'));
    app.use(
      '/api/*',
      morgan(function (tokens, req, res) {
        return [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'), '-',
          tokens['response-time'](req, res), 'ms'
        ].join(' ')
      })
    );
  }

  routes(logger, app, spinalAPIMiddleware);
  // app.use('/admin', express.static('public'));
  // app.use(function (req, res, next) {
  //   var pathUrl = req.path;
  //   if (pathUrl !== '/') {
  //     res.download(
  //       __dirname + '/' + 'download.png',
  //       'download.png',
  //       function (err) {
  //         console.log(err);
  //       }
  //     );
  //   } else {
  //     next();
  //   }
  // });

  return app;
}

export default APIServer;
