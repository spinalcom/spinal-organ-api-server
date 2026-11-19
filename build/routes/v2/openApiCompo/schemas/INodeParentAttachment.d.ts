/**
 * @swagger
 * components:
 *   schemas:
 *     INodeParentAttachment:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - parentDynamicId
 *         - relationName
 *       properties:
 *         parentDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *           description: Dynamic ID of an existing parent SpinalNode.
 *         relationName:
 *           type: string
 *           minLength: 1
 *           description: Non-blank relation name. Surrounding whitespace is trimmed.
 *         relationType:
 *           type: string
 *           enum: [PtrLst, LstPtr, Ref]
 *           default: PtrLst
 *         contextDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *           description: Optional dynamic ID of a SpinalContext. Uses addChildInContext when supplied.
 *     INodeParentAttachmentError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           required:
 *             - index
 *             - parent
 *           properties:
 *             index:
 *               type: integer
 *               minimum: 0
 *               description: Zero-based position of the failed entry in parents.
 *             parent:
 *               $ref: '#/components/schemas/INodeParentAttachment'
 *     INodeAttachmentFailure:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           properties:
 *             errors:
 *               type: array
 *               description: Per-entry failures when no attachment succeeded.
 *               items:
 *                 $ref: '#/components/schemas/INodeParentAttachmentError'
 */
