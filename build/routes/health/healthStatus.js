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
     *       - OauthSecurity:
     *         - readOnly
     *     description: Return list of health Status organ
     *     summary: Gets a list of health Status organ
     *     tags:
     *      - Health
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/HealthStatus'
     *       400:
     *         description: Bad request
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