"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/attribute/update_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: update multiple attributes for multiple nodes
     *     summary: update multiple attributes for multiple nodes
     *     tags:
     *       - Node Attributs
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               $ref: '#/components/schemas/NodeAttributeUpdate'
     *     responses:
     *       200:
     *         description: Create Successfully
     *       400:
     *         description: Bad request
     */
    app.post('/api/v1/node/attribute/update_multiple', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const nodes = req.body;
            for (const nodeUpdate of nodes) {
                const node = await spinalAPIMiddleware.load(nodeUpdate.dynamicId, profileId);
                for (const categoryUpdate of nodeUpdate.categories) {
                    for (const attributeUpdate of categoryUpdate.attributes) {
                        spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addAttributeByCategoryName(node, categoryUpdate.categoryName, attributeUpdate.attributeLabel, attributeUpdate.attributeNewValue);
                    }
                }
            }
            res.status(200).send('ok');
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(400).send('ko');
        }
        // res.json(nodes);
    });
};
//# sourceMappingURL=updateAttributeMultiple.js.map