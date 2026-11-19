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

import { expect } from 'chai';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { FileSystem, Model } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-model-graph';
import {
  readNodeSnapshot,
  writeNodeSnapshot,
} from '../src/routes/snapshot/snapshotUtils';

describe('node snapshot', () => {
  let dir: string;
  let originalSnapshotFile: string | undefined;
  let forEachModelDescriptor: PropertyDescriptor | undefined;

  before(async () => {
    dir = await fs.mkdtemp(join(tmpdir(), 'snapshot-spec-'));
    originalSnapshotFile = process.env.SNAPSHOT_FILE;
    process.env.SNAPSHOT_FILE = join(dir, 'nodes.json');
    forEachModelDescriptor = Object.getOwnPropertyDescriptor(FileSystem, 'forEachModel');
  });

  afterEach(() => {
    if (forEachModelDescriptor) {
      Object.defineProperty(FileSystem, 'forEachModel', forEachModelDescriptor);
    } else {
      delete (FileSystem as any).forEachModel;
    }
  });

  after(async () => {
    if (originalSnapshotFile === undefined) delete process.env.SNAPSHOT_FILE;
    else process.env.SNAPSHOT_FILE = originalSnapshotFile;
    for (const file of await fs.readdir(dir)) await fs.unlink(join(dir, file));
    await fs.rmdir(dir);
  });

  it('walks the models with FileSystem.forEachModel when the connector has it', async () => {
    const models = new Map<number, unknown>([
      [101, new SpinalNode('first', 'test')],
      [102, new Model()],
      [103, new SpinalNode('second', 'test')],
    ]);
    Object.defineProperty(FileSystem, 'forEachModel', {
      configurable: true,
      writable: true,
      value: (callback: (model: unknown, serverId: number) => void) =>
        models.forEach((model, serverId) => callback(model, serverId)),
    });
    // with forEachModel, _objects must not be walked : on a big digital twin
    // Object.keys on it runs the organ out of memory
    const objects = FileSystem._objects;
    FileSystem._objects = new Proxy(objects, {
      ownKeys() {
        throw new Error('Object.keys called on FileSystem._objects');
      },
    });
    try {
      const result = await writeNodeSnapshot();
      expect(result.objectCount).to.equal(3);
      expect(result.nodeCount).to.equal(2);
    } finally {
      FileSystem._objects = objects;
    }

    const snapshot = await readNodeSnapshot();
    expect(snapshot.nodes).to.deep.equal([101, 103]);
    expect(snapshot.objectCount).to.equal(3);
  });

  it('falls back to FileSystem._objects on a connector without forEachModel', async () => {
    Object.defineProperty(FileSystem, 'forEachModel', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const ids = [920001, 920002];
    const previous = ids.map((id) => FileSystem._objects[id]);
    FileSystem._objects[ids[0]] = new SpinalNode('first', 'test');
    FileSystem._objects[ids[1]] = new Model();
    try {
      const result = await writeNodeSnapshot();
      expect(result.objectCount).to.be.at.least(2);

      const snapshot = await readNodeSnapshot();
      expect(snapshot.nodes).to.include(ids[0]);
      expect(snapshot.nodes).to.not.include(ids[1]);
      expect(snapshot.nodeCount).to.equal(snapshot.nodes.length);
    } finally {
      ids.forEach((id, i) => {
        if (previous[i] === undefined) delete FileSystem._objects[id];
        else FileSystem._objects[id] = previous[i];
      });
    }
  });
});
