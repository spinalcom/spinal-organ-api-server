/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItemAttrCatAttrAndDate:
 *       type: object
 *       description: Attribute value and its last modification date, when requested.
 *       properties:
 *         value:
 *           type: string
 *         lastModification:
 *           type: number
 *           description: Unix timestamp in milliseconds. Omitted if unavailable on the stored attribute.
 *       example:
 *         value: "example value"
 *         lastModification: 1627849200000
 */
export type INodeItemAttrCatAttrAndDate = {
    value: string;
    lastModification: number;
};
