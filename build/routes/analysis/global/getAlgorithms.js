"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
       * @swagger
       * /api/v1/analysis/algorithms:
       *   get:
       *     security:
       *       - bearerAuth:
       *         - readOnly
       *     description: Returns a list of algorithm for analysis
       *     summary: Gets analysis algorithms
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
    app.get("/api/v1/analysis/algorithms", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const data = spinal_model_analysis_1.ALGORITHMS ? Object.values(spinal_model_analysis_1.ALGORITHMS) : [];
            return res.json({
                data,
                meta: {
                    count: data.length,
                    analysisModuleVersion: spinal_model_analysis_1.VERSION
                }
            });
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
//# sourceMappingURL=getAlgorithms.js.map