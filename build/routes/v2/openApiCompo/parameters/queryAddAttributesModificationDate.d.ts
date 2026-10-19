/**
 *  @swagger
 * components:
 *   parameters:
 *     queryAddAttributesModificationDate:
 *       in: query
 *       name: add-attributes-modification-date
 *       required: false
 *       description: >-
 *         Return selected attributes as objects containing value and lastModification
 *         instead of plain strings. lastModification is a Unix timestamp in milliseconds
 *         when available. Has no effect when attributes are not requested.
 *       schema:
 *         type: boolean
 *         default: false
 */
