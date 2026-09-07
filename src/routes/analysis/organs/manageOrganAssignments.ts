import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { awaitSync } from '../../../utilities/awaitSync';
import {
  VERSION,
  listAssignmentOrganNames,
  loadAssignmentFile,
  loadOrCreateAssignmentFile,
  readAssignment,
  setAssignmentEnabled,
  setAssignmentAnalytics,
  addAssignedAnalytic,
  removeAssignedAnalytic,
} from 'spinal-model-analysis';

/**
 * Routes to manage which analyses each spinal-organ-analysis instance handles (opt-in load
 * splitting). Each organ owns a file at /etc/Organs/Analysis/<ORGAN_NAME> with an
 * { enabled, analytics[] } record; these routes read/write those files by organ name.
 *
 * Assignment is opt-in: an organ with enabled=false (or no file) runs ALL Active analyses.
 * Turn enabled=true on every participating organ and give them disjoint lists to split load.
 */
module.exports = function (logger: any, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  const conn = () => (spinalAPIMiddleware as any).conn;
  const meta = { analysisModuleVersion: VERSION };

  const stateOf = (organName: string, model: any, exists: boolean) => {
    const s = readAssignment(model);
    return { organName, exists, enabled: s.enabled, analytics: s.analytics, analyticsCount: s.analytics.length };
  };

  const handleError = (res: express.Response, error: any) => {
    if (error?.code && error?.message) return res.status(error.code).send(error.message);
    if (error?.message) return res.status(400).send(error.message);
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
      getProfileId(req);
      const names = await listAssignmentOrganNames(conn());
      const data = [];
      for (const organName of names) {
        const model = await loadAssignmentFile(organName, conn());
        data.push(stateOf(organName, model, model !== null));
      }
      return res.json({ data, meta });
    } catch (error: any) {
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
      getProfileId(req);
      const organName = req.params.organName;
      const model = await loadAssignmentFile(organName, conn());
      return res.json({ data: stateOf(organName, model, model !== null), meta });
    } catch (error: any) {
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
      getProfileId(req);
      const organName = req.params.organName;
      const { enabled, analytics } = req.body ?? {};

      if (enabled !== undefined && typeof enabled !== 'boolean') {
        return res.status(400).send('"enabled" must be a boolean');
      }
      if (analytics !== undefined) {
        if (!Array.isArray(analytics) || !analytics.every((a: unknown) => typeof a === 'string')) {
          return res.status(400).send('"analytics" must be an array of strings');
        }
      }
      if (enabled === undefined && analytics === undefined) {
        return res.status(400).send('Provide "enabled" and/or "analytics"');
      }

      const model = await loadOrCreateAssignmentFile(organName, conn());
      if (analytics !== undefined) setAssignmentAnalytics(model, analytics);
      if (enabled !== undefined) setAssignmentEnabled(model, enabled);
      await awaitSync(model as any);

      return res.json({ data: stateOf(organName, model, true), meta });
    } catch (error: any) {
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
      getProfileId(req);
      const { organName, analyticId } = req.params;
      const model = await loadOrCreateAssignmentFile(organName, conn());
      const added = addAssignedAnalytic(model, analyticId);
      await awaitSync(model as any);
      return res.json({ data: { ...stateOf(organName, model, true), added }, meta });
    } catch (error: any) {
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
      getProfileId(req);
      const { organName, analyticId } = req.params;
      const model = await loadAssignmentFile(organName, conn());
      if (!model) return res.status(404).send(`No assignment file for organ "${organName}"`);
      const removed = removeAssignedAnalytic(model, analyticId);
      await awaitSync(model as any);
      return res.json({ data: { ...stateOf(organName, model, true), removed }, meta });
    } catch (error: any) {
      return handleError(res, error);
    }
  });
};
