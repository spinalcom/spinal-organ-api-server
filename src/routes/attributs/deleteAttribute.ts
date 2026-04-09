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

import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import { getProfileId } from '../../utilities/requestUtilities';
import type { SpinalNode } from 'spinal-env-viewer-graph-service';
import type { Express } from 'express';
import type { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{idNode}/category/{idCategory}/attribut/{attributName}/delete:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: Delete attribute
   *     summary: delete an attribute
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
   *         description: Delete Successfully
   *       400:
   *         description: Bad request
   */

  app.delete(
    '/api/v1/node/:IdNode/category/:IdCategory/attribut/:attributName/delete',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);

        let aux = false;
        const node: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.IdNode, 10),
          profileId
        );
        const category: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.IdCategory, 10),
          profileId
        );
        const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);
        for (const children of childrens) {
          if (children.getId().get() === category.getId().get()) {
            const attributes = await category.getElement();
            for (let index = 0; index < attributes.length; index++) {
              const element = attributes[index];
              const elementLabel = element.label.get();

              if (
                elementLabel.toString().trim() ==
                req.params.attributName.toString().trim()
              ) {
                attributes.splice(index, 1);
                aux = true;
              }
            }
          }
        }
      } catch (error: any) {
        if (error.code)
          return res.status(error.code).send({ message: error.message });
        return res.status(400).send('ko');
      }
      res.status(200).send('ok');
    }
  );
};
