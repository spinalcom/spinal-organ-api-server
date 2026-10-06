"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxUploadSizeMB = getMaxUploadSizeMB;
exports.getFileUploadOptions = getFileUploadOptions;
const DEFAULT_MAX_UPLOAD_MB = 200;
// Maximum size of one uploaded file, in MB: DOCUMENTARY_MAX_UPLOAD_MB, 200 by default.
function getMaxUploadSizeMB() {
    const value = Number(process.env.DOCUMENTARY_MAX_UPLOAD_MB);
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_UPLOAD_MB;
}
// Options of the express-fileupload middleware.
// - defParamCharset: busboy decodes the file names as latin1 by default, which garbles accented names.
// - limits.fileSize + abortOnLimit: a file larger than the limit stops the upload; limitHandler answers
//   413 in JSON before abortOnLimit closes the connection (it does not write again once headers are sent).
function getFileUploadOptions() {
    const maxSizeMB = getMaxUploadSizeMB();
    return {
        createParentPath: true,
        defParamCharset: "utf8",
        limits: { fileSize: Math.floor(maxSizeMB * 1024 * 1024) },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            if (res.headersSent)
                return;
            res.set("Connection", "close");
            res.status(413).send({ message: `File too large: the maximum upload size is ${maxSizeMB} MB` });
        },
    };
}
//# sourceMappingURL=fileUploadOptions.js.map