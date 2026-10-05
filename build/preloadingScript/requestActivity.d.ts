import type { NextFunction, Request, Response } from 'express';
/**
 * Keeps track of how busy the API server is, so that background work (the
 * snapshot preloader) can run in the gaps between requests instead of
 * competing with them.
 *
 * @class RequestActivity
 */
declare class RequestActivity {
    private inFlight;
    private lastActivityAt;
    private served;
    /** number of requests being served right now */
    get pending(): number;
    /** number of requests served since the organ started */
    get count(): number;
    /**
     * Milliseconds elapsed since the last request ended, 0 while requests are
     * still being served.
     *
     * @return {*}  {number}
     * @memberof RequestActivity
     */
    idleFor(): number;
    /**
     * Express middleware counting the requests in flight. Register it first so
     * that it covers the whole lifecycle of every request.
     *
     * @memberof RequestActivity
     */
    middleware: (req: Request, res: Response, next: NextFunction) => void;
}
export declare const requestActivity: RequestActivity;
export {};
