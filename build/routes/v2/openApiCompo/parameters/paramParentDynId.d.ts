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
