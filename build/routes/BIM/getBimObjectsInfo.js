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
const BimObjectUtils = require('./BimObjectUtils');
module.exports = function (logger, app) {
    /**
     * @swagger
     * /api/v1/BIM/getBimObjectsInfo:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Retrun the list of BimObjectsInfo
     *     summary: Get getBimObjectsInfo
     *     tags:
     *       - BIM
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: object
     *               properties:
     *                 bimFileId:
     *                   description: serverId or staticId of the BimFile
     *                   oneOf:
     *                     - type: string
     *                     - type: integer
     *                 bimObjects:
     *                   description: dbIds in the viewer
     *                   type: array
     *                   items:
     *                     type: integer
     *             required:
     *               - bimFileId
     *               - bimObjects
     *     responses:
     *       200:
     *         description: Array of BimObjectsInfo
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/IBimObjectsInfo'
     *
     */
    app.post('/api/v1/BIM/getBimObjectsInfo', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const bimObjectUtils = BimObjectUtils.getInstance();
            // data : { bimFileId: string, dbids: number[] }[]
            const data = req.body;
            if (!Array.isArray(data))
                return res.status(400).send('Bad request body');
            const result = [];
            for (const d of data) {
                // eslint-disable-next-line no-await-in-loop
                const info = yield bimObjectUtils.getBimObjectsInfo(d.bimFileId, d.dbids);
                result.push(info);
            }
            res.json(result);
        }
        catch (e) {
            res.status(500).json(e);
        }
    }));
};
//# sourceMappingURL=getBimObjectsInfo.js.map