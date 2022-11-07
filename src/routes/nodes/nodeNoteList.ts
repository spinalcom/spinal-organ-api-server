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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/node/{id}/note_list:
*   get:
*     security: 
*       - OauthSecurity: 
*         - readOnly
*     description: Returns notes of node
*     summary: Get list notes of node
*     tags:
*       - Nodes
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
  app.get("/api/v1/node/:id/note_list", async (req, res, next) => {
    try {
      var node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      //@ts-ignore
      SpinalGraphService._addNode(node)
      var _notes = []
      var notes = await serviceDocumentation.getNotes(node)
      for (const note of notes) {
        let infoNote = {
          date: note.element.date.get(),
          type: note.element.type.get(),
          message: note.element.message.get()
        }
        _notes.push(infoNote)
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("ko");
    }
    res.json(_notes);
  })
}
