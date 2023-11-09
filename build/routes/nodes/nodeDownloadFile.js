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
const requestUtilities_1 = require("../../utilities/requestUtilities");
const mime = require('mime-types');
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/download_file:
     *   post:
     *     security:
     *       - bearerAuth:
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
    app.use('/api/v1/node/:id/download_file', async (req, res, next) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const { http, hubUri } = getHost(spinalAPIMiddleware.config);
            await down(node, http, hubUri, res);
        }
        catch (error) {
            console.log(error);
            res.status(400).send('ko');
        }
    });
};
function down(file, http, hubUri, res) {
    return new Promise((resolve, reject) => {
        file.load((argPath) => {
            // const p = `${__dirname}/${path.name.get()}`;
            // const f = fs.createWriteStream(p);
            http.get(`${hubUri}/sceen/_?u=${argPath._server_id}`, function (response) {
                var type = mime.lookup(file?.name?.get()) || 'application/octet-stream';
                res.set('Content-Type', type);
                response.pipe(res);
                response.on('end', async () => {
                    resolve();
                });
                response.on('error', function (err) {
                    console.log(err);
                });
            });
        });
    });
}
function getHost(config) {
    let http;
    let hubUri;
    if (config.spinalConnector.protocol === 'https') {
        http = require('https');
        hubUri = `https://${config.spinalConnector.host}`;
    }
    else {
        http = require('http');
        hubUri = `http://${config.spinalConnector.host}`;
    }
    if (config.spinalConnector.port) {
        hubUri = `${hubUri}:${config.spinalConnector.port}`;
    }
    return { http, hubUri };
}
//# sourceMappingURL=nodeDownloadFile.js.map