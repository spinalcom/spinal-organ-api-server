/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateNodeLinkToGroups:
 *       type: array
 *       description: optionnal, link the floor to groups after creation.
 *       items:
 *           type: object
 *           required:
 *             - contextDynamicId
 *             - groupDynamicId
 *           properties:
 *             contextDynamicId:
 *               type: number
 *               minimum: 1
 *             groupDynamicId:
 *               type: number
 *               minimum: 1
 */
