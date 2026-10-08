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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/room/{id}/notes:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the notes attached to a room
     *     description: >-
     *       Returns the notes written on a room as `{ date, type, message }`, where `date` is a
     *       timestamp in milliseconds and `type` the media type of the note.
     *
     *
     *       Same data as the generic `/api/v1/node/{id}/note_list`, with an extra check that the node
     *       really is a `geographicRoom`.
     *     tags:
     *       - Geographic Context
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the room.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The notes attached to the room (an empty array if there are none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Note'
     *       400:
     *         description: The node is not a room ("node is not of type geographic room").
     *       401:
     *         description: The profile is not allowed to read this room.
     *       500:
     *         description: The room could not be loaded or its notes could not be read.
     */
    app.get('/api/v1/room/:id/notes', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            if (room.getType().get() === 'geographicRoom') {
                const _notes = [];
                const notes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getNotes(room);
                for (const note of notes) {
                    const infoNote = {
                        date: parseInt(note.element.date.get()),
                        type: note.element.type.get(),
                        message: note.element.message.get(),
                    };
                    _notes.push(infoNote);
                }
                return res.json(_notes);
            }
            else {
                return res.status(400).send('node is not of type geographic room');
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=roomNotes.js.map