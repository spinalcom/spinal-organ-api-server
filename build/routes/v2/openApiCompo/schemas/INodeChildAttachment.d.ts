/**
 * @swagger
 * components:
 *   schemas:
 *     INodeChildAttachment:
 *       type: object
 *       additionalProperties: false
 *       required: [childDynamicId, relationName]
 *       properties:
 *         childDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *         relationName:
 *           type: string
 *           minLength: 1
 *           description: Non-blank relation name; surrounding whitespace is trimmed.
 *         relationType:
 *           type: string
 *           enum: [PtrLst, LstPtr, Ref]
 *           default: PtrLst
 *         contextDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *           description: Optional SpinalContext dynamic ID; uses addChildInContext when supplied.
 *     INodeChildAttachmentResult:
 *       allOf:
 *         - $ref: '#/components/schemas/INodeChildAttachment'
 *         - type: object
 *           required: [index, parentDynamicId, status]
 *           properties:
 *             index:
 *               type: integer
 *               minimum: 0
 *             parentDynamicId:
 *               type: integer
 *             status:
 *               type: string
 *               enum: [attached, alreadyAttached]
 *     INodeChildAttachmentError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           required: [index, child]
 *           properties:
 *             index:
 *               type: integer
 *               minimum: 0
 *             child:
 *               $ref: '#/components/schemas/INodeChildAttachment'
 *     INodeChildrenFailure:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           properties:
 *             errors:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/INodeChildAttachmentError'
 */
