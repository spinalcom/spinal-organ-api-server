"use strict";
/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
const spinal_service_ticket_1 = require("spinal-service-ticket");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/{ticketId}/add_note:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: add a note
     *     summary: add a note
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: ticketId
     *         description: use the dynamic ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - note
     *             properties:
     *               note:
     *                 type: string
     *     responses:
     *       201:
     *         description: Add Successfully
     *       400:
     *         description: Add not Successfully
     */
    app.post('/api/v1/ticket/:ticketId/add_note', async (req, res) => {
        try {
            if (!req.params.ticketId) {
                return res.status(400).send('Ticket ID is required');
            }
            if (!req.body.note) {
                return res.status(400).send('Note content is required');
            }
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ticket = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.params.ticketId, 10), profileId, spinal_service_ticket_1.SPINAL_TICKET_SERVICE_TICKET_TYPE);
            const user = { username: 'admin', userId: 168 };
            const note = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addNote(ticket, user, req.body.note);
            const elementNote = await note.element.load();
            const info = {
                dynamicId: note._server_id,
                staticId: note.info.id.get(),
                name: note.info.name.get(),
                typeNode: note.info.type.get(),
                userName: elementNote.username?.get(),
                date: elementNote.date?.get(),
                typeNote: elementNote.type?.get(),
                message: elementNote.message?.get(),
            };
            return res.status(201).json(info);
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=ticketAddNote.js.map