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

import {getScenes, sceneGetItems } from './sceneUtils';
import * as express from 'express';
import { IScenesItem, ISceneListReturn } from './interfaces';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger,
   app: express.Express,
   spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/BIM/scene/list:
   *   get:
   *     security:
   *       - bearerAuth:
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

  app.get('/api/v1/BIM/scene/list', async (req, res) => {
    try {
      const scenes = await getScenes(spinalAPIMiddleware);
      
      const body: ISceneListReturn =  {
        scenes: await Promise.all(scenes.map( async (scene) => {
          const items = await sceneGetItems(scene,spinalAPIMiddleware);
          //console.log(items);  
          const sc = {
            dynamicId: scene._server_id,
            staticId: scene.getId().get(),
            name: scene.info.name.get(),
            description: scene.info.description.get(),
            type: scene.info.type.get(),
            autoLoad: scene.info.autoLoad.get(),
            sceneAlignMethod: scene.info.sceneAlignMethod?.get(),
            useAllDT: scene.info.useAllDT?.get(),
            scenesItems: items
           // bimFiles : itemsInfo
          };
          return sc;
        })),
      };
      res.json(body);
    } catch (e) {
      console.error(e);
      res.status(500).json({});
    }
  });
};
