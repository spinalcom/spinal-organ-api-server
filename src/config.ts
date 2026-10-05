/*
 * Copyright 2019 SpinalCom - www.spinalcom.com
 *
 *  This file is part of SpinalCore.
 *
 *  Please read all of the following terms and conditions
 *  of the Free Software license Agreement ("Agreement")
 *  carefully.
 *
 *  This Agreement is a legally binding contract between
 *  the Licensee (as defined below) and SpinalCom that
 *  sets forth the terms and conditions that govern your
 *  use of the Program. By installing and/or using the
 *  Program, you agree to abide by all the terms and
 *  conditions stated or referenced herein.
 *
 *  If you do not agree to abide by these terms and
 *  conditions, do not demonstrate your acceptance and do
 *  not install or use the Program.
 *  You should have received a copy of the license along
 *  with this file. If not, see
 *  <http://resources.spinalcom.com/licenses.pdf>.
 */

/**
 * Parses a "HH" or "HH:MM" time of day into minutes since midnight, so that
 * two times of the day can be compared with a single number.
 */
function parseTimeOfDay(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const match = /^(\d{1,2})(?::([0-5]\d))?$/.exec(value.trim());
  const hours = match ? Number(match[1]) : NaN;
  if (!match || hours > 23) {
    console.warn(
      `[config] invalid time of day "${value}", expected HH or HH:MM, falling back to ${fallback} minutes`
    );
    return fallback;
  }
  return hours * 60 + Number(match[2] ?? 0);
}

function parseDuration(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.warn(
      `[config] invalid duration "${value}", falling back to ${fallback}`
    );
    return fallback;
  }
  return parsed;
}

const config = {
  spinalConnector: {
    protocol: process.env.SPINALHUB_PROTOCOL || 'http', // user id
    user: process.env.SPINAL_USER_ID!, // user id
    password: process.env.SPINAL_PASSWORD!, // user password
    host: process.env.SPINALHUB_IP!, // can be an ip address
    port: process.env.SPINALHUB_PORT!, // port
  },
  api: {
    port: process.env.REQUESTS_PORT!, // internal port
  },
  file: {
    // path to a digital twin in spinalhub filesystem
    path: process.env.SPINAL_DTWIN_PATH!,
  },
  preload: {
    // Work hours drive which preloading strategy the organ uses when it starts :
    // outside of them it runs the (blocking) preloading script, inside them it
    // loads the node snapshot progressively, during the idle time between
    // requests. Both are expressed in minutes since midnight, in the local time
    // of the machine. A window whose end is before its start wraps at midnight.
    workHoursStart: parseTimeOfDay(process.env.WORK_HOURS_START, 8 * 60),
    workHoursEnd: parseTimeOfDay(process.env.WORK_HOURS_END, 19 * 60),
    // milliseconds without any request before the snapshot loader loads a batch
    idleDelay: parseDuration(process.env.PRELOAD_IDLE_DELAY, 2000),
    // number of nodes the snapshot loader loads at once
    batchSize: parseDuration(process.env.PRELOAD_BATCH_SIZE, 20) || 20,
    // milliseconds the snapshot loader waits between two batches
    batchDelay: parseDuration(process.env.PRELOAD_BATCH_DELAY, 50),
  },
};
export default config;
