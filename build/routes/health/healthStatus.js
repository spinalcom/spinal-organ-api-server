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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/healthStatus:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get the health of every organ of the platform
     *     description: >-
     *       Reads the monitoring directory of the hub (`/etc/Organs/Monitoring`) and returns every organ
     *       it knows, with its boot time, the time of its last health report and its RSS memory use.
     *
     *
     *       `state` is `ON` when the organ reported within the **last 5 minutes**, `OFF` otherwise. The
     *       response also carries `bootTimestampBos`, the boot time of the platform itself.
     *
     *
     *       `logList` is always returned empty.
     *     tags:
     *      - Health
     *     responses:
     *       200:
     *         description: The platform boot time and the health of every known organ.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 bootTimestampBos:
     *                   type: integer
     *                   format: int64
     *                 organsHealth:
     *                   type: array
     *                   items:
     *                    $ref: '#/components/schemas/HealthStatus'
     *       400:
     *         description: The monitoring directory could not be read.
     */
    app.get('/api/v1/healthStatus', async (req, res, next) => {
        function isWithinTwoMinutes(timestamp) {
            const twoMinutesAgo = Date.now() - (5 * 60 * 1000); // calculate timestamp for 2 minutes ago
            return (timestamp >= twoMinutesAgo && timestamp <= Date.now()); // check if timestamp is within 2 minutes
        }
        const organs = [];
        try {
            spinalAPIMiddleware.conn.load("/etc/Organs/Monitoring", async (directory) => {
                if (!directory)
                    return;
                for (const file of directory) {
                    const fileLoaded = await file.load();
                    if (file._info.model_type.get() === "ConfigFile") {
                        let state;
                        if (isWithinTwoMinutes(fileLoaded.genericOrganData.lastHealthTime.get())) {
                            state = "ON";
                        }
                        else {
                            state = "OFF";
                        }
                        const infoOrganHealth = {
                            name: fileLoaded.genericOrganData?.name?.get(),
                            bootTimestamp: fileLoaded.genericOrganData?.bootTimestamp?.get(),
                            lastHealthTime: fileLoaded.genericOrganData?.lastHealthTime?.get(),
                            ramRssUsed: fileLoaded.genericOrganData?.ramRssUsed?.get(),
                            state: state,
                            logList: []
                        };
                        organs.push(infoOrganHealth);
                    }
                }
                let bootTimestamp;
                spinalAPIMiddleware.conn.load_or_make_dir("/etc", async (directory) => {
                    for (const file of directory) {
                        if (file._info.model_type.get() === "model_status") {
                            const fileLoaded = await file.load();
                            bootTimestamp = fileLoaded.boot_timestamp.get();
                        }
                    }
                    const healObject = {
                        bootTimestampBos: bootTimestamp,
                        organsHealth: organs
                    };
                    res.send(healObject);
                });
            });
        }
        catch (error) {
            console.error(error);
            res.status(400).send('list of healthStatus organs is not loaded');
        }
    });
};
//# sourceMappingURL=healthStatus.js.map