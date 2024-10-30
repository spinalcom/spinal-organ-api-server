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
import * as bodyParser from 'body-parser';
import type SpinalAPIMiddleware from './spinalAPIMiddleware';
import routes from './routes/routes';
import morgan = require('morgan');
import chalk from 'chalk';

export const morganMiddleware = morgan(function (tokens, req, res) {
  const method = chalk.hex('#34ace0').bold(tokens.method(req, res));
  const url = chalk.hex('#ff5252').bold(tokens.url(req, res));
  const status = tokens.status(req, res);
  const responseTime = chalk.hex('#2ed573').bold(tokens['response-time'](req, res) + ' ms');
  const date = chalk.hex('#f78fb3').bold('@ ' + tokens.date(req, res));
  const remoteAddr = chalk.yellow(tokens['remote-addr'](req, res));
  const referrer = chalk.hex('#fffa65').bold('from ' + tokens.referrer(req, res));
  let statusColor = chalk.hex('#ffb142'); // Default color
  if (status) {
    const statusCode = parseInt(status, 10);
    if (statusCode >= 500) {
      statusColor = chalk.hex('#ff4757'); // Red for server errors
    } else if (statusCode >= 400) {
      statusColor = chalk.hex('#ffa502'); // Orange for client errors
    } else if (statusCode >= 300) {
      statusColor = chalk.hex('#7bed9f'); // Light green for redirects
    } else if (statusCode >= 200) {
      statusColor = chalk.hex('#2ed573'); // Green for successful responses
    }
  }
  return [
    method,
    url,
    statusColor.bold(status),
    responseTime,
    date,
    remoteAddr,
    referrer
  ].join(' ');
});


export function useLogger(app: express.Application, log_body: boolean | string) {
  if (log_body) {
    morgan.token('body-req', (req) => {
      return req.method === 'POST' || req.method === 'PUT'
        ? // @ts-ignore
        JSON.stringify(req.body, null, 2)
        : '';
    });
    app.use('/api/*', morgan(':method :url :status :response-time ms - :res[content-length] :body-req'));
  } else {
    app.use('/api/*', morganMiddleware);
  }
}


function APIServer(logger, spinalAPIMiddleware: SpinalAPIMiddleware): express.Express {
  const app = express();
  app.use((req, res, next) => {
    res.setHeader('X-API-Version', process.env.API_SERVER_VERSION);
    next();
  });
  // enable files upload
  app.use(fileUpload({ createParentPath: true }));
  app.use(cors());
  app.disable('x-powered-by');
  app.use(bodyParser.urlencoded({ extended: true }));
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

  useLogger(app, process.env.LOG_BODY);

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
