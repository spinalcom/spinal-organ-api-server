/**
 * @swagger
 * components:
 *   schemas:
 *     AttributeUpdate:
 *       type: object
 *       required:
 *         - attributeLabel
 *         - attributeNewValue
 *       properties:
 *         attributeLabel:
 *           type: string
 *           description: The label of the attribute to update.
 *         attributeNewValue:
 *           description: The new value for the attribute, must be a string.
 *           type: string
 */
export interface AttributeUpdate {
    attributeLabel: string;
    attributeNewValue: string;
}
