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

import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import * as express from 'express';
import { getEquipmentStaticDetailsInfo } from '../../../utilities/getEquipmentStaticDetailsInfo';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/equipment/{id}/read_static_details:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: read static details of equipment
   *     summary: Gets static details of equipment
   *     tags:
   *       - Geographic Context
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
   *                $ref: '#/components/schemas/StaticDetailsRoom'
   *       400:
   *         description: Bad request
   */

  app.get('/api/v1/equipment/:id/read_static_details', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const info = await getEquipmentStaticDetailsInfo(
        spinalAPIMiddleware,
        profileId,
        parseInt(req.params.id,10),
      );
      return res.json(info);

    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      return res.status(400).send('ko');
    }
    
  });
};



