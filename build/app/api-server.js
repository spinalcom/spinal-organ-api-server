"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLogger = void 0;
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes_1 = require("../routes/routes");
const morgan = require("morgan");
function useLogger(app, log_body) {
    if (log_body) {
        morgan.token('body-req', (req) => {
            return req.method === 'POST' || req.method === 'PUT'
                ? // @ts-ignore
                    JSON.stringify(req.body, null, 2)
                : '';
        });
        app.use('/api/*', morgan(':method :url :status :response-time ms - :res[content-length] :body-req'));
    }
    else {
        app.use('/api/*', morgan('dev'));
    }
}
exports.useLogger = useLogger;
function APIServer(logger, spinalAPIMiddleware) {
    const app = express();
    // enable files upload
    app.use(fileUpload({ createParentPath: true }));
    app.use(cors());
    app.disable('x-powered-by');
    app.use(bodyParser.urlencoded({ extended: true }));
    const bodyParserDefault = bodyParser.json();
    const bodyParserTicket = bodyParser.json({ limit: '500mb' });
    app.use((req, res, next) => {
        if (req.originalUrl === '/api/v1/node/convert_base_64' ||
            req.originalUrl === '/api/v1/ticket/create_ticket')
            return bodyParserTicket(req, res, next);
        return bodyParserDefault(req, res, next);
    });
    useLogger(app, process.env.LOG_BODY);
    (0, routes_1.default)(logger, app, spinalAPIMiddleware);
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
exports.default = APIServer;
//# sourceMappingURL=api-server.js.map