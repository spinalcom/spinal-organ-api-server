import { expect } from "chai";
import request from "supertest";
import { Model } from "spinal-core-connectorjs";
import { SpinalContext, SpinalNode } from "spinal-model-graph";
import {
  createSpatialFixture,
  type SpatialFixture,
} from "./helpers/spatialFixture";

const register = require("../../src/routes/v2/node/moveNode");
describe("POST v2 node move", () => {
  let fixture: SpatialFixture;
  let node: SpinalNode;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
    node = fixture.node("Sensor", "sensor");
    register(null, fixture.app, fixture.middleware);
  });
  afterEach(() => fixture.cleanup());
  const path = () => `/api/v2/node/${node._server_id}/move`;
  const body = () => ({
    from: {
      parentDynamicId: fixture.room._server_id,
      relationType: "PtrLst",
      relationName: "hasSensor",
    },
    to: {
      parentDynamicId: fixture.floor._server_id,
      relationType: "PtrLst",
      relationName: "hasSensor",
    },
  });
  const attachSource = () => fixture.room.addChild(node, "hasSensor", "PtrLst");
  const sourceChildren = () => fixture.room.getChildren("hasSensor");
  const destinationChildren = () => fixture.floor.getChildren("hasSensor");

  for (const fromType of ["PtrLst", "LstPtr", "Ref"]) {
    for (const toType of ["PtrLst", "LstPtr", "Ref"]) {
      it(`moves ${fromType} to ${toType}, attaches before detaching and safely retries`, async () => {
        await fixture.room.addChild(node, "hasSensor", fromType);
        const original = fixture.room.removeChild.bind(fixture.room);
        fixture.room.removeChild = async (...args) => {
          expect(await destinationChildren()).to.deep.equal([node]);
          return original(...args);
        };
        const payload = body();
        payload.from.relationType = fromType;
        payload.to.relationType = toType;
        const response = await request(fixture.app)
          .post(path())
          .send(payload)
          .expect(200);
        expect(response.body).to.deep.equal({
          data: {
            nodeDynamicId: node._server_id,
            status: "moved",
            destinationAction: "attached",
            sourceAction: "detached",
          },
        });
        expect(fixture.loads).to.deep.equal([
          node._server_id,
          fixture.room._server_id,
          fixture.floor._server_id,
        ]);
        expect(await sourceChildren()).to.deep.equal([]);
        expect(await node.getParents("hasSensor")).to.deep.equal([
          fixture.floor,
        ]);
        expect(fixture.room.hasRelation("hasSensor", fromType)).to.equal(true);
        fixture.floor.addChild = async () => {
          throw new Error("Must not reattach");
        };
        fixture.room.removeChild = async () => {
          throw new Error("Must not detach twice");
        };
        const retry = await request(fixture.app)
          .post(path())
          .send(payload)
          .expect(200);
        expect(retry.body.data).to.deep.equal({
          nodeDynamicId: node._server_id,
          status: "alreadyMoved",
          destinationAction: "alreadyAttached",
          sourceAction: "alreadyDetached",
        });
      });
    }
  }

  it("detaches only the source when the destination already exists", async () => {
    await attachSource();
    await fixture.floor.addChild(node, "hasSensor", "PtrLst");
    fixture.floor.addChild = async () => {
      throw new Error("Must not attach twice");
    };
    const response = await request(fixture.app)
      .post(path())
      .send(body())
      .expect(200);
    expect(response.body.data.destinationAction).to.equal("alreadyAttached");
    expect(response.body.data.status).to.equal("moved");
    expect(await sourceChildren()).to.deep.equal([]);
    expect(await destinationChildren()).to.deep.equal([node]);
  });

  it("does not turn an absent source and destination into an attachment", async () => {
    await request(fixture.app).post(path()).send(body()).expect(400);
    expect(await destinationChildren()).to.deep.equal([]);
    expect(fixture.floor.hasRelation("hasSensor", "PtrLst")).to.equal(false);
  });

  it("returns unchanged for an identical existing link, but rejects an absent one", async () => {
    const payload = body();
    payload.to = { ...payload.from };
    await request(fixture.app).post(path()).send(payload).expect(400);
    await attachSource();
    fixture.room.addChild = async () => {
      throw new Error("Must not attach");
    };
    fixture.room.removeChild = async () => {
      throw new Error("Must not detach");
    };
    const response = await request(fixture.app)
      .post(path())
      .send(payload)
      .expect(200);
    expect(response.body.data).to.deep.equal({
      nodeDynamicId: node._server_id,
      status: "unchanged",
      destinationAction: "unchanged",
      sourceAction: "unchanged",
    });
    expect(await sourceChildren()).to.deep.equal([node]);
  });

  it("can change the name or type under the same parent using exact names", async () => {
    await attachSource();
    const payload = body();
    payload.to = { ...payload.from, relationName: " monitors,exact " };
    await request(fixture.app).post(path()).send(payload).expect(200);
    expect(await sourceChildren()).to.deep.equal([]);
    expect(await fixture.room.getChildren(" monitors,exact ")).to.deep.equal([
      node,
    ]);
    payload.from = { ...payload.to };
    payload.to.relationType = "Ref";
    await request(fixture.app).post(path()).send(payload).expect(200);
    expect(
      await fixture.room.children
        .getElement("PtrLst")
        .getElement(" monitors,exact ")
        .getChildren()
    ).to.deep.equal([]);
    expect(
      await fixture.room.children
        .getElement("Ref")
        .getElement(" monitors,exact ")
        .getChildren()
    ).to.deep.equal([node]);
  });

  it("preserves data, descendants, unrelated parents and old context memberships", async () => {
    await fixture.room.addChildInContext(
      node,
      "hasSensor",
      "PtrLst",
      fixture.context
    );
    const oldRelation = fixture.room.children
      .getElement("PtrLst")
      .getElement("hasSensor");
    await fixture.building.addChild(node, "monitors", "Ref");
    const descendant = fixture.node("Part", "part");
    await node.addChild(descendant, "hasPart", "LstPtr");
    node.info.add_attr("code", "A");
    (await node.getElement()).add_attr("value", 12);
    const context = new SpinalContext("Destination", "context");
    fixture.register(context);
    const response = await request(fixture.app)
      .post(path())
      .send({
        ...body(),
        to: { ...body().to, contextDynamicId: context._server_id },
      })
      .expect(200);
    expect(response.body.data.status).to.equal("moved");
    expect(fixture.loads).to.include(context._server_id);
    expect(
      await fixture.floor.getChildrenInContext(context, "hasSensor")
    ).to.deep.equal([node]);
    expect(node.belongsToContext(fixture.context)).to.equal(true);
    expect(oldRelation.belongsToContext(fixture.context)).to.equal(true);
    expect(await node.getParents("monitors")).to.deep.equal([fixture.building]);
    expect(await node.getChildren("hasPart")).to.deep.equal([descendant]);
    expect(node.info.code.get()).to.equal("A");
    expect((await node.getElement()).get()).to.deep.equal({ value: 12 });
  });

  for (const sourceExists of [true, false]) {
    it(`validates context on an existing destination with source ${
      sourceExists ? "present" : "absent"
    }`, async () => {
      if (sourceExists) await attachSource();
      await fixture.floor.addChild(node, "hasSensor", "PtrLst");
      const relation = fixture.floor.children
        .getElement("PtrLst")
        .getElement("hasSensor");
      const payload = {
        ...body(),
        to: { ...body().to, contextDynamicId: fixture.context._server_id },
      };
      await request(fixture.app).post(path()).send(payload).expect(400);
      relation.addContextId(fixture.context.getId().get());
      await request(fixture.app).post(path()).send(payload).expect(400);
      node.addContextId(fixture.context.getId().get());
      const response = await request(fixture.app)
        .post(path())
        .send(payload)
        .expect(200);
      expect(response.body.data.status).to.equal(
        sourceExists ? "moved" : "alreadyMoved"
      );
    });
  }

  it("checks context even when source and destination are identical", async () => {
    await attachSource();
    const payload = {
      ...body(),
      to: { ...body().from, contextDynamicId: fixture.context._server_id },
    };
    await request(fixture.app).post(path()).send(payload).expect(400);
    const relation = fixture.room.children
      .getElement("PtrLst")
      .getElement("hasSensor");
    relation.addContextId(fixture.context.getId().get());
    node.addContextId(fixture.context.getId().get());
    const response = await request(fixture.app)
      .post(path())
      .send(payload)
      .expect(200);
    expect(response.body.data.status).to.equal("unchanged");
  });

  it("rejects invalid requests before mutation", async () => {
    await attachSource();
    for (const payload of [
      {},
      { ...body(), extra: true },
      { ...body(), from: { ...body().from, relationType: undefined } },
      { ...body(), to: { ...body().to, relationType: "LstPtrLst" } },
      { ...body(), from: { ...body().from, relationType: "LstPtrLst" } },
      {
        ...body(),
        from: { ...body().from, contextDynamicId: fixture.context._server_id },
      },
      { ...body(), to: { ...body().to, parentDynamicId: node._server_id } },
      { ...body(), to: { ...body().to, parentDynamicId: 0 } },
      { ...body(), to: { ...body().to, parentDynamicId: "123" } },
      { ...body(), to: { ...body().to, relationName: " " } },
      { ...body(), to: { ...body().to, contextDynamicId: -1 } },
    ])
      await request(fixture.app).post(path()).send(payload).expect(400);
    await request(fixture.app)
      .post(path())
      .query({ contextDynamicId: 123 })
      .send(body())
      .expect(400);
    for (const id of [0, 1.5, Number.MAX_SAFE_INTEGER + 1])
      await request(fixture.app)
        .post(`/api/v2/node/${id}/move`)
        .send(body())
        .expect(400);
    expect(await sourceChildren()).to.deep.equal([node]);
    expect(await destinationChildren()).to.deep.equal([]);
  });

  it("validates missing/non-node targets and context before mutation", async () => {
    await attachSource();
    const model = new Model();
    fixture.register(model);
    for (const id of [9999999, model._server_id]) {
      await request(fixture.app)
        .post(`/api/v2/node/${id}/move`)
        .send(body())
        .expect(400);
      for (const side of ["from", "to"] as const)
        await request(fixture.app)
          .post(path())
          .send({
            ...body(),
            [side]: { ...body()[side], parentDynamicId: id },
          })
          .expect(400);
    }
    for (const id of [9999999, model._server_id, fixture.room._server_id])
      await request(fixture.app)
        .post(path())
        .send({
          ...body(),
          to: { ...body().to, contextDynamicId: id },
        })
        .expect(400);
    expect(await sourceChildren()).to.deep.equal([node]);
    expect(await destinationChildren()).to.deep.equal([]);
  });

  it("enforces profile access to every target even for alreadyMoved requests", async () => {
    await fixture.floor.addChildInContext(
      node,
      "hasSensor",
      "PtrLst",
      fixture.context
    );
    const original = fixture.middleware.load.bind(fixture.middleware);
    for (const denied of [
      node._server_id,
      fixture.room._server_id,
      fixture.floor._server_id,
      fixture.context._server_id,
    ]) {
      fixture.middleware.load = async (id, profile) => {
        if (id === denied) throw new Error("Denied");
        return original(id, profile);
      };
      await request(fixture.app)
        .post(path())
        .send({
          ...body(),
          to: { ...body().to, contextDynamicId: fixture.context._server_id },
        })
        .expect(400);
    }
    expect(await destinationChildren()).to.deep.equal([node]);
  });

  it("reports uncertain destination on attachment failure and never attempts source removal", async () => {
    await attachSource();
    const original = fixture.floor.addChild.bind(fixture.floor);
    fixture.floor.addChild = async (...args) => {
      await original(...args);
      throw new Error("private attachment failure");
    };
    fixture.room.removeChild = async () => {
      throw new Error("Must not detach");
    };
    const response = await request(fixture.app)
      .post(path())
      .send(body())
      .expect(500);
    expect(response.body.stage).to.equal("attachDestination");
    expect(response.body.state).to.deep.equal({
      destination: "unknown",
      source: "notAttempted",
    });
    expect(JSON.stringify(response.body)).not.to.include(
      "private attachment failure"
    );
    expect(response.body).not.to.have.property("data");
    expect(await sourceChildren()).to.deep.equal([node]);
    expect(await destinationChildren()).to.deep.equal([node]);
  });

  for (const withContext of [false, true]) {
    it(`keeps the source when attachment fails before mutation ${
      withContext ? "with context" : "without context"
    }`, async () => {
      await attachSource();
      fixture.floor.addChild = async () => {
        throw new Error("private attach failure");
      };
      fixture.floor.addChildInContext = async () => {
        throw new Error("private context failure");
      };
      const response = await request(fixture.app)
        .post(path())
        .send({
          ...body(),
          to: {
            ...body().to,
            ...(withContext
              ? { contextDynamicId: fixture.context._server_id }
              : {}),
          },
        })
        .expect(500);
      expect(response.body.stage).to.equal("attachDestination");
      expect(response.body.state).to.deep.equal({
        destination: "unknown",
        source: "notAttempted",
      });
      expect(await sourceChildren()).to.deep.equal([node]);
      expect(await destinationChildren()).to.deep.equal([]);
    });
  }

  it("reports an inspection failure without pretending a mutation was attempted", async () => {
    await attachSource();
    const relation = fixture.room.children
      .getElement("PtrLst")
      .getElement("hasSensor");
    relation.getChildrenIds = () => {
      throw new Error("private read failure");
    };
    const response = await request(fixture.app)
      .post(path())
      .send(body())
      .expect(500);
    expect(response.body).not.to.have.property("state");
    expect(response.body).not.to.have.property("data");
    expect(JSON.stringify(response.body)).not.to.include(
      "private read failure"
    );
    expect(await sourceChildren()).to.deep.equal([node]);
    expect(await destinationChildren()).to.deep.equal([]);
  });

  for (const destinationExists of [false, true]) {
    it(`reports failed source removal without rollback with destination initially ${
      destinationExists ? "present" : "absent"
    }`, async () => {
      await attachSource();
      if (destinationExists)
        await fixture.floor.addChild(node, "hasSensor", "PtrLst");
      const original = fixture.room.removeChild.bind(fixture.room);
      fixture.room.removeChild = async () => {
        throw new Error("private detach failure");
      };
      const response = await request(fixture.app)
        .post(path())
        .send(body())
        .expect(500);
      expect(response.body.stage).to.equal("detachSource");
      expect(response.body.state).to.deep.equal({
        destination: destinationExists ? "alreadyAttached" : "attached",
        source: "unknown",
      });
      expect(JSON.stringify(response.body)).not.to.include(
        "private detach failure"
      );
      expect(await sourceChildren()).to.deep.equal([node]);
      expect(await destinationChildren()).to.deep.equal([node]);
      fixture.room.removeChild = original;
      const retry = await request(fixture.app)
        .post(path())
        .send(body())
        .expect(200);
      expect(retry.body.data.status).to.equal("moved");
      expect(retry.body.data.destinationAction).to.equal("alreadyAttached");
    });
  }

  it("allows retries after removal mutated the graph but then rejected", async () => {
    await attachSource();
    const original = fixture.room.removeChild.bind(fixture.room);
    fixture.room.removeChild = async (...args) => {
      await original(...args);
      throw new Error("Failed after mutation");
    };
    const failed = await request(fixture.app)
      .post(path())
      .send(body())
      .expect(500);
    expect(failed.body.state.source).to.equal("unknown");
    expect(await sourceChildren()).to.deep.equal([]);
    const retry = await request(fixture.app)
      .post(path())
      .send(body())
      .expect(200);
    expect(retry.body.data.status).to.equal("alreadyMoved");
  });
});
