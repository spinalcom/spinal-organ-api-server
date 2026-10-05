"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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
const snapshotUtils_1 = require("./snapshotUtils");
/** a snapshot walks the whole FileSystem, only run one at a time */
let snapshotRunning = false;
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/snapshot/nodes:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Snapshot the nodes currently loaded in the FileSystem
     *     description: Walks FileSystem._objects and writes the dynamic id (_server_id) of every loaded node into a file, so that they can be preloaded later on. The file location defaults to snapshots/nodes.json and is overridable with the SNAPSHOT_FILE environment variable.
     *     tags:
     *      - Snapshot
     *     responses:
     *       200:
     *         description: Snapshot written
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 version:
     *                   type: number
     *                 createdAt:
     *                   type: string
     *                 digitalTwinPath:
     *                   type: string
     *                 objectCount:
     *                   type: number
     *                   description: Number of objects held by the FileSystem
     *                 nodeCount:
     *                   type: number
     *                   description: Number of node ids written to the file
     *                 file:
     *                   type: string
     *                   description: Absolute path of the written file
     *                 durationMs:
     *                   type: number
     *       409:
     *         description: A snapshot is already running
     *       500:
     *         description: Internal error
     */
    app.post('/api/v1/snapshot/nodes', async (req, res) => {
        if (snapshotRunning) {
            return res.status(409).send('A snapshot is already running');
        }
        snapshotRunning = true;
        try {
            const result = await (0, snapshotUtils_1.writeNodeSnapshot)();
            console.log(`snapshot : ${result.nodeCount} nodes out of ${result.objectCount} objects written to ${result.file} in ${result.durationMs}ms`);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            return res
                .status(500)
                .send(`Failed to write the node snapshot : ${error?.message ?? error}`);
        }
        finally {
            snapshotRunning = false;
        }
    });
};
//# sourceMappingURL=createNodeSnapshot.js.map