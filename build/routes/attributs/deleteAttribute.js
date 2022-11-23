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
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{idNode}/category/{idCategory}/attribut/{attributName}/delete:
     *   delete:
     *     security:
     *       - OauthSecurity:
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
     *     responses:
     *       200:
     *         description: Create Successfully
     *       400:
     *         description: Bad request
     */
    app.delete('/api/v1/node/:IdNode/category/:IdCategory/attribut/:attributName/delete', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var aux = false;
            let node = yield spinalAPIMiddleware.load(parseInt(req.params.IdNode, 10), profileId);
            let category = yield spinalAPIMiddleware.load(parseInt(req.params.IdCategory, 10), profileId);
            let childrens = yield node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            for (const children of childrens) {
                if (children.getId().get() === category.getId().get()) {
                    let attributes = yield category.getElement();
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
        res.json();
    }));
};
//# sourceMappingURL=deleteAttribute.js.map