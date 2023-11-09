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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runServerRest = void 0;
const swagger_1 = require("../swagger");
const fileUpload = require("express-fileupload");
const path = require("path");
const routes_1 = require("../routes/routes");
const api_server_1 = require("../api-server");
const spinal_organ_api_pubsub_1 = require("spinal-organ-api-pubsub");
function initApiServer(app, spinalAPIMiddleware, log_body = false) {
    app.use(fileUpload({ createParentPath: true }));
    (0, api_server_1.useLogger)(app, log_body);
    (0, swagger_1.initSwagger)(app);
    app.get('/logo.png', (req, res) => {
        res.sendFile('spinalcore.png', {
            root: path.resolve(__dirname + '../../../uploads'),
        });
    });
    (0, routes_1.default)({}, app, spinalAPIMiddleware);
}
async function runServerRest(server, app, spinalAPIMiddleware, spinalIOMiddleware, log_body = false) {
    initApiServer(app, spinalAPIMiddleware, log_body);
    const io = await (0, spinal_organ_api_pubsub_1.runSocketServer)(server, spinalIOMiddleware);
    return { app, io };
}
exports.runServerRest = runServerRest;
__exportStar(require("../interfaces"), exports);
//# sourceMappingURL=index.js.map