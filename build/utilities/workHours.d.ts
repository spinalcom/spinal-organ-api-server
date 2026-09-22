import type { IPreloadConfig } from '../interfaces/IConfig';
/**
 * Time of the day of a date, in minutes since midnight, in the local time of
 * the machine.
 *
 * @export
 * @param {Date} [date=new Date()]
 * @return {*}  {number}
 */
export declare function minutesSinceMidnight(date?: Date): number;
/**
 * Whether the given moment falls inside the configured work hours
 * (WORK_HOURS_START -> WORK_HOURS_END, 08:00 -> 19:00 by default).
 *
 * The window is inclusive on its start and exclusive on its end, and wraps
 * around midnight when its end is before its start (eg 22:00 -> 06:00).
 *
 * @export
 * @param {Date} [date=new Date()]
 * @param {IPreloadConfig} [preload=config.preload] the window to use ; a host
 * embedding the API server passes its own middleware config here
 * @return {*}  {boolean}
 */
export declare function isWithinWorkHours(date?: Date, preload?: IPreloadConfig): boolean;
/**
 * Formats minutes since midnight back into "HH:MM", for logs.
 *
 * @export
 * @param {number} minutes
 * @return {*}  {string}
 */
export declare function formatTimeOfDay(minutes: number): string;
/**
 * The configured work hours, formatted for logs : "08:00 -> 19:00".
 *
 * @export
 * @param {IPreloadConfig} [preload=config.preload]
 * @return {*}  {string}
 */
export declare function formatWorkHours(preload?: IPreloadConfig): string;
