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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/node/{nodeId}/categoryById/{categoryId}/read:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: read category attribut in specific node
  *     summary: read category attribut
  *     tags:
  *       - Node Attribut Categories
  *     parameters:
  *      - in: path
  *        name: nodeId
  *        description: use the dynamic ID
  *        required: true
  *        schema:
  *          type: integer
  *          format: int64
  *      - in: path
  *        name: categoryId
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
  *                $ref: '#/components/schemas/CategoriesAttribute'
  *       400:
  *         description: Bad request
    */
    app.get("/api/v1/node/:nodeId/categoryById/:categoryId/read", async (req, res, next) => {
        let info;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
            const childrens = await node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            for (let index = 0; index < childrens.length; index++) {
                if (childrens[index] === category) {
                    info = {
                        dynamicId: category._server_id,
                        staticId: category.getId().get(),
                        name: category.getName().get(),
                        type: category.getType().get(),
                    };
                }
            }
            if (Object.keys(info).length === 0) {
                res.status(400).send("category not found in node");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(info);
    });
};
//# sourceMappingURL=readCategoryById.js.map