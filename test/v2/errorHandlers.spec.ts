import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import { createErrorMsgItem, isErrorItem } from '../../src/utilities/v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../src/utilities/v2/errorHandler/EApiErrorType';
import { getHTTPStatusCode } from '../../src/utilities/v2/errorHandler/getHTTPStatusCode';
import { sendResponseError } from '../../src/utilities/v2/errorHandler/sendResponseError';

describe('v2 error handlers', () => {
  it('creates and recognizes structured errors', () => {
    const error = createErrorMsgItem(EApiErrorType.INVALID_REQUEST, 'Invalid value');
    expect(error).to.deep.equal({ errorType: 'INVALID_REQUEST', message: 'Invalid value' });
    expect(isErrorItem(error)).to.equal(true);
    for (const value of [null, undefined, 0, '', {}, { message: 'only' }, new Error('plain')]) {
      expect(!!isErrorItem(value)).to.equal(false);
    }
  });

  for (const errorType of Object.values(EApiErrorType)) {
    const expected = errorType === EApiErrorType.INTERNAL_ERROR ? 500 :
      errorType === EApiErrorType.NOT_FOUND ? 404 :
      errorType === EApiErrorType.UNAUTHORIZED ? 401 :
      errorType === EApiErrorType.CONFLICT ? 409 : 400;
    it(`maps ${errorType} to HTTP ${expected} and preserves its response body`, async () => {
      const error = createErrorMsgItem(errorType, 'Test error');
      expect(getHTTPStatusCode(error)).to.equal(expected);
      const app = express();
      app.get('/', (_req, res) => { sendResponseError(res, error); });
      const response = await request(app).get('/').expect(expected);
      expect(response.body).to.deep.equal(error);
    });
  }

  it('logs unexpected errors and returns a generic 500 response', async () => {
    const app = express();
    const failure = new Error('private internal details');
    app.get('/', (_req, res) => { Reflect.apply(sendResponseError, undefined, [res, failure]); });
    const original = console.error;
    const logged: unknown[] = [];
    console.error = (...args: unknown[]) => { logged.push(...args); };
    try {
      const response = await request(app).get('/').expect(500);
      expect(response.body).to.deep.equal({
        errorType: 'INTERNAL_ERROR', message: 'An unexpected error occurred',
      });
      expect(logged).to.include(failure);
    } finally {
      console.error = original;
    }
  });

  it('defaults unknown error types to 400 and unstructured errors to 500', () => {
    expect(Reflect.apply(getHTTPStatusCode, undefined, [{ errorType: 'UNKNOWN', message: 'Unknown' }])).to.equal(400);
    expect(Reflect.apply(getHTTPStatusCode, undefined, [new Error('Unexpected')])).to.equal(500);
  });
});
