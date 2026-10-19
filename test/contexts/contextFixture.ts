import { createSpatialFixture } from '../v2/helpers/spatialFixture';

const registerContextList = require('../../src/routes/contexts/contextList');

export async function createContextFixture() {
  const fixture = await createSpatialFixture();
  registerContextList(null, fixture.app, fixture.middleware);
  return fixture;
}

export type ContextFixture = Awaited<ReturnType<typeof createContextFixture>>;
