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

import type { IErrorItem } from '../../../routes/v2/interface/IErrorItem';
import { isErrorItem } from './createErrorMsgItem';
import { EApiErrorType } from './EApiErrorType';
import { getHTTPStatusCode } from './getHTTPStatusCode';

export function sendResponseError(res: any, error: IErrorItem) {
  console.error(error);
  if (isErrorItem(error)) {
    return res.status(getHTTPStatusCode(error)).json(error);
  }
  return res.status(500).json({
    errorType: EApiErrorType.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
  });
}
