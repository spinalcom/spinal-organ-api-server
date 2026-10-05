/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import type { NextFunction, Request, Response } from 'express';

/**
 * Keeps track of how busy the API server is, so that background work (the
 * snapshot preloader) can run in the gaps between requests instead of
 * competing with them.
 *
 * @class RequestActivity
 */
class RequestActivity {
  private inFlight = 0;
  private lastActivityAt = Date.now();
  private served = 0;

  /** number of requests being served right now */
  get pending(): number {
    return this.inFlight;
  }

  /** number of requests served since the organ started */
  get count(): number {
    return this.served;
  }

  /**
   * Milliseconds elapsed since the last request ended, 0 while requests are
   * still being served.
   *
   * @return {*}  {number}
   * @memberof RequestActivity
   */
  idleFor(): number {
    if (this.inFlight > 0) return 0;
    return Date.now() - this.lastActivityAt;
  }

  /**
   * Express middleware counting the requests in flight. Register it first so
   * that it covers the whole lifecycle of every request.
   *
   * @memberof RequestActivity
   */
  middleware = (req: Request, res: Response, next: NextFunction): void => {
    this.inFlight += 1;
    this.served += 1;
    this.lastActivityAt = Date.now();

    // 'finish' and 'close' can both fire, only count the request out once
    let ended = false;
    const onEnd = () => {
      if (ended) return;
      ended = true;
      this.inFlight -= 1;
      this.lastActivityAt = Date.now();
    };
    res.on('finish', onEnd);
    res.on('close', onEnd);

    next();
  };
}

export const requestActivity = new RequestActivity();
