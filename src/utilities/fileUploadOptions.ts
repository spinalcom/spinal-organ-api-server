/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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

import type { NextFunction, Request, Response } from "express";

const DEFAULT_MAX_UPLOAD_MB = 200;

// Maximum size of one uploaded file, in MB: DOCUMENTARY_MAX_UPLOAD_MB, 200 by default.
export function getMaxUploadSizeMB(): number {
	const value = Number(process.env.DOCUMENTARY_MAX_UPLOAD_MB);
	return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_UPLOAD_MB;
}

// Options of the express-fileupload middleware.
// - defParamCharset: busboy decodes the file names as latin1 by default, which garbles accented names.
// - limits.fileSize + abortOnLimit: a file larger than the limit stops the upload; limitHandler answers
//   413 in JSON before abortOnLimit closes the connection (it does not write again once headers are sent).
export function getFileUploadOptions(): { [key: string]: any } {
	const maxSizeMB = getMaxUploadSizeMB();

	return {
		createParentPath: true,
		defParamCharset: "utf8",
		limits: { fileSize: Math.floor(maxSizeMB * 1024 * 1024) },
		abortOnLimit: true,
		limitHandler: (req: Request, res: Response, next: NextFunction) => {
			if (res.headersSent) return;
			res.set("Connection", "close");
			res.status(413).send({ message: `File too large: the maximum upload size is ${maxSizeMB} MB` });
		},
	};
}
