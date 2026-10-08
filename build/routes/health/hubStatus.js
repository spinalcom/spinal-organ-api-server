"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/hubStatus:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get the state of the connection of this organ to the hub
     *     description: >-
     *       Answers from memory, without any request to the hub : it keeps answering while the hub is
     *       down, and the status code alone tells whether the organ can reach the hub.
     *
     *
     *       spinal-core-connectorjs keeps the connection when the hub stops answering or restarts : the
     *       organ keeps answering the other routes from memory, keeps what it could not send, and once
     *       the hub is back it opens a new session and loads back the models in memory (`resyncing`) so
     *       that the hub sends their changes again.
     *
     *
     *       `state` is one of :
     *
     *       - `connecting` : the first session is not open yet
     *
     *       - `connected` : the hub answers and knows the session of the organ
     *
     *       - `disconnected` : the hub does not answer, the session may still be valid
     *
     *       - `reconnecting` : the hub no longer knows the session (it restarted), a new one is being opened
     *
     *       - `resyncing` : the new session is open, the models in memory are being loaded back
     *
     *       - `closed` : the connection gave up, the organ is about to exit
     *
     *       - `unknown` : the installed spinal-core-connectorjs does not report it (older than the
     *       reconnection), the organ exits when it loses the hub
     *     tags:
     *      - Health
     *     responses:
     *       200:
     *         description: The organ can reach the hub (`connected`, `resyncing`), or the state is `unknown`.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HubStatus'
     *             example:
     *               state: connected
     *               since: 1790856078046
     *               hub: http://127.0.0.1:7777
     *               disconnections: 1
     *               sessionsOpened: 2
     *               lastError:
     *                 at: 1790856071234
     *                 message: "cannot reach the hub at http://127.0.0.1:7777: ECONNREFUSED"
     *               lastResync:
     *                 at: 1790856078046
     *                 durationMs: 1900
     *                 reloaded: 20002
     *                 missing: 0
     *       503:
     *         description: >-
     *           The organ cannot reach the hub (`connecting`, `disconnected`, `reconnecting`, `closed`).
     *           It keeps answering the other routes from memory.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HubStatus'
     */
    app.get('/api/v1/hubStatus', (req, res) => {
        const conn = spinalAPIMiddleware.conn;
        if (typeof conn?.getConnectionStatus !== 'function') {
            return res.json({ state: 'unknown' });
        }
        const status = conn.getConnectionStatus();
        const reachable = status.state === 'connected' || status.state === 'resyncing';
        return res.status(reachable ? 200 : 503).json(status);
    });
};
//# sourceMappingURL=hubStatus.js.map