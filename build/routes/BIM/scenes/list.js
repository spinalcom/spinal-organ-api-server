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
const sceneUtils = require('./sceneUtils');
module.exports = function (logger, app) {
    /**
     * @swagger
     * /api/v1/BIM/scene/list:
     *   get:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Retrun the list of scenes
     *     summary: Get scenes of the list
     *     tags:
     *       - BIM
     *     responses:
     *       200:
     *         description: Array of scenes
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/ISceneListReturn'
     *       500:
     *         description: internal error
     */
    app.get('/api/v1/BIM/scene/list', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const scenes = yield sceneUtils.getScenes();
            const body = {
                scenes: scenes.map((scene) => {
                    var _a, _b;
                    const sc = {
                        dynamicId: scene._server_id,
                        staticId: scene.getId().get(),
                        name: scene.info.name.get(),
                        description: scene.info.description.get(),
                        type: scene.info.type.get(),
                        autoLoad: scene.info.autoLoad.get(),
                        sceneAlignMethod: (_a = scene.info.sceneAlignMethod) === null || _a === void 0 ? void 0 : _a.get(),
                        useAllDT: (_b = scene.info.useAllDT) === null || _b === void 0 ? void 0 : _b.get(),
                    };
                    // if (typeof scene.info.options !== 'undefined') {
                    //   sc.options = [];
                    //   for (let idx = 0; idx < scene.info.options.length; idx++) {
                    //     const option = scene.info.options[idx];
                    //     const opt: IOptionsItem = {
                    //       urn: option.urn
                    //         .get()
                    //         .replace(/http:\/\/.*viewerForgeFiles\//, ''),
                    //     };
                    //     if (option.loadOption) opt.loadOption = option.loadOption.get();
                    //     if (option.dbIds) opt.dbIds = option.dbIds.get();
                    //     sc.options.push(opt);
                    //   }
                    // }
                    return sc;
                }),
            };
            res.json(body);
        }
        catch (e) {
            console.error(e);
            res.status(500).json({});
        }
    }));
};
//# sourceMappingURL=list.js.map