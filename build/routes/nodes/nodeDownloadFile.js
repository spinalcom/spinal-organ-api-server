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
var http = require('http');
var fs = require('fs');
const config_1 = require("../../config");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/download_file:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - read
     *     description: Download a Doc
     *     summary: Download a Doc
     *     tags:
     *       - Nodes
     *     parameters:
     *       - in: path
     *         name: id
     *         description: use the dynamic ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       200:
     *         description: Download Successfully
     *       400:
     *         description: Download not Successfully
     */
    app.use('/api/v1/node/:id/download_file', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield spinalAPIMiddleware.getGraph();
            var node = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            var p = yield down(node);
            res.download(p, (error) => { });
        }
        catch (error) {
            console.log(error);
            res.status(400).send('ko');
        }
    }));
};
function down(node) {
    return new Promise((resolve, reject) => {
        node.load((argPath) => {
            const p = `${__dirname}/${node.name.get()}`;
            const f = fs.createWriteStream(p);
            http.get(`http://${config_1.default.spinalConnector.host}:${config_1.default.spinalConnector.port}/sceen/_?u=${argPath._server_id}`, function (response) {
                response.pipe(f);
                response.on('end', () => __awaiter(this, void 0, void 0, function* () {
                    resolve(p);
                }));
                response.on('error', function (err) {
                    console.log(err);
                });
            });
        });
    });
}
//# sourceMappingURL=nodeDownloadFile.js.map