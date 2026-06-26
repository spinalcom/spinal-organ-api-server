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
     *     description: Returns analysis algorithms grouped by category. Each algorithm contains its name, description, inputs (each input slot has a name, accepted types, description, required flag and optional variadic flag), output type, and parameters. The `run` function is not serialized.
     *     summary: Gets analysis algorithms grouped by category
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
     *                     NUMBER:
     *                       type: array
     *                       items:
     *                         type: object
     *                     NODE:
     *                       type: array
     *                       items:
     *                         type: object
     *                     FLOW_CONTROL:
     *                       type: array
     *                       items:
     *                         type: object
     *                     REGISTER:
     *                       type: array
     *                       items:
     *                         type: object
     *                     OTHER:
     *                       type: array
     *                       items:
     *                         type: object
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
            const serialize = (a) => ({
                name: a.name,
                description: a.description,
                inputs: a.inputs,
                outputType: a.outputType,
                parameters: a.parameters,
            });
            const categorized = [
                ...spinal_model_analysis_1.NUMBER_ALGORITHMS,
                ...spinal_model_analysis_1.NODE_ALGORITHMS,
                ...spinal_model_analysis_1.FLOW_CONTROL_ALGORITHMS,
                ...spinal_model_analysis_1.REGISTER_ALGORITHMS,
                ...spinal_model_analysis_1.NODE_ATTRIBUTES_ALGORITHMS,
                ...spinal_model_analysis_1.LIST_ALGORITHMS,
                ...spinal_model_analysis_1.BOOLEAN_ALGORITHMS,
                ...spinal_model_analysis_1.CONVERSION_ALGORITHMS,
                ...spinal_model_analysis_1.OBJECT_ALGORITHMS,
                ...spinal_model_analysis_1.STRING_ALGORITHMS,
                ...spinal_model_analysis_1.TIMESERIES_ALGORITHMS,
                ...spinal_model_analysis_1.HTTP_ALGORITHMS,
                ...spinal_model_analysis_1.TICKET_ALGORITHMS,
            ];
            const categorizedNames = new Set(categorized.map(a => a.name));
            const other = spinal_model_analysis_1.ALGORITHM_DEFINITIONS.filter(a => !categorizedNames.has(a.name));
            const data = {
                NUMBER: spinal_model_analysis_1.NUMBER_ALGORITHMS.map(serialize),
                NODE: spinal_model_analysis_1.NODE_ALGORITHMS.map(serialize),
                FLOW_CONTROL: spinal_model_analysis_1.FLOW_CONTROL_ALGORITHMS.map(serialize),
                REGISTER: spinal_model_analysis_1.REGISTER_ALGORITHMS.map(serialize),
                NODE_ATTRIBUTES: spinal_model_analysis_1.NODE_ATTRIBUTES_ALGORITHMS.map(serialize),
                LIST: spinal_model_analysis_1.LIST_ALGORITHMS.map(serialize),
                BOOLEAN: spinal_model_analysis_1.BOOLEAN_ALGORITHMS.map(serialize),
                CONVERSION: spinal_model_analysis_1.CONVERSION_ALGORITHMS.map(serialize),
                OBJECT: spinal_model_analysis_1.OBJECT_ALGORITHMS.map(serialize),
                STRING: spinal_model_analysis_1.STRING_ALGORITHMS.map(serialize),
                TIMESERIES: spinal_model_analysis_1.TIMESERIES_ALGORITHMS.map(serialize),
                HTTP: spinal_model_analysis_1.HTTP_ALGORITHMS.map(serialize),
                TICKET: spinal_model_analysis_1.TICKET_ALGORITHMS.map(serialize),
                OTHER: other.map(serialize),
            };
            const count = Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
            return res.json({
                data,
                meta: {
                    count,
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
//# sourceMappingURL=getAlgorithms.js.map