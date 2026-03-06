import * as express from 'express';
export declare const MULTIPLE_ROUTE_IDS_LIMIT: number;
export declare const MULTIPLE_TIMESERIES_IDS_LIMIT: number;
export declare function getProfileId(req: express.Request): string;
export declare function validateArrayRequestLimit(items: unknown, itemLabel?: string, limit?: number): string | null;
