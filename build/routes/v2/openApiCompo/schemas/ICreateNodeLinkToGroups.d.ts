/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateNodeLinkToGroups:
 *       type: array
 *       description: >-
 *         Optional group links for the newly created floor, room or equipment.
 *         Context and group types must match the created node's type.
 *         Linking occurs after creation; failures are reported in the response's
 *         error array without rolling back the node or successful links.
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
