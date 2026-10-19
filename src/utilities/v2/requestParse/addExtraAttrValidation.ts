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

import { z } from 'zod';

/**
 * Adds extra validation to a Zod object schema to catch all additional fields.
 * @param {z.ZodObject<T>} schema
 */
export function addExtraCatAttrValidation<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) {
  return schema.catchall(z.record(z.string(), z.string()));
}

/**
 * Adds extra validation to a Zod object schema to catch all additional fields.
 * @param {z.ZodObject<T>} schema
 */
export function addExtraAttrValidation<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) {
  return schema.catchall(z.string());
}
