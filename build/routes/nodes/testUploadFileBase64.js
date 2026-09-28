"use strict";
/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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
const fs_1 = require("fs");
const stream_1 = require("stream");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/convert_base_64:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Decode a base64 image (internal test route)
     *     description: >-
     *       Development helper : decodes a base64 data URL and writes it to `testImage1.jpg` in the
     *       organ's working directory. It touches no node and returns no node - the response is the plain
     *       string `"convert string to image with succes"`.
     *
     *
     *       Nothing links the written file to the graph, and each call overwrites the previous one. Use
     *       `/api/v1/node/{id}/upload_file` to actually attach a document to a node.
     *
     *
     *       This route accepts a request body of up to 500 MB (most routes cap at the default body size).
     *     deprecated: true
     *     tags:
     *       - Nodes
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - imageString
     *             properties:
     *               imageString:
     *                 type: string
     *                 description: The image as a base64 string, with or without the `data:image/...;base64,` prefix.
     *     responses:
     *       200:
     *         description: The image was decoded and written to disk.
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: convert string to image with succes
     *       500:
     *         description: The body was missing `imageString`, or the image could not be decoded or written.
     */
    app.post('/api/v1/node/convert_base_64', async (req, res, next) => {
        try {
            const base64 = req.body.imageString;
            const data = base64.replace(/^data:image\/\w+;base64,/, '');
            const imageBufferData = Buffer.from(data, 'base64');
            const streamObj = new stream_1.Readable();
            streamObj.push(imageBufferData);
            streamObj.push(null);
            streamObj.pipe((0, fs_1.createWriteStream)('testImage1.jpg'));
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json('convert string to image with succes');
    });
};
//# sourceMappingURL=testUploadFileBase64.js.map