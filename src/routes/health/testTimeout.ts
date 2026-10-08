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


import { ISpinalAPIMiddleware } from '../../interfaces';
import * as express from 'express';

module.exports = function (
  _logger,  // ignored
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/test-timeout:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Delay a response on purpose (diagnostics)
   *     description: >-
   *       Waits `ms` milliseconds and then answers. It touches no node and reads nothing from the
   *       graph; it exists to check how a gateway, a proxy or a client behaves when a request takes
   *       long or times out.
   *
   *
   *       There is no upper bound on `ms` : a large value holds the connection open for that long.
   *     tags:
   *      - Health
   *     parameters:
   *       - in: query
   *         name: ms
   *         required: false
   *         schema:
   *           type: integer
   *           default: 0
   *           example: 5000
   *         description: Delay in milliseconds before answering. Must be a non-negative number.
   *     responses:
   *       200:
   *         description: The delay elapsed.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: "`ms` is not a number or is negative (\"Invalid 'ms' value\")."
   */

  app.get('/api/v1/test-timeout', async (req, res, next) => {
    const ms = Number(req.query.ms ?? 0);

    if (isNaN(ms) || ms < 0) {
      return res.status(400).json({ error: "Invalid 'ms' value" });
    }

    console.log(`[test-timeout] Requested delay: ${ms} ms`);

    // Detect if the request is aborted (timeout or client closed)
    req.on('aborted', () => {
      console.warn('[test-timeout] Request aborted (likely due to timeout)');
    });

    try {
      await new Promise(resolve => setTimeout(resolve, ms));
    } catch (e) {
      console.error('[test-timeout] Delay interrupted:', e);
      return next(e);
    }

    if (res.headersSent) return;

    return res.status(200).json({
      message: `Responded after ${ms} ms`
    });
  });
};