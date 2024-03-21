"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{idNode}/category/{idCategory}/attribut/{attributName}/update:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: Create attribute
     *     summary: create an attribute
     *     tags:
     *       - Node Attributs
     *     parameters:
     *       - in: path
     *         name: idNode
     *         description: use the dynamic ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: idCategory
     *         description: use the dynamic ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: attributName
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - attributeLabel
     *               - attributeValue
     *               - attributeType
     *               - attributeUnit
     *             properties:
     *               attributeLabel:
     *                 type: string
     *               attributeValue:
     *                 type: string
     *               attributeType:
     *                 type: string
     *               attributeUnit:
     *                 type: string
     *     responses:
     *       200:
     *         description: Create Successfully
     *       400:
     *         description: Bad request
     */
    app.put('/api/v1/node/:IdNode/category/:IdCategory/attribut/:attributName/update', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var nodes = [];
            const node = await spinalAPIMiddleware.load(parseInt(req.params.IdNode, 10), profileId);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.IdCategory, 10), profileId);
            const childrens = await node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            for (const children of childrens) {
                if (children.getId().get() === category.getId().get()) {
                    const attributes = await category.getElement();
                    for (let index = 0; index < attributes.length; index++) {
                        const element = attributes[index];
                        if (element.label.get() === req.params.attributName) {
                            element.label.set(req.body.attributeLabel);
                            element.value.set(req.body.attributeValue);
                            element.type.set(req.body.attributeType);
                            element.unit.set(req.body.attributeUnit);
                            break;
                        }
                    }
                }
            }
            for (const child of childrens) {
                const attributs = await child.element.load();
                const info = {
                    dynamicId: child._server_id,
                    staticId: child.getId().get(),
                    name: child.getName().get(),
                    type: child.getType().get(),
                    attributs: attributs.get(),
                };
                nodes.push(info);
            }
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(400).send('ko');
        }
        res.json(nodes);
    });
};
//# sourceMappingURL=updateAttribute.js.map