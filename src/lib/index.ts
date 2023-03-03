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

import { Application } from "express";
import { Server } from "http";
import { initSwagger } from "../swagger";
import { ISpinalAPIMiddleware } from "../interfaces";
import * as fileUpload from 'express-fileupload';
import * as bodyParser from 'body-parser';
import * as path from "path";
import morgan = require("morgan");
import routes from "../routes/routes";
import { useLogger } from "../api-server";


function initApiServer(app: Application, spinalAPIMiddleware: ISpinalAPIMiddleware, log_body: boolean = false) {
    app.use(fileUpload({ createParentPath: true }));

    useLogger(app, log_body);

    initSwagger(app);

    app.get('/logo.png', (req, res) => {
        res.sendFile('spinalcore.png', { root: path.resolve(__dirname + '../../../uploads') });
    });

    routes({}, app, spinalAPIMiddleware);
}

export function runServerRest(server: Server, app: Application, spinalAPIMiddleware: ISpinalAPIMiddleware) {
    initApiServer(app, spinalAPIMiddleware);
}

export * from "../interfaces";