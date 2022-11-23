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
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/BIM/BIMFileContext/list:
     *   get:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Return list of BIM File Contexts
     *     summary: Get the list  BIM File Contexts
     *     tags:
     *       - BIM
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/BIMFileContext'
     *       400:
     *         description: scene not found
     *       500:
     *         description: internal error
     */
    app.get('/api/v1/BIM/BIMFileContext/list', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const graph = yield spinalAPIMiddleware.getProfileGraph(profileId);
            const contexts = yield graph.getChildren('hasContext');
            for (const context of contexts) {
                if (context.getName().get() === 'BimFileContext') {
                    const childrens = yield context.getChildren('hasBimFile');
                    for (const children of childrens) {
                        const element = yield children.element.load();
                        const currentVersion = yield spinalAPIMiddleware.loadPtr(element.currentVersion);
                        const items = [];
                        for (let i = 0; i < currentVersion.items.length; i++) {
                            const element = currentVersion.items[i];
                            items.push({
                                name: (_a = element.name) === null || _a === void 0 ? void 0 : _a.get(),
                                path: (_b = element.path) === null || _b === void 0 ? void 0 : _b.get(),
                                thumbnail: (_c = element.thumbnail) === null || _c === void 0 ? void 0 : _c.get(),
                            });
                        }
                        let info = {
                            dynamicId: children._server_id,
                            staticId: children.getId().get(),
                            name: children.getName().get(),
                            type: children.getType().get(),
                            items,
                        };
                        nodes.push(info);
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send('list of contexts is not loaded');
        }
        res.send(nodes);
    }));
};
//# sourceMappingURL=bimFileContext.js.map