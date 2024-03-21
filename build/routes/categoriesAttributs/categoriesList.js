"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/node/{id}/categoriesList:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Returns list of categories atrribut
  *     summary: Get list of categories atrribut
  *     tags:
  *       - Node Attribut Categories
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
  *                $ref: '#/components/schemas/CategoriesAttribute'
  *       400:
  *         description: Bad request
    */
    app.get("/api/v1/node/:id/categoriesList", async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const childrens = await node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            for (const child of childrens) {
                const info = {
                    dynamicId: child._server_id,
                    staticId: child.getId().get(),
                    name: child.getName().get(),
                    type: child.getType().get()
                };
                nodes.push(info);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(nodes);
    });
};
//# sourceMappingURL=categoriesList.js.map