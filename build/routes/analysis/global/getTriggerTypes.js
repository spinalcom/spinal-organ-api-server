"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
       * @swagger
       * /api/v1/analysis/triggerTypes:
       *   get:
       *     security:
       *       - bearerAuth:
       *         - readOnly
       *     description: Returns a list of trigger type strings for analysis
       *     summary: Gets analysis trigger types
       *     tags:
       *       - Analysis
       *     responses:
       *       200:
       *         description: Success
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 data:
       *                   type: array
       *                   items:
       *                     type: string
       *                 meta:
       *                   type: object
       *                   properties:
       *                     count:
       *                       type: integer
       *                     analysisModuleVersion:
       *                       type: string
       *       400:
       *         description: Bad request
       */
    app.get("/api/v1/analysis/triggerTypes", async (req, res, next) => {
        try {
            // const profileId = getProfileId(req);
            // const data = CONSTANTS.TRIGGER_TYPE
            //   ? Object.values(CONSTANTS.TRIGGER_TYPE)
            //   : [];
            // return res.json({
            //   data,
            //   meta: {
            //     count: data.length,
            //     analysisModuleVersion: VERSION
            //   }
            // });
        }
        catch (error) {
            if (error?.code && error?.message) {
                return res.status(error.code).send(error.message);
            }
            if (error?.message) {
                return res.status(400).send(error.message);
            }
            console.error(error);
            return res.status(400).send(error);
        }
    });
};
//# sourceMappingURL=getTriggerTypes.js.map