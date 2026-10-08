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

import * as sceneUtils from './sceneUtils';
import { IScenesbody, IOptionsItem } from './interfaces';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app) {
  /**
   * @swagger
   * /api/v1/BIM/scene/{id}:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get one BIM scene with its items
   *     description: >-
   *       Returns a scene together with `scenesItems`, the models it loads. The `id` is matched against
   *       both the dynamic ID and the static ID of the scenes, so either can be used.
   *
   *
   *       Beware of the two reserved names : `/api/v1/BIM/scene/list` and `/api/v1/BIM/scene/default`
   *       are registered before this route, so a scene can never be reached under those two ids.
   *     parameters:
   *       - in: path
   *         name: id
   *         description: Dynamic ID or static ID of the scene.
   *         required: true
   *         schema:
   *           oneOf:
   *             - type: string
   *             - type: integer
   *     tags:
   *       - BIM
   *     responses:
   *       200:
   *         description: The scene with its items.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/IScenesbody'
   *       400:
   *         description: No scene matches this id ("item not found").
   *       500:
   *         description: The scenes could not be read. The body is an empty object.
   */
  app.get('/api/v1/BIM/scene/:id', async (req, res, spinalAPIMiddleware: ISpinalAPIMiddleware) => {
    try {
      const id = req.params.id;
      const scenes = await sceneUtils.getScenes(spinalAPIMiddleware);
      for (const scene of scenes) {
        if (sceneUtils.isNodeId(scene, id)) {
          // eslint-disable-next-line no-await-in-loop
          const scenesItems = await sceneUtils.sceneGetItems(scene, spinalAPIMiddleware);
          const sc: IScenesbody = {
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
              const opt: IOptionsItem = { urn };
              if (option.loadOption) opt.loadOption = option.loadOption.get();
              if (option.dbIds) opt.dbIds = option.dbIds.get();
              sc.options.push(opt);
            }
          }
          return res.json(sc);
        }
      }

      return res.status(400).json('item not found');
    } catch (e) {
      console.error(e);
      res.status(500).json({});
    }
  });
};
