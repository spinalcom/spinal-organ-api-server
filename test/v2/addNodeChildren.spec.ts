import { expect } from "chai";
import request from "supertest";
import { Model } from "spinal-core-connectorjs";
import { SpinalContext } from "spinal-model-graph";
import {
  createSpatialFixture,
  type SpatialFixture,
} from "./helpers/spatialFixture";

const register = require("../../src/routes/v2/node/addNodeChildren");
describe("POST /api/v2/node/:parentId/children", () => {
  let fixture: SpatialFixture;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
    register(null, fixture.app, fixture.middleware);
  });
  afterEach(() => fixture.cleanup());
  const path = () => `/api/v2/node/${fixture.room._server_id}/children`;
  const entry = () => ({
    childDynamicId: fixture.equipment._server_id,
    relationName: "hasSensor",
  });

  it("defaults to PtrLst and calls addChild without a context using profile-scoped loads", async () => {
    const original = fixture.room.addChild.bind(fixture.room);
    let called = false;
    fixture.room.addChild = async (...args) => {
      called = true;
      return original(...args);
    };
    const response = await request(fixture.app)
      .post(path())
      .send({ children: [entry()] })
      .expect(200);
    expect(called).to.equal(true);
    expect(response.body).to.deep.equal({
      data: [
        {
          ...entry(),
          relationType: "PtrLst",
          index: 0,
          parentDynamicId: fixture.room._server_id,
          status: "attached",
        },
      ],
    });
    expect(fixture.room.hasRelation("hasSensor", "PtrLst")).to.equal(true);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([
      fixture.equipment,
    ]);
    expect(fixture.loads).to.deep.equal([
      fixture.room._server_id,
      fixture.equipment._server_id,
    ]);
  });

  for (const relationType of ["PtrLst", "LstPtr", "Ref"]) {
    for (const withContext of [false, true]) {
      it(`attaches using ${relationType} ${
        withContext ? "with" : "without"
      } context`, async () => {
        let called = false;
        const original = fixture.room.addChildInContext.bind(fixture.room);
        fixture.room.addChildInContext = async (...args) => {
          called = true;
          return original(...args);
        };
        await request(fixture.app)
          .post(path())
          .send({
            children: [
              {
                ...entry(),
                relationType,
                ...(withContext
                  ? { contextDynamicId: fixture.context._server_id }
                  : {}),
              },
            ],
          })
          .expect(200);
        expect(called).to.equal(withContext);
        expect(fixture.room.hasRelation("hasSensor", relationType)).to.equal(
          true
        );
        const children = withContext
          ? await fixture.room.getChildrenInContext(
              fixture.context,
              "hasSensor"
            )
          : await fixture.room.getChildren("hasSensor");
        expect(children).to.deep.equal([fixture.equipment]);
      });
    }
  }

  it("treats duplicate attachments as successful no-ops", async () => {
    const child = { ...entry(), contextDynamicId: fixture.context._server_id };
    const response = await request(fixture.app)
      .post(path())
      .send({ children: [child, child] })
      .expect(200);
    expect(
      response.body.data.map((item: { status: string }) => item.status)
    ).to.deep.equal(["attached", "alreadyAttached"]);
    expect(await fixture.room.getChildren("hasSensor")).to.have.length(1);
  });

  it("rejects adding context membership to an existing edge without mutating it", async () => {
    const context = new SpinalContext("Other", "context");
    fixture.register(context);
    await request(fixture.app)
      .post(path())
      .send({ children: [entry()] })
      .expect(200);
    const response = await request(fixture.app)
      .post(path())
      .send({
        children: [{ ...entry(), contextDynamicId: context._server_id }],
      })
      .expect(400);
    expect(response.body.errors[0].errorType).to.equal("INVALID_REQUEST");
    expect(fixture.equipment.belongsToContext(context)).to.equal(false);
    expect(await fixture.room.getChildren("hasSensor")).to.have.length(1);
  });

  it("retains successful entries and reports failures by index", async () => {
    const response = await request(fixture.app)
      .post(path())
      .send({
        children: [
          { ...entry(), childDynamicId: 9999999 },
          entry(),
          {
            ...entry(),
            relationName: "badContext",
            contextDynamicId: fixture.floor._server_id,
          },
          {
            ...entry(),
            relationName: "missingContext",
            contextDynamicId: 9999998,
          },
        ],
      })
      .expect(200);
    expect(response.body.data[0].index).to.equal(1);
    expect(
      response.body.error.map((item: { index: number }) => item.index)
    ).to.deep.equal([0, 2, 3]);
    expect(await fixture.room.getChildren("badContext")).to.deep.equal([]);
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([
      fixture.equipment,
    ]);
  });

  it("rejects unknown or non-node parents before loading children", async () => {
    const model = new Model();
    fixture.register(model);
    for (const id of [9999999, model._server_id]) {
      await request(fixture.app)
        .post(`/api/v2/node/${id}/children`)
        .send({ children: [entry()] })
        .expect(400);
    }
    expect(fixture.loads).to.deep.equal([9999999, model._server_id]);
  });

  it("returns 400 and per-entry errors when all child loads fail", async () => {
    const model = new Model();
    fixture.register(model);
    const response = await request(fixture.app)
      .post(path())
      .send({
        children: [
          { ...entry(), childDynamicId: 9999999 },
          { ...entry(), childDynamicId: model._server_id },
        ],
      })
      .expect(400);
    expect(response.body.errorType).to.equal("INVALID_REQUEST");
    expect(response.body.errors).to.have.length(2);
    expect(response.body).not.to.have.property("data");
  });

  it("returns 500 for unexpected attachment errors and retains preceding successes", async () => {
    const original = fixture.room.addChild.bind(fixture.room);
    fixture.room.addChild = async (...args) => {
      if (args[1] === "broken") throw new Error("private details");
      return original(...args);
    };
    const broken = { ...entry(), relationName: "broken" };
    const failed = await request(fixture.app)
      .post(path())
      .send({ children: [broken] })
      .expect(500);
    expect(JSON.stringify(failed.body)).not.to.include("private details");
    const partial = await request(fixture.app)
      .post(path())
      .send({ children: [entry(), broken] })
      .expect(200);
    expect(partial.body.error[0].errorType).to.equal("INTERNAL_ERROR");
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([
      fixture.equipment,
    ]);
  });

  it("rejects malformed requests before any loads", async () => {
    for (const id of ["0", "-1", "1.5", "invalid", "9007199254740992"]) {
      await request(fixture.app)
        .post(`/api/v2/node/${id}/children`)
        .send({ children: [entry()] })
        .expect(400);
    }
    for (const body of [
      {},
      { children: [] },
      { children: [{}] },
      { children: "invalid" },
      { children: [{ ...entry(), relationName: "   " }] },
      { children: [{ ...entry(), relationType: "Invalid" }] },
      { children: [{ ...entry(), childDynamicId: "12" }] },
      { children: [{ ...entry(), childDynamicId: 0 }] },
      { children: [{ ...entry(), contextDynamicId: null }] },
      { children: [{ ...entry(), contextDynamicId: 0 }] },
      { children: [{ ...entry(), extra: true }] },
      { children: [entry()], extra: true },
    ])
      await request(fixture.app).post(path()).send(body).expect(400);
    expect(fixture.loads).to.deep.equal([]);
  });
});
