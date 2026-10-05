import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
import { type IPreloadingScript } from './preloadingScript';
/**
 * Which strategy `runPreloading` picked.
 *
 * - `script` : the blocking preloading script ran, and is done
 * - `snapshot` : the node snapshot is being loaded in the background
 *
 * @export
 */
export type PreloadStrategy = 'script' | 'snapshot';
/**
 * Preloads the organ, picking the strategy that fits the moment it starts :
 *
 * - during the work hours, with a node snapshot available, the snapshot is
 *   loaded back in the background, in the idle time between requests, and this
 *   resolves right away so the organ can start answering ;
 * - outside of the work hours, or without a usable snapshot, the preloading
 *   script runs and is awaited, as there is nothing better to load.
 *
 * Call it where the blocking preloading script used to be called, before the
 * server starts listening. Errors of the preloading script are caught and
 * logged : preloading is best effort and must never keep the organ from
 * starting.
 *
 * @export
 * @param {ISpinalAPIMiddleware} spinalAPIMiddleware
 * @param {string} profileId the profile the nodes are loaded as. Hosts that
 * check the rights of a profile on load (bos-config) must pass their admin
 * profile id here, the same one they pass to the preloading script
 * @param {IPreloadingScript} scriptOptions the preload_config of the host
 * @return {*}  {Promise<PreloadStrategy>}
 */
export declare function runPreloading(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, scriptOptions: IPreloadingScript): Promise<PreloadStrategy>;
