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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = void 0;
exports.createLogRequestLifecycle = createLogRequestLifecycle;
exports.useLogger = useLogger;
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./routes/routes"));
const morgan = require("morgan");
const chalk_1 = __importDefault(require("chalk"));
const non_secure_1 = require("nanoid/non-secure");
function pad(str, length) {
    return str.padEnd(length);
}
function createLogRequestLifecycle(log_body) {
    return function logRequestLifecycle(req, res, next) {
        const id = (0, non_secure_1.nanoid)(6);
        req.id = id;
        const startTime = Date.now();
        console.log(`[ Pending ] [ ${pad(id, 6)} ] ${pad(req.method, 7)} ${pad(req.originalUrl, 40)} from ${req.ip}`);
        if (log_body && req.body && Object.keys(req.body).length > 0) {
            try {
                const bodyStr = JSON.stringify(req.body, null, 2);
                console.log(`[Body][${id}] ${bodyStr}`);
            }
            catch (err) {
                console.log(`[Body][${id}] [Unable to stringify body]`);
            }
        }
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            console.log(`[Completed] [ ${pad(id, 6)} ] ${pad(req.method, 7)} ${pad(req.originalUrl, 40)} -> ${res.statusCode} (${duration}ms)`);
        });
        next();
    };
}
// export function logRequestLifecycle(req: express.Request, res: express.Response, next: express.NextFunction) {
//   const id = nanoid(6);
//   (req as any).id = id;
//   const startTime = Date.now();
//   console.log(
//     `[ Pending ] [ ${pad(id, 6)} ] ${pad(req.method, 7)} ${pad(req.originalUrl, 40)} from ${req.ip}`
//   );
//   if (
//     process.env.LOG_BODY === '1' &&
//     req.body &&
//     Object.keys(req.body).length > 0
//   ) {
//     try {
//       const bodyStr = JSON.stringify(req.body, null, 2);
//       console.log(`[Body][${id}] ${bodyStr}`);
//     } catch (err) {
//       console.log(`[Body][${id}] [Unable to stringify body]`);
//     }
//   }
//   res.on('finish', () => {
//     const duration = Date.now() - startTime;
//     console.log(
//       `[Completed] [ ${pad(id, 6)} ] ${pad(req.method, 7)} ${pad(req.originalUrl, 40)} -> ${res.statusCode} (${duration}ms)`
//     );
//   });
//   next();
// }
exports.morganMiddleware = morgan(function (tokens, req, res) {
    const method = chalk_1.default.hex('#34ace0').bold(tokens.method(req, res));
    const url = chalk_1.default.hex('#ff5252').bold(tokens.url(req, res));
    const status = tokens.status(req, res);
    const responseTime = chalk_1.default
        .hex('#2ed573')
        .bold(tokens['response-time'](req, res) + ' ms');
    const date = chalk_1.default.hex('#f78fb3').bold('@ ' + tokens.date(req, res));
    const remoteAddr = chalk_1.default.yellow(tokens['remote-addr'](req, res));
    const referrer = chalk_1.default
        .hex('#fffa65')
        .bold('from ' + tokens.referrer(req, res));
    let statusColor = chalk_1.default.hex('#ffb142'); // Default color
    if (status) {
        const statusCode = parseInt(status, 10);
        if (statusCode >= 500) {
            statusColor = chalk_1.default.hex('#ff4757'); // Red for server errors
        }
        else if (statusCode >= 400) {
            statusColor = chalk_1.default.hex('#ffa502'); // Orange for client errors
        }
        else if (statusCode >= 300) {
            statusColor = chalk_1.default.hex('#7bed9f'); // Light green for redirects
        }
        else if (statusCode >= 200) {
            statusColor = chalk_1.default.hex('#2ed573'); // Green for successful responses
        }
    }
    return [
        method,
        url,
        statusColor.bold(status),
        responseTime,
        date,
        remoteAddr,
        referrer,
    ].join(' ');
});
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
        app.use('/api/*', exports.morganMiddleware);
    }
}
function APIServer(logger, spinalAPIMiddleware) {
    const app = (0, express_1.default)();
    app.use((req, res, next) => {
        res.setHeader('X-API-Version', process.env.API_SERVER_VERSION);
        next();
    });
    // enable files upload
    app.use((0, express_fileupload_1.default)({ createParentPath: true }));
    app.use((0, cors_1.default)());
    app.disable('x-powered-by');
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    const bodyParserDefault = body_parser_1.default.json();
    const bodyParserTicket = body_parser_1.default.json({ limit: '500mb' });
    app.use((req, res, next) => {
        if (req.originalUrl === '/api/v1/node/convert_base_64' ||
            req.originalUrl === '/api/v1/ticket/create_ticket')
            return bodyParserTicket(req, res, next);
        return bodyParserDefault(req, res, next);
    });
    app.use((error, req, res, next) => {
        if (error?.type === 'entity.parse.failed') {
            return res
                .status(400)
                .send('Invalid JSON in request body : ' + error.message);
        }
        else {
            next();
        }
    });
    // app.use(logRequestStart);
    // app.use(logRequestLifecycle);
    app.use(createLogRequestLifecycle(['1', 'true', 'yes'].includes((process.env.LOG_BODY || '').toLowerCase())));
    // useLogger(app, ["1", "true", "yes"].includes((process.env.LOG_BODY || "").toLowerCase()));
    (0, routes_1.default)(logger, app, spinalAPIMiddleware);
    return app;
}
exports.default = APIServer;
//# sourceMappingURL=api-server.js.map