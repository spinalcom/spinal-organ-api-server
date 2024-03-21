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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSwagger = exports.getSwaggerDocs = void 0;
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerOption_1 = require("./swaggerOption");
const redoc = require('redoc-express');
const swaggerDocs = swaggerJSDoc(swaggerOption_1.swaggerOption);
const swaggerUiOpts = {
    explorer: true,
    openapi: '3.0.1',
    produces: ['application/json'],
    swaggerOptions: swaggerOption_1.swaggerOption,
    customCss: '.topbar-wrapper img {content: url(/logo.png);} .swagger-ui .topbar {background: #dbdbdb;}',
};
const getSwaggerDocs = () => {
    return swaggerDocs;
};
exports.getSwaggerDocs = getSwaggerDocs;
function initSwagger(api) {
    api.use('/swagger-spec', (req, res) => {
        res.json(swaggerDocs);
    });
    fs.writeFile(path.resolve(__dirname, '../../swagger-spec.json'), JSON.stringify(swaggerDocs, null, 2), (err) => {
        if (err) {
            return console.error(err);
        }
    });
    // add swagger docs to API
    api.use('/spinalcom-api-docs', swaggerUi.serve, (req, res, next) => {
        return swaggerUi.setup(swaggerDocs, swaggerUiOpts)(req, res, next);
    });
    api.get('/docs/swagger.json', (req, res) => {
        res.send(swaggerDocs);
    });
    api.get('/spinalcom-api-redoc-docs', redoc({
        title: 'API Docs',
        specUrl: '/docs/swagger.json',
    }));
}
exports.initSwagger = initSwagger;
//# sourceMappingURL=index.js.map