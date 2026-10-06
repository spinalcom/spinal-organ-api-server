import type { IErrorItem } from '../../../routes/v2/interface/IErrorItem';
import type { EApiErrorType } from './EApiErrorType';
export declare function createErrorMsgItem(errorType: EApiErrorType, message: string): IErrorItem;
export declare function isErrorItem(obj: any): obj is IErrorItem;
