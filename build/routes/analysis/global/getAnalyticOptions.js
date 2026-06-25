"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/analyticOptions:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: >
     *       Returns the analytic-level option metadata used to build the analysis form:
     *       the available work-node concurrency modes (with their configurable fields and
     *       which is the default) and the available lifecycle statuses (with which is the
     *       default). Lets clients render concurrency/status selectors generically, the
     *       same way triggerTypes drives the trigger form. Single source of truth for the
     *       selectable values of `concurrency` and `status` in IAnalysisConfigJSON.
     *     summary: Gets the selectable concurrency modes and lifecycle statuses for an analytic
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
     *                   type: object
     *                   properties:
     *                     concurrencyModes:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           mode:
     *                             type: string
     *                             enum: [BOUNDED, FULL, SEQUENTIAL]
     *                           description:
     *                             type: string
     *                           default:
     *                             type: boolean
     *                             description: Whether this is the mode applied when none is specified
     *                           fields:
     *                             type: array
     *                             items:
     *                               type: object
     *                               properties:
     *                                 name:
     *                                   type: string
     *                                 type:
     *                                   type: string
     *                                   enum: [string, number, boolean]
     *                                 description:
     *                                   type: string
     *                                 required:
     *                                   type: boolean
     *                                 default:
     *                                   description: Value to pre-fill when none is provided
     *                     statuses:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           value:
     *                             type: string
     *                             enum: [Active, Inactive]
     *                           description:
     *                             type: string
     *                           default:
     *                             type: boolean
     *                             description: Whether this is the value applied when none is specified
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/analysis/analyticOptions", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const data = {
                concurrencyModes: spinal_model_analysis_1.CONCURRENCY_MODE_DEFINITIONS,
                statuses: spinal_model_analysis_1.ANALYSIS_STATUS_DEFINITIONS,
            };
            return res.json({
                data,
                meta: {
                    analysisModuleVersion: spinal_model_analysis_1.VERSION,
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
//# sourceMappingURL=getAnalyticOptions.js.map