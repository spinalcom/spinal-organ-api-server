/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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

import { expect } from 'chai';
import request from 'supertest';
import {
  createContextFixture,
  type ContextFixture,
} from './contextFixture';

describe('Contexts requests', function () {
  let fixture: ContextFixture;
  beforeEach(async () => {
    fixture = await createContextFixture();
  });
  afterEach(() => fixture.cleanup());

  describe('Get context list', function () {
    it('returns the contexts reachable by the profile without a hub connection', async () => {
      fixture.context.info.add_attr({
        color: '#FF0000',
        icon: 'context-icon',
      });
      const response = await request(fixture.app)
        .get('/api/v1/context/list')
        .expect(200);

      expect(response.body).to.deep.equal([{
        dynamicId: fixture.context._server_id,
        staticId: fixture.context.getId().get(),
        name: fixture.context.getName().get(),
        type: fixture.context.getType().get(),
        color: '#FF0000',
        icon: 'context-icon',
      }]);
      expect(fixture.graphReads).to.equal(1);
    });
  });
});