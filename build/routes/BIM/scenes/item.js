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
const sceneUtils = require("./sceneUtils");
module.exports = function (logger, app) {
    /**
     * @swagger
     * /api/v1/BIM/scene/{id}:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Retrun the target scene with it's items
     *     summary: Get the target scene with it's items
     *     parameters:
     *       - in: path
     *         name: id
     *         description: dynamic or static id
     *         required: true
     *         schema:
     *           oneOf:
     *             - type: string
     *             - type: integer
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
    app.get('/api/v1/BIM/scene/:id', async (req, res, spinalAPIMiddleware) => {
        try {
            const id = req.params.id;
            const scenes = await sceneUtils.getScenes(spinalAPIMiddleware);
            for (const scene of scenes) {
                if (sceneUtils.isNodeId(scene, id)) {
                    // eslint-disable-next-line no-await-in-loop
                    const scenesItems = await sceneUtils.sceneGetItems(scene, spinalAPIMiddleware);
                    const sc = {
                        dynamicId: scene._server_id,
                        staticId: scene.getId().get(),
                        name: scene.info.name.get(),
                        description: scene.info.description.get(),
                        type: scene.info.type.get(),
                        autoLoad: scene.info.autoLoad.get(),
                        sceneAlignMethod: scene.info.sceneAlignMethod?.get(),
                        useAllDT: scene.info.useAllDT?.get(),
                        scenesItems,
                    };
                    if (typeof scene.info.options !== 'undefined') {
                        sc.options = [];
                        for (let idx = 0; idx < scene.info.options.length; idx++) {
                            const option = scene.info.options[idx];
                            const urn = option.urn
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
            return res.status(400).json('item not found');
        }
        catch (e) {
            console.error(e);
            res.status(500).json({});
        }
    });
};
//# sourceMappingURL=item.js.map