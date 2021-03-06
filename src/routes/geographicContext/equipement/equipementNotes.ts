/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { Note } from '../interfacesGeoContext'
import { getProfileId } from '../../../utilities/requestUtilities';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/equipement/{id}/note_list:
 *   get:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Returns notes of equipement
 *     summary: Get list notes of equipement
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
 *               type: array
 *               items: 
 *                $ref: '#/components/schemas/Note'
 *       400:
 *         description: Bad request
*/
  app.get("/api/v1/equipement/:id/note_list", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      var equipement: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(equipement)
      if (equipement.getType().get() === "BIMObject") {
        var _notes = []
        var notes = await serviceDocumentation.getNotes(equipement)
        for (const note of notes) {
          let infoNote: Note = {
            date: note.element.date.get(),
            type: note.element.type.get(),
            message: note.element.message.get()
          }
          _notes.push(infoNote)
        }
      } else {
        res.status(400).send("node is not of type  BIMObject");
      }

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(_notes);
  })
}
