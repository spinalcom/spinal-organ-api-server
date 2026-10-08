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
/**
 * @swagger
 * components:
 *   parameters:
 *     queryInfo:
 *       in: query
 *       name: info
 *       required: false
 *       description: Add fields information to the response.
 *
 *         - `true` will include all fields and in the latter case.
 *
 *         - `false` or `omitting the parameter` will use the default fields (`staticId,name,type,color,icon,virtual,bimFileId,dbid`) if they are present in the node.
 *
 *         - A comma-separated list like `staticId,name` will include only the `staticId` and `name` fields.
 *       schema:
 *         type: string
 *       example: false
 */
//# sourceMappingURL=queryInfo.js.map