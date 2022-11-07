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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/list:
     *   get:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Return list of contexts
     *     summary: Gets a list of contexts
     *     tags:
     *      - Contexts/ontologies
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Context'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/context/list', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        let nodes = [];
        try {
            var graph = yield spinalAPIMiddleware.getGraph();
            if (graph === undefined) {
                res.status(400).send('graph is not loaded');
            }
            var relationNames = graph.getRelationNames();
            var childrens = yield graph.getChildren(relationNames);
            for (const child of childrens) {
                let info = {
                    dynamicId: child._server_id,
                    staticId: child.getId().get(),
                    name: child.getName().get(),
                    type: child.getType().get(),
                };
                nodes.push(info);
            }
            res.send(nodes);
        }
        catch (error) {
            console.error(error);
            res.status(400).send('list of contexts is not loaded');
        }
    }));
};
//# sourceMappingURL=contextList.js.map