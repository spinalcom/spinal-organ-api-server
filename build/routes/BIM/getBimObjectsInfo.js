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
const BimObjectUtils = require('./BimObjectUtils');
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/BIM/getBimObjectsInfo:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Resolve viewer dbIds to graph nodes
     *     description: >-
     *       Takes the `dbid`s selected in a viewer and returns the corresponding `BIMObject` nodes of the
     *       graph, so a selection in the 3D model can be turned into nodes the other routes accept.
     *
     *
     *       The body is an array : one entry per BIM file, each holding the file id and the dbIds to
     *       resolve for it. `bimFileId` accepts either the dynamic ID or the static ID of the BIM file.
     *       A dbId that matches no node is simply absent from the answer.
     *     tags:
     *       - BIM
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: object
     *               required:
     *                 - bimFileId
     *                 - dbids
     *               properties:
     *                 bimFileId:
     *                   description: Dynamic ID or static ID of the BIM file.
     *                   oneOf:
     *                     - type: string
     *                     - type: integer
     *                 dbids:
     *                   description: The dbIds as the viewer knows them.
     *                   type: array
     *                   items:
     *                     type: integer
     *     responses:
     *       200:
     *         description: The BIM objects matching the requested dbIds.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/IBimObjectsInfo'
     *       400:
     *         description: The body is not an array ("Bad request body").
     *       500:
     *         description: The BIM objects could not be resolved.
     */
    app.post('/api/v1/BIM/getBimObjectsInfo', async (req, res) => {
        try {
            const bimObjectUtils = BimObjectUtils.getInstance(spinalAPIMiddleware);
            // data : { bimFileId: string, dbids: number[] }[]
            const data = req.body;
            if (!Array.isArray(data))
                return res.status(400).send('Bad request body');
            const result = [];
            for (const d of data) {
                // eslint-disable-next-line no-await-in-loop
                const info = await bimObjectUtils.getBimObjectsInfo(d.bimFileId, d.dbids);
                result.push(info);
            }
            res.json(result);
        }
        catch (e) {
            res.status(500).json(e);
        }
    });
};
//# sourceMappingURL=getBimObjectsInfo.js.map