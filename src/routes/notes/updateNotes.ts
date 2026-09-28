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
// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/node/{id}/update_note:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Update a note of a node (currently a no-op)
   *     description: >-
   *       **This route changes nothing today.** The call that edits the note is commented out in the
   *       handler : the request loads the node, reads its notes and answers **200 with an empty body**
   *       without writing anything, whatever `note` contains.
   *
   *
   *       It also has no way of saying *which* note to edit - there is no note identifier in the path
   *       or the body. Until it is implemented, add a new note with `/api/v1/node/{id}/add_note`.
   *     tags:
   *       - Notes
   *     parameters:
   *       - in: path
   *         name: id
   *         description: Dynamic ID of the node.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - note
   *             properties:
   *               note:
   *                 type: string
   *                 description: Ignored by the current implementation.
   *     responses:
   *       200:
   *         description: The request was accepted. The body is empty and no note was changed.
   *       401:
   *         description: The profile is not allowed to write on this node.
   *       500:
   *         description: The node could not be loaded.
   */
  app.put("/api/v1/node/:id/update_note", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(node)
      const notes = await serviceDocumentation.getNotes(node)

      const user = { username: "string", userId: 0 }

      res.json();

      // await serviceDocumentation.editNote(element, req.body.note)

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  })
}
