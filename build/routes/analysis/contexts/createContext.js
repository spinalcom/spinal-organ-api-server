"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const awaitSync_1 = require("../../../utilities/awaitSync");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/contexts:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Create an analysis context
     *     description: Creates a new analysis context node and returns its information
     *     tags:
     *       - Analysis
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - contextName
     *             properties:
     *               contextName:
     *                 type: string
     *                 description: Name of the analysis context to create
     *                 example: Energy Analysis
     *     responses:
     *       200:
     *         description: Analysis context successfully created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   description: Created analysis context node information
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *                       description: Version of spinal-model-analysis used
     *       400:
     *         description: Bad request
     */
    app.post("/api/v1/analysis/contexts", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextName = req.body.contextName;
            const node = await spinal_model_analysis_1.spinalAnalyticNodeManagerService.createContext(contextName);
            await (0, awaitSync_1.awaitSync)(node);
            return res.json({
                data: {
                    id: node._server_id,
                    name: node.getName().get(),
                    type: node.getType().get(),
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
//# sourceMappingURL=createContext.js.map