"use strict";
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
exports.getSwaggerDocs = void 0;
exports.initSwagger = initSwagger;
const fs_1 = require("fs");
const path_1 = require("path");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerOption_1 = require("./swaggerOption");
const redoc = require('redoc-express');
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOption_1.swaggerOption);
const swaggerUiOpts = {
    explorer: true,
    openapi: '3.0.1',
    produces: ['application/json'],
    swaggerOptions: swaggerOption_1.swaggerOption,
    customCss: '.topbar-wrapper img {content: url(/logo.png);} .swagger-ui .topbar {background: #dbdbdb;}',
};
if (process.env.WRITE_SWAGGER_START === 'true') {
    // DEBUG: Write the generated swagger docs to a file for debugging purposes
    (0, fs_1.writeFile)((0, path_1.resolve)(__dirname, '../../swagger-spec.json'), JSON.stringify(swaggerDocs, null, 2), (err) => {
        if (err) {
            return console.error(err);
        }
    });
}
const getSwaggerDocs = () => {
    return swaggerDocs;
};
exports.getSwaggerDocs = getSwaggerDocs;
function initSwagger(api) {
    api.use('/swagger-spec', (req, res) => {
        res.json(swaggerDocs);
    });
    (0, fs_1.writeFile)((0, path_1.resolve)(__dirname, '../../swagger-spec.json'), JSON.stringify(swaggerDocs, null, 2), (err) => {
        if (err) {
            return console.error(err);
        }
    });
    // add swagger docs to API
    api.use('/spinalcom-api-docs', swagger_ui_express_1.default.serve, (req, res, next) => {
        return swagger_ui_express_1.default.setup(swaggerDocs, swaggerUiOpts)(req, res, next);
    });
    api.get('/docs/swagger.json', (req, res) => {
        res.send(swaggerDocs);
    });
    api.get('/spinalcom-api-redoc-docs', redoc({
        title: 'API Docs',
        specUrl: '/docs/swagger.json',
    }));
}
//# sourceMappingURL=index.js.map