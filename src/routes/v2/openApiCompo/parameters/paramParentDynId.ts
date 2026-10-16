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
 *  @swagger
 * components:
 *   parameters:
 *     paramParentDynId:
 *       in: query
 *       name: parent-dynamic-id
 *       required: false
 *       description: |-
 *         Restrict results to direct children of an existing parent loaded using the current profile.
 *
 *         - **Room lists:** `geographicFloor` or `geographicRoomGroup`.
 *         - **Equipment lists:** `geographicRoom`, `geographicFloor` (floor references only),
 *           or `BIMObjectGroup`.
 *         - **Without this parameter:** traverse the profile's building.
 *         - A valid but unsupported parent type returns an empty list.
 *       example: 132456
 *       schema:
 *         type: integer
 *         minimum: 1
 */
