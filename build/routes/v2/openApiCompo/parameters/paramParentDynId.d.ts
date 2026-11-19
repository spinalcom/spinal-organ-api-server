/**
 *  @swagger
 * components:
 *   parameters:
 *     paramParentDynId:
 *       in: query
 *       name: parent-dynamic-id
 *       required: false
 *       description: |-
 *         - Restrict results to direct children of one or more existing parents loaded using the current profile.
 *           Pass a comma-separated list (for example `132456,132457`, up to 50 IDs; duplicates are ignored).
 *           Each item's `parentDynamicId` identifies the parent it came from.
 *
 *           - **Room lists:** `geographicFloor` or `geographicRoomGroup`.
 *           - **Equipment lists:** `geographicRoom`, `geographicFloor` (floor references only),
 *             or `BIMObjectGroup`.
 *           - **Without this parameter:** traverse the profile's building.
 *           - A valid but unsupported parent type returns no items for that parent.
 *       example: '132456,132457'
 *       schema:
 *         type: string
 *         pattern: '^\s*[1-9]\d*(\s*,\s*[1-9]\d*)*\s*$'
 */
