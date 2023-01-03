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
const sceneUtils = require("./sceneUtils");
module.exports = function (logger, app) {
    /**
     * @swagger
     * /api/v1/BIM/scene/default:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Retrun the default scene with it's items
     *     summary: Get the default scene with it's items
     *     tags:
     *       - BIM
     *     responses:
     *       200:
     *         description: scene
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/IScenesbody'
     *       400:
     *         description: scene not found
     *       500:
     *         description: internal error
     */
    app.get('/api/v1/BIM/scene/default', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const scenes = yield sceneUtils.getScenes();
            for (const scene of scenes) {
                if (scene.info.autoLoad.get() === true) {
                    // eslint-disable-next-line no-await-in-loop
                    const scenesItems = yield sceneUtils.sceneGetItems(scene);
                    const sc = {
                        dynamicId: scene._server_id,
                        staticId: scene.getId().get(),
                        name: scene.info.name.get(),
                        description: scene.info.description.get(),
                        type: scene.info.type.get(),
                        autoLoad: scene.info.autoLoad.get(),
                        sceneAlignMethod: (_a = scene.info.sceneAlignMethod) === null || _a === void 0 ? void 0 : _a.get(),
                        useAllDT: (_b = scene.info.useAllDT) === null || _b === void 0 ? void 0 : _b.get(),
                        scenesItems,
                    };
                    if (typeof scene.info.options !== 'undefined') {
                        sc.options = [];
                        for (let idx = 0; idx < scene.info.options.length; idx++) {
                            const option = scene.info.options[idx];
                            let urn = option.urn
                                .get()
                                .replace(/http:\/\/.*viewerForgeFiles\//, '');
                            const opt = { urn };
                            if (option.loadOption)
                                opt.loadOption = option.loadOption.get();
                            if (option.dbIds)
                                opt.dbIds = option.dbIds.get();
                            sc.options.push(opt);
                        }
                    }
                    return res.json(sc);
                }
            }
            return res.json({});
        }
        catch (e) {
            console.error(e);
            res.status(500).json({});
        }
    }));
};
//# sourceMappingURL=default.js.map