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
const corseChildrenAndParentNode_1 = require("../../utilities/corseChildrenAndParentNode");
const spinal_model_graph_1 = require("spinal-model-graph");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
    * @swagger
    * /api/v1/relation/{id}/children_node:
    *   get:
    *     security:
    *       - OauthSecurity:
    *         - readOnly
    *     description: Return cildrens of relation node
    *     summary: Get childrens of relation with given ID node
    *     tags:
    *       - Nodes
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
    *                $ref: '#/components/schemas/Node'
    *       400:
    *         description: Bad request
    */
    app.get("/api/v1/relation/:id/children_node", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            var nodes;
            var node_list = [];
            var relation = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            if (relation instanceof spinal_model_graph_1.SpinalRelationLstPtr || relation instanceof spinal_model_graph_1.SpinalRelationPtrLst || relation instanceof spinal_model_graph_1.SpinalRelationRef) {
                nodes = yield relation.getChildren();
                for (let index = 0; index < nodes.length; index++) {
                    var children_node = (0, corseChildrenAndParentNode_1.childrensNode)(nodes[index]);
                    var parent_node = yield (0, corseChildrenAndParentNode_1.parentsNode)(nodes[index]);
                    var info = {
                        dynamicId: nodes[index]._server_id,
                        staticId: nodes[index].getId().get(),
                        name: nodes[index].getName().get(),
                        type: nodes[index].getType().get(),
                        children_relation_list: children_node,
                        parent_relation_list: parent_node
                    };
                    node_list.push(info);
                }
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send("ko");
        }
        res.json(node_list);
    }));
};
//# sourceMappingURL=relationChildrenNode.js.map