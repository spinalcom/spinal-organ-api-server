/**
 * @swagger
 * components:
 *   schemas:
 *     IMoveNodeLink:
 *       type: object
 *       additionalProperties: false
 *       required: [parentDynamicId, relationType, relationName]
 *       properties:
 *         parentDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *         relationType:
 *           type: string
 *           enum: [PtrLst, LstPtr, Ref]
 *         relationName:
 *           type: string
 *           minLength: 1
 *           description: One exact nonblank relation name; no trimming, OR or regex matching.
 *     IMoveNodeDestination:
 *       type: object
 *       additionalProperties: false
 *       required: [parentDynamicId, relationType, relationName]
 *       properties:
 *         parentDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *         relationType:
 *           type: string
 *           enum: [PtrLst, LstPtr, Ref]
 *         relationName:
 *           type: string
 *           minLength: 1
 *           description: One exact nonblank relation name.
 *         contextDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *     IMoveNode:
 *       type: object
 *       additionalProperties: false
 *       required: [from, to]
 *       properties:
 *         from:
 *           $ref: '#/components/schemas/IMoveNodeLink'
 *         to:
 *           $ref: '#/components/schemas/IMoveNodeDestination'
 *     IMoveNodeResult:
 *       type: object
 *       required: [nodeDynamicId, status, destinationAction, sourceAction]
 *       properties:
 *         nodeDynamicId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [moved, alreadyMoved, unchanged]
 *         destinationAction:
 *           type: string
 *           enum: [attached, alreadyAttached, unchanged]
 *         sourceAction:
 *           type: string
 *           enum: [detached, alreadyDetached, unchanged]
 *     IMoveNodeFailure:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           required: [stage, state]
 *           properties:
 *             stage:
 *               type: string
 *               enum: [attachDestination, detachSource]
 *             state:
 *               type: object
 *               required: [destination, source]
 *               description: Completed actions, not a current-state guarantee under concurrent writes.
 *               properties:
 *                 destination:
 *                   type: string
 *                   enum: [unknown, attached, alreadyAttached]
 *                 source:
 *                   type: string
 *                   enum: [notAttempted, unknown]
 */
