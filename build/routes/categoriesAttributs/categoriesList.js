"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/node/{id}/categoriesList:
  *   get:
  *     security:
  *       - OauthSecurity:
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
    app.get("/api/v1/node/:id/categoriesList", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        let nodes = [];
        try {
            var node = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            var childrens = yield node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            for (const child of childrens) {
                let info = {
                    dynamicId: child._server_id,
                    staticId: child.getId().get(),
                    name: child.getName().get(),
                    type: child.getType().get()
                };
                nodes.push(info);
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send("ko");
        }
        res.json(nodes);
    }));
};
//# sourceMappingURL=categoriesList.js.map