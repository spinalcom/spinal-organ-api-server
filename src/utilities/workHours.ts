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

import config from '../config';
import type { IPreloadConfig } from '../interfaces/IConfig';

/**
 * Time of the day of a date, in minutes since midnight, in the local time of
 * the machine.
 *
 * @export
 * @param {Date} [date=new Date()]
 * @return {*}  {number}
 */
export function minutesSinceMidnight(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

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
export function isWithinWorkHours(
  date: Date = new Date(),
  preload: IPreloadConfig = config.preload
): boolean {
  const { workHoursStart, workHoursEnd } = preload;
  // an empty window is never inside, whichever side of it we are on
  if (workHoursStart === workHoursEnd) return false;
  const now = minutesSinceMidnight(date);
  if (workHoursStart < workHoursEnd) {
    return now >= workHoursStart && now < workHoursEnd;
  }
  return now >= workHoursStart || now < workHoursEnd;
}

/**
 * Formats minutes since midnight back into "HH:MM", for logs.
 *
 * @export
 * @param {number} minutes
 * @return {*}  {string}
 */
export function formatTimeOfDay(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/**
 * The configured work hours, formatted for logs : "08:00 -> 19:00".
 *
 * @export
 * @param {IPreloadConfig} [preload=config.preload]
 * @return {*}  {string}
 */
export function formatWorkHours(
  preload: IPreloadConfig = config.preload
): string {
  const { workHoursStart, workHoursEnd } = preload;
  return `${formatTimeOfDay(workHoursStart)} -> ${formatTimeOfDay(workHoursEnd)}`;
}
