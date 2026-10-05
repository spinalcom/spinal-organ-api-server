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
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Download a document attached to a node
     *     description: >-
     *       Streams back the content of a document stored on the hub. The `id` is the `dynamicId` of the
     *       **file** as returned by `/api/v1/node/{id}/file_list`, not the ID of the node it hangs on.
     *
     *
     *       By default the body is the raw file, with the `Content-Type` guessed from its name (falling
     *       back to `application/octet-stream`). With `encoding=base64` the body is instead the base64
     *       text of the file, served as `text/plain`.
     *
     *
     *       The handler is mounted for every HTTP method, so a POST to the same URL behaves identically.
     *     tags:
     *       - Nodes
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Dynamic ID of the document, as returned by `/api/v1/node/{id}/file_list`.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: query
     *         name: encoding
     *         description: >-
     *           `binary` (default) streams the raw file; `base64` returns its base64 text as
     *           `text/plain`. Any other value is treated as `binary`.
     *         required: false
     *         schema:
     *           type: string
     *           enum: [binary, base64]
     *           default: binary
     *     responses:
     *       200:
     *         description: The document content.
     *         content:
     *           application/octet-stream:
     *             schema:
     *               type: string
     *               format: binary
     *           text/plain:
     *             schema:
     *               type: string
     *               description: Base64 text, when `encoding=base64`.
     *       400:
     *         description: The document could not be loaded or fetched from the hub (body is `ko`).
     */
    app.use('/api/v1/node/:id/download_file', async (req, res, next) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const { http, hubUri } = getHost(spinalAPIMiddleware.config);
            const encoding = req.query.encoding || 'binary';
            await down(node, http, hubUri, res, encoding);
        }
        catch (error) {
            console.log(error);
            res.status(400).send('ko');
        }
    });
};
function down(file, http, hubUri, res, encoding) {
    return new Promise((resolve, reject) => {
        file.load((argPath) => {
            // const p = `${__dirname}/${path.name.get()}`;
            // const f = fs.createWriteStream(p);
            http.get(`${hubUri}/sceen/_?u=${argPath._server_id}`, function (response) {
                const type = mime.lookup(file?.name?.get()) || 'application/octet-stream';
                if (encoding === 'base64') {
                    // Change response type for base64
                    const chunks = [];
                    response.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
                    response.on('end', () => {
                        const binary = Buffer.concat(chunks);
                        const base64 = binary.toString('base64');
                        res.set('Content-Type', 'text/plain');
                        res.send(base64);
                        resolve();
                    });
                }
                else {
                    // Handle binary response
                    res.set('Content-Type', type);
                    response.pipe(res);
                    response.on('end', () => {
                        resolve();
                    });
                }
                response.on('error', function (err) {
                    console.log(err);
                    reject(err);
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