
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

import * as dotenv from "dotenv";
dotenv.config();

import * as swaggerUi from 'swagger-ui-express';
import * as swaggerJSDoc from "swagger-jsdoc";
import { swaggerOption } from "./swaggerOption";
import * as path from "path";
// import config from "../../config.js"
import { getListRequest } from "./listRequest"
import * as fs from "fs";
const redoc = require('redoc-express');
import config from "./config";
import APIServer from "./api-server";
import SpinalAPIMiddleware from "./spinalAPIMiddleware";


function Requests(logger) {

  let api = APIServer(logger);

  let swaggerDocs = swaggerJSDoc(swaggerOption);
  let swaggerUiOpts = {
    explorer: true,
    openapi: "3.0.1",
    produces: ["application/json"],
    swaggerOptions: swaggerOption,
    customCss: '.topbar-wrapper img {content: url(/logo.png);} .swagger-ui .topbar {background: #dbdbdb;}'
  };

  // TODO add swagger specs here for external documentation and for the organ to ask for it
  api.use('/swagger-spec', (req, res) => {
    res.json(swaggerDocs)
  })

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
  api.get(
    '/spinalcom-api-reduc-docs',
    redoc({
      title: 'API Docs',
      specUrl: '/docs/swagger.json'
    })
  );

  // serve logo.png file
  api.get('/logo.png', (req, res) => {
    res.sendFile('spinalcore.png', { root: process.cwd() + '/uploads' });
  });

  return {

    // TODO host should be configurable
    run: async function (): Promise<void> {
      let host = config.api.host
      let port = config.api.port

      const server = api.listen(port, () => {
        console.log("api server is running");
      });

      SpinalAPIMiddleware.getInstance().runSocketServer(server);

    },

    getSwaggerDocs: (): Object => { return swaggerDocs; }

  };
}


const r = Requests({})
console.log(r);

r.run();

export default Requests;
