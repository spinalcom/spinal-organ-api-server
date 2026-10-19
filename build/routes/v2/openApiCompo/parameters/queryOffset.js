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
 *     queryOffset:
 *       in: query
 *       name: offset
 *       description: |-
 *         Number of matching nodes to skip **after filtering**.
 *
 *         - Must be a non-negative safe integer.
 *         - Pages contain at most **200 items**.
 *         - Use `0`, `200`, `400`, etc. for successive pages.
 *         - An offset beyond the matches returns `data: []`.
 *       schema:
 *         type: integer
 *         minimum: 0
 *         maximum: 9007199254740991
 *         default: 0
 */
//# sourceMappingURL=queryOffset.js.map