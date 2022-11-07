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

import * as moment from 'moment';

export function verifDate(date: string):  number | Date| string {
  let res = moment(date, ["DD-MM-YYYY", "DD-MM-YYYY HH:mm:ss", "DD MM YYYY", "DD MM YYYY HH:mm:ss", "DD/MM/YYYY", "DD/MM/YYYY HH:mm:ss"], 'fr', true); // uses 'fr' locale and strict parsing
  if (!res.isValid()) return 1;
  else return res.toDate();
}

export function sendDate(date: string) {
  let res = moment(date, ["DD-MM-YYYY", "DD-MM-YYYY HH:mm:ss", "DD MM YYYY", "DD MM YYYY HH:mm:ss", "DD/MM/YYYY", "DD/MM/YYYY HH:mm:ss"], 'fr', true); // uses 'fr' locale and strict parsing
  return res
}
