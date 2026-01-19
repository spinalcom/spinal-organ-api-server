"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/contexts/{contextId}:
     *   get:
     *     security:
     *       - bearerAuth:
     *           - readOnly
     *     summary: Get analysis context by ID
     *     description: Retrieves information about a specific analysis context node by its ID
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: string
     *           description: ID of the analysis context to retrieve
     *     responses:
     *       200:
     *         description: Analysis context successfully retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   description: Analysis context node information
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *                       description: Version of spinal-model-analysis used
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/analysis/contexts/:contextId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextId = req.params.contextId;
            const node = await spinalAPIMiddleware.load(parseInt(contextId, 10), profileId);
            return res.json({
                data: {
                    id: node._server_id,
                    name: node.getName().get(),
                    type: node.getType().get()
                },
                meta: {
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
//# sourceMappingURL=getContext.js.map