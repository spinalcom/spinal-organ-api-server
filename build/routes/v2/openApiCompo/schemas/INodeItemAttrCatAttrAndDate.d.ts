/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItemAttrCatAttrAndDate:
 *       type: object
 *       description: attribute value and its last modification date
 *       properties:
 *         value:
 *           type: string
 *         lastModification:
 *           type: number
 *       example:
 *         value: "example value"
 *         lastModification: 1627849200
 */
export type INodeItemAttrCatAttrAndDate = {
    value: string;
    lastModification: number;
};
