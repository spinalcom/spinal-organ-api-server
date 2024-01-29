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
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const requestUtilities_1 = require("../../utilities/requestUtilities");
const getAttributeListInfo_1 = require("../../utilities/getAttributeListInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    //deprecated
    app.get("/api/v1/node/:id/attributsList", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            let node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            let childrens = await node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            const prom = childrens.map(async (child) => {
                let attributs = await child.element.load();
                let info = {
                    dynamicId: child._server_id,
                    staticId: child.getId().get(),
                    name: child.getName().get(),
                    type: child.getType().get(),
                    attributs: attributs.get(),
                };
                return info;
            });
            const json = await Promise.all(prom);
            return res.json(json);
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(400).send(error.message);
        }
    });
    /**
  * @swagger
  * /api/v1/node/{id}/attribute_list:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Returns list of attributs
  *     summary: Get list of attributs
  *     tags:
  *       - Node Attributs
  *     parameters:
  *      - in: path
  *        name: id
  *        description: use the dynamic ID
  *        required: true
  *        schema:
  *          type: integer
  *          format: int64
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *               type: array
  *               items:
  *                $ref: '#/components/schemas/NodeAttribut'
  *       400:
  *         description: Bad request
    */
    app.get("/api/v1/node/:id/attribute_list", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const result = await (0, getAttributeListInfo_1.getAttributeListInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10));
            return res.json(result);
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(400).send(error.message);
        }
    });
};
//# sourceMappingURL=attributList.js.map