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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerOption_1 = require("./swaggerOption");
const fs = require("fs");
const redoc = require('redoc-express');
const config_1 = require("./config");
const api_server_1 = require("./api-server");
const spinalAPIMiddleware_1 = require("./spinalAPIMiddleware");
function Requests(logger) {
    function initSpinalHub() {
        return __awaiter(this, void 0, void 0, function* () {
            const spinalAPIMiddleware = spinalAPIMiddleware_1.default.getInstance();
            yield spinalAPIMiddleware.getGraph();
            console.log('graph loaded successfully.');
            return spinalAPIMiddleware;
        });
    }
    function initApiServer(spinalAPIMiddleware) {
        let api = (0, api_server_1.default)(logger, spinalAPIMiddleware);
        // TODO add swagger specs here for external documentation and for the organ to ask for it
        api.use('/swagger-spec', (req, res) => {
            res.json(swaggerDocs);
        });
        fs.writeFile('./swagger-spec.json', JSON.stringify(swaggerDocs, null, 2), (err) => {
            if (err) {
                return console.error(err);
            }
        });
        // add swagger docs to API
        api.use('/spinalcom-api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOpts));
        api.get('/docs/swagger.json', (req, res) => {
            res.send(swaggerDocs);
        });
        api.get('/spinalcom-api-redoc-docs', redoc({
            title: 'API Docs',
            specUrl: '/docs/swagger.json',
        }));
        // serve logo.png file
        api.get('/logo.png', (req, res) => {
            res.sendFile('spinalcore.png', { root: process.cwd() + '/uploads' });
        });
        return api;
    }
    let swaggerDocs = swaggerJSDoc(swaggerOption_1.swaggerOption);
    let swaggerUiOpts = {
        explorer: true,
        openapi: '3.0.1',
        produces: ['application/json'],
        swaggerOptions: swaggerOption_1.swaggerOption,
        customCss: '.topbar-wrapper img {content: url(/logo.png);} .swagger-ui .topbar {background: #dbdbdb;}',
    };
    return {
        // TODO host should be configurable
        run: function () {
            return __awaiter(this, void 0, void 0, function* () {
                const spinalAPIMiddleware = yield initSpinalHub();
                const api = initApiServer(spinalAPIMiddleware);
                let port = config_1.default.api.port;
                const server = api.listen(port, () => {
                    console.log(`\nApi server is listening at 0.0.0.0:${port}`);
                    console.log(`  openapi :\thttp://localhost:${port}/docs/swagger.json`);
                    console.log(`  swagger-ui :\thttp://localhost:${port}/spinalcom-api-docs`);
                    console.log(`  redoc :\thttp://localhost:${port}/spinalcom-api-redoc-docs`);
                });
                yield spinalAPIMiddleware_1.default.getInstance().runSocketServer(server);
            });
        },
        getSwaggerDocs: () => {
            return swaggerDocs;
        },
    };
}
const r = Requests({});
console.log(r);
exports.server = r.run();
exports.default = Requests;
//# sourceMappingURL=index.js.map