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

module.exports = function (logger, app,  spinalAPIMiddleware: ISpinalAPIMiddleware) {
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
  app.get('/api/v1/BIM/scene/default', async (req, res, next) => {
    try {
      const scenes = await sceneUtils.getScenes(spinalAPIMiddleware);
      for (const scene of scenes) {
        if (scene.info.autoLoad.get() === true) {
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

      return res.json({});
    } catch (e) {
      console.error(e);
      res.status(500).json({});
    }
  });
};
