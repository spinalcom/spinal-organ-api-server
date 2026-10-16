import { expect } from "chai";
import request from "supertest";
import { Model } from "spinal-core-connectorjs";
import {
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
  SPINAL_RELATION_LST_PTR_TYPE,
  SPINAL_RELATION_TYPE,
} from "spinal-model-graph";
import {
  createSpatialFixture,
  type SpatialFixture,
} from "./helpers/spatialFixture";

const registerCreateNode = require("../../src/routes/v2/node/createNode");

describe("POST /api/v2/node", () => {
  let fixture: SpatialFixture;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
    registerCreateNode(null, fixture.app, fixture.middleware);
  });
  afterEach(() => {
    fixture.cleanup();
  });

  function body() {
    return {
      info: {
        name: "Sensor",
        type: "customSensor",
        active: false,
        count: 0,
        code: "001",
      },
      parents: [
        { parentDynamicId: fixture.room._server_id, relationName: "hasSensor" },
      ],
    };
  }

  it("creates a node with required name/type, extra scalar info and categorized attributes", async () => {
    const payload = { ...body(), attributes: { Technical: { Code: "001" } } };
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send(payload)
      .expect(201);
    expect(response.body).not.to.have.property("error");
    expect(response.body.data.info).to.include(payload.info);
    expect(response.body.data.info.staticId).to.be.a("string");
    expect(response.body.data.dynamicId).to.be.a("number");
    expect(response.body.data.attributes).to.deep.equal(payload.attributes);
    const children = await fixture.room.getChildren("hasSensor");
    expect(children).to.have.length(1);
    expect(children[0]).to.be.instanceOf(SpinalNode);
    expect(children[0]._server_id).to.equal(response.body.data.dynamicId);
    expect(
      fixture.room.hasRelation("hasSensor", SPINAL_RELATION_PTR_LST_TYPE)
    ).to.equal(true);
    expect(fixture.loads).to.deep.equal([fixture.room._server_id]);
  });

  it("does not create an element when omitted", async () => {
    await request(fixture.app).post("/api/v2/node").send(body()).expect(201);
    const [node] = await fixture.room.getChildren("hasSensor");
    expect(await node.getElement(true)).to.equal(undefined);
  });

  it("creates nested info and shares referenced Models in objects and arrays", async () => {
    const shared = new Model({ value: 42 });
    fixture.register(shared);
    const response = await request(fixture.app).post("/api/v2/node").send({
      ...body(),
      info: {
        ...body().info,
        metadata: { unit: "Celsius", device: { $modelRef: shared._server_id } },
        samples: [0, false, { $modelRef: shared._server_id }],
        empty: {},
      },
    }).expect(201);
    expect(response.body.data.info.metadata).to.deep.equal({ unit: "Celsius", device: { value: 42 } });
    expect(response.body.data.info.samples).to.deep.equal([0, false, { value: 42 }]);
    expect(response.body.data.info.empty).to.deep.equal({});
    const [node] = await fixture.room.getChildren("hasSensor");
    expect(node.info.metadata.device).to.equal(shared);
    expect(node.info.samples[2]).to.equal(shared);
    expect(fixture.loads).to.deep.equal([shared._server_id, fixture.room._server_id]);
  });

  it("rejects inaccessible info references before attaching a node", async () => {
    await request(fixture.app).post("/api/v2/node").send({
      ...body(), info: { ...body().info, device: { $modelRef: 9999999 } },
    }).expect(400);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
    expect(fixture.loads).to.deep.equal([9999999]);
  });

  it("rejects malformed references and reserved keys in nested info", async () => {
    for (const extra of [
      { $modelRef: "12" }, { $modelRef: 12, other: true },
      { constructor: "invalid" }, { nested: [null] },
    ]) {
      await request(fixture.app).post("/api/v2/node").send({
        ...body(), info: { ...body().info, extra },
      }).expect(400);
    }
    expect(fixture.loads).to.deep.equal([]);
  });

  it("rejects underscore-prefixed info keys before loading or attaching nodes", async () => {
    for (const info of [
      { ...body().info, _custom: "invalid" },
      { ...body().info, metadata: { _custom: "invalid" } },
      { ...body().info, samples: [{ _custom: "invalid" }] },
    ]) {
      await request(fixture.app).post("/api/v2/node").send({
        ...body(), info,
      }).expect(400);
    }
    expect(fixture.loads).to.deep.equal([]);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
  });

  it("creates a generic Model with nested objects, arrays and falsy values", async () => {
    const data = {
      value: 21.5,
      enabled: false,
      count: 0,
      label: "",
      metadata: { unit: "Celsius", calibration: { offset: -1 } },
      samples: [20, "21", false, { value: 22 }, [0, true]],
      emptyObject: {},
      emptyArray: [],
    };
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: data,
      })
      .expect(201);
    const [node] = await fixture.room.getChildren("hasSensor");
    const element = await node.getElement(true);
    expect(element).to.be.instanceOf(Model);
    expect(element.get()).to.deep.equal(data);
    expect(response.body.data).not.to.have.property("element");
    expect(fixture.loads).to.deep.equal([fixture.room._server_id]);
  });

  it("accepts an empty object as element data", async () => {
    await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: {},
      })
      .expect(201);
    const [node] = await fixture.room.getChildren("hasSensor");
    expect((await node.getElement(true)).get()).to.deep.equal({});
  });

  it("references the existing model using the current profile without copying it", async () => {
    const model = new Model({ value: 20 });
    fixture.register(model);
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: { device: { $modelRef: model._server_id } },
      })
      .expect(201);
    const [node] = await fixture.room.getChildren("hasSensor");
    const element = await node.getElement(true);
    expect(element).not.to.equal(model);
    expect(element.device).to.equal(model);
    expect(await node.element.load()).to.equal(element);
    model.value.set(25);
    expect(element.get()).to.deep.equal({ device: { value: 25 } });
    expect(fixture.loads).to.deep.equal([
      model._server_id,
      fixture.room._server_id,
    ]);
    expect(response.body.data).not.to.have.property("element");
  });

  it("can reference a specialized Model without losing its identity", async () => {
    await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: { device: { $modelRef: fixture.equipment._server_id } },
      })
      .expect(201);
    const [node] = await fixture.room.getChildren("hasSensor");
    expect((await node.getElement(true)).device).to.equal(fixture.equipment);
  });

  it("resolves nested and array references once per ID, preserving Model identity", async () => {
    const first = new Model({ value: 20 });
    const second = new Model({ value: 30 });
    fixture.register(first);
    fixture.register(second);
    await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: {
          device: { $modelRef: first._server_id },
          metadata: { source: { $modelRef: second._server_id } },
          sources: [
            { $modelRef: first._server_id },
            { nested: { $modelRef: second._server_id } },
            [{ $modelRef: first._server_id }],
          ],
        },
      })
      .expect(201);
    const [node] = await fixture.room.getChildren("hasSensor");
    const element = await node.getElement(true);
    expect(element.device).to.equal(first);
    expect(element.metadata.source).to.equal(second);
    expect(element.sources[0]).to.equal(first);
    expect(element.sources[1].nested).to.equal(second);
    expect(element.sources[2][0]).to.equal(first);
    expect(fixture.loads).to.deep.equal([
      first._server_id,
      second._server_id,
      fixture.room._server_id,
    ]);
  });

  it("does not attach the node when a later nested reference fails", async () => {
    await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: {
          device: { $modelRef: fixture.equipment._server_id },
          nested: [{ source: { $modelRef: 9999999 } }],
        },
      })
      .expect(400);
    expect(fixture.loads).to.deep.equal([
      fixture.equipment._server_id,
      9999999,
    ]);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
  });

  it("fails before parent attachment when the referenced element cannot be loaded", async () => {
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: { device: { $modelRef: 9999999 } },
      })
      .expect(400);
    expect(response.body.errorType).to.equal("INVALID_LOAD_NODE");
    expect(response.body).not.to.have.property("data");
    expect(fixture.loads).to.deep.equal([9999999]);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
  });

  it("rejects invalid element input before loading or attaching any node", async () => {
    for (const element of [
      null,
      "element",
      [],
      12,
      { nested: { value: null } },
      { samples: [null] },
      { $modelRef: 12 },
      ...[0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, "12", null, {}, []].map(
        ($modelRef) => ({ device: { $modelRef } })
      ),
      { device: { $modelRef: 12, extra: true } },
      { nested: [{ $modelRef: 12, extra: true }] },
    ]) {
      await request(fixture.app)
        .post("/api/v2/node")
        .send({
          ...body(),
          element,
        })
        .expect(400);
    }
    expect(fixture.loads).to.deep.equal([]);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
  });

  it("rejects a referenced value that is not a Model before attaching the node", async () => {
    fixture.middleware.load = async () => undefined;
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: { device: { $modelRef: 9999999 } },
      })
      .expect(400);
    expect(response.body.errorType).to.equal("INVALID_LOAD_NODE_TYPE");
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
  });

  it("preserves the element when only some parent attachments succeed", async () => {
    const model = new Model({ value: 20 });
    fixture.register(model);
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        element: { device: { $modelRef: model._server_id } },
        parents: [
          { parentDynamicId: 9999999, relationName: "missing" },
          body().parents[0],
        ],
      })
      .expect(201);
    expect(response.body.error[0].index).to.equal(0);
    const [node] = await fixture.room.getChildren("hasSensor");
    expect((await node.getElement(true)).device).to.equal(model);
  });

  it("rejects reserved Model attribute names at every nesting level", async () => {
    for (const key of [
      "get",
      "set",
      "add_attr",
      "constructor",
      "__proto__",
      "_server_id",
      "model_id",
    ]) {
      for (const data of [
        { [key]: "invalid" },
        { nested: { [key]: "invalid" } },
        { samples: [{ [key]: "invalid" }] },
      ]) {
        await request(fixture.app)
          .post("/api/v2/node")
          .send({
            ...body(),
            element: data,
          })
          .expect(400);
      }
    }
    expect(fixture.loads).to.deep.equal([]);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
  });

  for (const relationType of [
    SPINAL_RELATION_PTR_LST_TYPE,
    SPINAL_RELATION_LST_PTR_TYPE,
    SPINAL_RELATION_TYPE,
  ]) {
    for (const withContext of [false, true]) {
      it(`supports ${relationType} ${
        withContext ? "with" : "without"
      } a context`, async () => {
        const response = await request(fixture.app)
          .post("/api/v2/node")
          .send({
            ...body(),
            parents: [
              {
                ...body().parents[0],
                relationType,
                ...(withContext
                  ? { contextDynamicId: fixture.context._server_id }
                  : {}),
              },
            ],
          })
          .expect(201);
        expect(fixture.room.hasRelation("hasSensor", relationType)).to.equal(
          true
        );
        const children = withContext
          ? await fixture.room.getChildrenInContext(
              fixture.context,
              "hasSensor"
            )
          : await fixture.room.getChildren("hasSensor");
        expect(children.map((node) => node._server_id)).to.deep.equal([
          response.body.data.dynamicId,
        ]);
        if (withContext)
          expect(fixture.loads).to.include(fixture.context._server_id);
        expect(response.body.data).not.to.have.property("attributes");
      });
    }
  }

  it("attaches the same node to multiple parents with different relations and contexts", async () => {
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        parents: [
          body().parents[0],
          {
            parentDynamicId: fixture.floor._server_id,
            relationName: "referencesSensor",
            relationType: "LstPtr",
            contextDynamicId: fixture.context._server_id,
          },
        ],
      })
      .expect(201);
    const roomChildren = await fixture.room.getChildren("hasSensor");
    const floorChildren = await fixture.floor.getChildrenInContext(
      fixture.context,
      "referencesSensor"
    );
    expect(roomChildren[0]).to.equal(floorChildren[0]);
    expect(roomChildren[0]._server_id).to.equal(response.body.data.dynamicId);
  });

  it("keeps successful attachments and identifies failed parent/context entries", async () => {
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        parents: [
          { parentDynamicId: 9999999, relationName: "missingParent" },
          body().parents[0],
          {
            parentDynamicId: fixture.floor._server_id,
            relationName: "invalidContext",
            contextDynamicId: fixture.room._server_id,
          },
          {
            parentDynamicId: fixture.floor._server_id,
            relationName: "missingContext",
            contextDynamicId: 9999998,
          },
        ],
      })
      .expect(201);
    expect(
      response.body.error.map((error: { index: number }) => error.index)
    ).to.deep.equal([0, 2, 3]);
    expect(response.body.error[0]).to.include({
      errorType: "INVALID_LOAD_NODE_TYPE",
    });
    expect(response.body.error[0].parent).to.deep.equal({
      parentDynamicId: 9999999,
      relationName: "missingParent",
      relationType: "PtrLst",
    });
    expect(await fixture.floor.getChildren("invalidContext")).to.deep.equal([]);
    expect(
      (await fixture.room.getChildren("hasSensor"))[0]._server_id
    ).to.equal(response.body.data.dynamicId);
  });

  it("returns 400 with per-entry errors and no data when all parent loads fail", async () => {
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        parents: [
          { parentDynamicId: 9999999, relationName: "missing" },
          { parentDynamicId: 9999998, relationName: "missing" },
        ],
      })
      .expect(400);
    expect(response.body).not.to.have.property("data");
    expect(response.body).to.include({
      errorType: "INVALID_REQUEST",
      message: "No parent attachment succeeded",
    });
    expect(response.body.errors).to.have.length(2);
  });

  it("does not attach a node if the supplied context is not a SpinalContext", async () => {
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        parents: [
          {
            ...body().parents[0],
            contextDynamicId: fixture.floor._server_id,
          },
        ],
      })
      .expect(400);
    expect(response.body.errors[0].message).to.include(
      "is not a SpinalContext"
    );
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
  });

  it("returns 500 when every attachment fails unexpectedly without exposing internal details", async () => {
    fixture.room.addChild = async () => {
      throw new Error("private details");
    };
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send(body())
      .expect(500);
    expect(response.body.errorType).to.equal("INTERNAL_ERROR");
    expect(response.body.errors[0].errorType).to.equal("INTERNAL_ERROR");
    expect(JSON.stringify(response.body)).not.to.include("private details");
  });

  it("retains successful attachments despite a subsequent graph error", async () => {
    fixture.floor.addChild = async () => {
      throw new Error("graph failure");
    };
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        parents: [
          body().parents[0],
          { parentDynamicId: fixture.floor._server_id, relationName: "broken" },
        ],
      })
      .expect(201);
    expect(response.body.error[0]).to.include({
      index: 1,
      errorType: "INTERNAL_ERROR",
    });
    expect(
      (await fixture.room.getChildren("hasSensor"))[0]._server_id
    ).to.equal(response.body.data.dynamicId);
  });

  it("reports duplicate attachment attempts while preserving the first attachment", async () => {
    const response = await request(fixture.app)
      .post("/api/v2/node")
      .send({
        ...body(),
        parents: [body().parents[0], body().parents[0]],
      })
      .expect(201);
    expect(response.body.error).to.have.length(1);
    expect(response.body.error[0].index).to.equal(1);
    expect(await fixture.room.getChildren("hasSensor")).to.have.length(1);
  });

  it("does not require an existing building", async () => {
    await fixture.removeBuilding();
    await request(fixture.app).post("/api/v2/node").send(body()).expect(201);
    expect(fixture.graphReads).to.equal(0);
  });

  it("rejects invalid payloads before loading or attaching nodes", async () => {
    const payload = body();
    for (const invalid of [
      {},
      { ...payload, info: undefined },
      { ...payload, info: { type: "sensor" } },
      { ...payload, info: { name: "Sensor" } },
      { ...payload, info: { name: "", type: "sensor" } },
      { ...payload, info: { name: "Sensor", type: "" } },
      { ...payload, info: { name: "x".repeat(201), type: "sensor" } },
      { ...payload, info: { name: "Sensor", type: "x".repeat(201) } },
      { ...payload, info: { ...payload.info, id: "override" } },
      { ...payload, info: { ...payload.info, staticId: "override" } },
      { ...payload, info: { ...payload.info, dynamicId: 12 } },
      { ...payload, parents: undefined },
      { ...payload, parents: [] },
      { ...payload, parents: [{}] },
      { ...payload, parents: [{ ...payload.parents[0], relationName: "   " }] },
      {
        ...payload,
        parents: [{ ...payload.parents[0], relationType: "invalid" }],
      },
      {
        ...payload,
        parents: [{ ...payload.parents[0], realationType: "PtrLst" }],
      },
      { ...payload, parents: [{ ...payload.parents[0], parentDynamicId: 0 }] },
      {
        ...payload,
        parents: [{ ...payload.parents[0], parentDynamicId: 1.5 }],
      },
      { ...payload, parents: [{ ...payload.parents[0], contextDynamicId: 0 }] },
      {
        ...payload,
        parents: [{ ...payload.parents[0], contextDynamicId: "123" }],
      },
      { ...payload, attributes: { Technical: { Code: 12 } } },
      { ...payload, unknown: true },
    ]) {
      await request(fixture.app).post("/api/v2/node").send(invalid).expect(400);
    }
    expect(fixture.loads).to.deep.equal([]);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([]);
  });
});
