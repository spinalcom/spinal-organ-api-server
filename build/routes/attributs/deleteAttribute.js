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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{IdNode}/category/{IdCategory}/attribut/{attributName}/delete:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Delete an attribute of a node
     *     description: >-
     *       Removes the attribute whose label matches `attributName` from the given category. The
     *       comparison ignores surrounding whitespace.
     *
     *
     *       The route answers **200 `ok` whether or not anything was deleted** : an unknown attribute
     *       label, or a category that is not attached to the node, both come back as a success. Read
     *       `/api/v1/node/{id}/attribute_list` again to confirm the removal.
     *     tags:
     *       - Node Attributs
     *     parameters:
     *       - in: path
     *         name: IdNode
     *         description: Dynamic ID of the node.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: IdCategory
     *         description: Dynamic ID of the category holding the attribute.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: attributName
     *         description: Label of the attribute to delete.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: The request was processed (body is `ok`). It does not guarantee a deletion.
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *       400:
     *         description: The node or the category could not be loaded (body is `ko`).
     *       401:
     *         description: The profile is not allowed to write on this node.
     */
    app.delete('/api/v1/node/:IdNode/category/:IdCategory/attribut/:attributName/delete', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            let aux = false;
            const node = await spinalAPIMiddleware.load(parseInt(req.params.IdNode, 10), profileId);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.IdCategory, 10), profileId);
            const childrens = await node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
            for (const children of childrens) {
                if (children.getId().get() === category.getId().get()) {
                    const attributes = await category.getElement();
                    for (let index = 0; index < attributes.length; index++) {
                        const element = attributes[index];
                        const elementLabel = element.label.get();
                        if (elementLabel.toString().trim() ==
                            req.params.attributName.toString().trim()) {
                            attributes.splice(index, 1);
                            aux = true;
                        }
                    }
                }
            }
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(400).send('ko');
        }
        res.status(200).send('ok');
    });
};
//# sourceMappingURL=deleteAttribute.js.map