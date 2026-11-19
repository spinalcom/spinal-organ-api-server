/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

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
