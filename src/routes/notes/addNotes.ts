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
   * /api/v1/node/{id}/add_note:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Add a note to a node
   *     description: >-
   *       Appends a note to any node - a room, a piece of equipment, a ticket. Notes are read back with
   *       `/api/v1/node/{id}/note_list`.
   *
   *
   *       The note is recorded with a placeholder author (`username: "string"`, `userId: 0`), not with
   *       the caller's identity, so the author field of a note is not meaningful today.
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
   *                 description: The text of the note.
   *     responses:
   *       200:
   *         description: The note was added.
   *       401:
   *         description: The profile is not allowed to write on this node.
   *       500:
   *         description: The node could not be loaded, or the note could not be added.
   */
  app.post("/api/v1/node/:id/add_note", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(node)

      const user = { username: "string", userId: 0 }
      await serviceDocumentation.addNote(node, user, req.body.note)

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  })
}
