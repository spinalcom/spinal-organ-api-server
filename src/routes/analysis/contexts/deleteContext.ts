import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalyticNodeManagerService, VERSION } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';

module.exports = function (logger: any, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

    /**
     * @swagger
     * /api/v1/analysis/contexts/{contextId}:
     *   delete:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Delete an analysis context by its ID
     *     description: Deletes the analysis context and all its child analysis nodes.
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: string
     *           description: server_id of the analysis context to delete
     *     responses:
     *       200:
     *         description: Analysis context successfully deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     deleted:
     *                       type: boolean
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *       400:
     *         description: Bad request
     */

    app.delete("/api/v1/analysis/contexts/:contextId", async (req, res, next) => {
        try {
            const profileId = getProfileId(req);
            const contextId = req.params.contextId;

            const contextNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(contextId, 10), profileId);
            SpinalGraphService._addNode(contextNode);

            await spinalAnalyticNodeManagerService.deleteAnalysisContext(contextNode);

            return res.json({
                data: { deleted: true },
                meta: {
                    analysisModuleVersion: VERSION
                }
            });

        } catch (error: any) {
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
}
