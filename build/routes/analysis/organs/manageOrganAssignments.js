"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const awaitSync_1 = require("../../../utilities/awaitSync");
const spinal_model_analysis_1 = require("spinal-model-analysis");
/**
 * Routes to manage which analyses each spinal-organ-analysis instance handles (opt-in load
 * splitting). Each organ owns a file at /etc/Organs/Analysis/<ORGAN_NAME> with an
 * { enabled, analytics[] } record; these routes read/write those files by organ name.
 *
 * Assignment is opt-in: an organ with enabled=false (or no file) runs ALL Active analyses.
 * Turn enabled=true on every participating organ and give them disjoint lists to split load.
 */
module.exports = function (logger, app, spinalAPIMiddleware) {
    const conn = () => spinalAPIMiddleware.conn;
    const meta = { analysisModuleVersion: spinal_model_analysis_1.VERSION };
    const stateOf = (organName, model, exists) => {
        const s = (0, spinal_model_analysis_1.readAssignment)(model);
        return { organName, exists, enabled: s.enabled, analytics: s.analytics, analyticsCount: s.analytics.length };
    };
    const handleError = (res, error) => {
        if (error?.code && error?.message)
            return res.status(error.code).send(error.message);
        if (error?.message)
            return res.status(400).send(error.message);
        console.error(error);
        return res.status(400).send(error);
    };
    /**
     * @swagger
     * /api/v1/analysis/organs:
     *   get:
     *     security:
     *       - bearerAuth: [readOnly]
     *     summary: List analysis organs and their assignment records
     *     description: Lists every organ that has an assignment file in /etc/Organs/Analysis, with its enabled flag and assigned analytic ids.
     *     tags: [Analysis]
     *     responses:
     *       200: { description: Success }
     *       400: { description: Bad request }
     */
    app.get('/api/v1/analysis/organs', async (req, res) => {
        try {
            (0, requestUtilities_1.getProfileId)(req);
            const names = await (0, spinal_model_analysis_1.listAssignmentOrganNames)(conn());
            const data = [];
            for (const organName of names) {
                const model = await (0, spinal_model_analysis_1.loadAssignmentFile)(organName, conn());
                data.push(stateOf(organName, model, model !== null));
            }
            return res.json({ data, meta });
        }
        catch (error) {
            return handleError(res, error);
        }
    });
    /**
     * @swagger
     * /api/v1/analysis/organs/{organName}/assignment:
     *   get:
     *     security:
     *       - bearerAuth: [readOnly]
     *     summary: Get one organ's assignment record
     *     description: Returns { enabled, analytics }. If the organ has no file yet, returns exists=false with run-all defaults.
     *     tags: [Analysis]
     *     parameters:
     *       - in: path
     *         name: organName
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200: { description: Success }
     *       400: { description: Bad request }
     */
    app.get('/api/v1/analysis/organs/:organName/assignment', async (req, res) => {
        try {
            (0, requestUtilities_1.getProfileId)(req);
            const organName = req.params.organName;
            const model = await (0, spinal_model_analysis_1.loadAssignmentFile)(organName, conn());
            return res.json({ data: stateOf(organName, model, model !== null), meta });
        }
        catch (error) {
            return handleError(res, error);
        }
    });
    /**
     * @swagger
     * /api/v1/analysis/organs/{organName}/assignment:
     *   put:
     *     security:
     *       - bearerAuth: [write]
     *     summary: Set an organ's assignment record
     *     description: Sets `enabled` and/or replaces `analytics`. Creates the organ's file if it doesn't exist yet.
     *     tags: [Analysis]
     *     parameters:
     *       - in: path
     *         name: organName
     *         required: true
     *         schema: { type: string }
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               enabled: { type: boolean }
     *               analytics: { type: array, items: { type: string } }
     *     responses:
     *       200: { description: Updated }
     *       400: { description: Bad request }
     */
    app.put('/api/v1/analysis/organs/:organName/assignment', async (req, res) => {
        try {
            (0, requestUtilities_1.getProfileId)(req);
            const organName = req.params.organName;
            const { enabled, analytics } = req.body ?? {};
            if (enabled !== undefined && typeof enabled !== 'boolean') {
                return res.status(400).send('"enabled" must be a boolean');
            }
            if (analytics !== undefined) {
                if (!Array.isArray(analytics) || !analytics.every((a) => typeof a === 'string')) {
                    return res.status(400).send('"analytics" must be an array of strings');
                }
            }
            if (enabled === undefined && analytics === undefined) {
                return res.status(400).send('Provide "enabled" and/or "analytics"');
            }
            const model = await (0, spinal_model_analysis_1.loadOrCreateAssignmentFile)(organName, conn());
            if (analytics !== undefined)
                (0, spinal_model_analysis_1.setAssignmentAnalytics)(model, analytics);
            if (enabled !== undefined)
                (0, spinal_model_analysis_1.setAssignmentEnabled)(model, enabled);
            await (0, awaitSync_1.awaitSync)(model);
            return res.json({ data: stateOf(organName, model, true), meta });
        }
        catch (error) {
            return handleError(res, error);
        }
    });
    /**
     * @swagger
     * /api/v1/analysis/organs/{organName}/analytics/{analyticId}:
     *   post:
     *     security:
     *       - bearerAuth: [write]
     *     summary: Assign one analysis to an organ
     *     description: Adds the analysis id to the organ's list (creating the file if needed). Idempotent.
     *     tags: [Analysis]
     *     parameters:
     *       - in: path
     *         name: organName
     *         required: true
     *         schema: { type: string }
     *       - in: path
     *         name: analyticId
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200: { description: Assigned }
     *       400: { description: Bad request }
     */
    app.post('/api/v1/analysis/organs/:organName/analytics/:analyticId', async (req, res) => {
        try {
            (0, requestUtilities_1.getProfileId)(req);
            const { organName, analyticId } = req.params;
            const model = await (0, spinal_model_analysis_1.loadOrCreateAssignmentFile)(organName, conn());
            const added = (0, spinal_model_analysis_1.addAssignedAnalytic)(model, analyticId);
            await (0, awaitSync_1.awaitSync)(model);
            return res.json({ data: { ...stateOf(organName, model, true), added }, meta });
        }
        catch (error) {
            return handleError(res, error);
        }
    });
    /**
     * @swagger
     * /api/v1/analysis/organs/{organName}/analytics/{analyticId}:
     *   delete:
     *     security:
     *       - bearerAuth: [write]
     *     summary: Unassign one analysis from an organ
     *     description: Removes the analysis id from the organ's list. 404 if the organ has no file.
     *     tags: [Analysis]
     *     parameters:
     *       - in: path
     *         name: organName
     *         required: true
     *         schema: { type: string }
     *       - in: path
     *         name: analyticId
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200: { description: Unassigned }
     *       404: { description: Organ has no assignment file }
     *       400: { description: Bad request }
     */
    app.delete('/api/v1/analysis/organs/:organName/analytics/:analyticId', async (req, res) => {
        try {
            (0, requestUtilities_1.getProfileId)(req);
            const { organName, analyticId } = req.params;
            const model = await (0, spinal_model_analysis_1.loadAssignmentFile)(organName, conn());
            if (!model)
                return res.status(404).send(`No assignment file for organ "${organName}"`);
            const removed = (0, spinal_model_analysis_1.removeAssignedAnalytic)(model, analyticId);
            await (0, awaitSync_1.awaitSync)(model);
            return res.json({ data: { ...stateOf(organName, model, true), removed }, meta });
        }
        catch (error) {
            return handleError(res, error);
        }
    });
};
//# sourceMappingURL=manageOrganAssignments.js.map