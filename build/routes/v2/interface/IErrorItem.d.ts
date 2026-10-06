import type { EApiErrorType } from '../../../utilities/v2/errorHandler/EApiErrorType';
/**
 * @swagger
 * components:
 *   schemas:
 *     IErrorItem:
 *       type: object
 *       required:
 *         - errorType
 *         - message
 *       properties:
 *         errorType:
 *           type: string
 *           description: The type of the error
 *         message:
 *           type: string
 *           description: The error message
 *       example:
 *         errorType: "ERROR_DATABASE"
 *         message: "An equipment with the same name already exists"
 */
export interface IErrorItem {
    errorType: EApiErrorType;
    message: string;
}
