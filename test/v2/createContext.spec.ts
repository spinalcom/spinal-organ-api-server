import { expect } from "chai";
import request from "supertest";
import { SpinalContext, SpinalGraph } from "spinal-model-graph";
import { createSpatialFixture, type SpatialFixture } from "./helpers/spatialFixture";

const registerCreateContext = require("../../src/routes/v2/context/createContext");

describe("POST /api/v2/context", () => {
  let fixture: SpatialFixture;

  beforeEach(async () => {
    fixture = await createSpatialFixture();
    registerCreateContext(null, fixture.app, fixture.middleware);
  });

  afterEach(() => fixture.cleanup());

  const payload = () => ({
    info: {
      name: "Energy Analysis",
      type: "Analysis",
      enabled: false,
    },
    attributes: { Settings: { mode: "hourly" } },
    element: { unit: "kWh", samples: [1, 2] },
  });

  it("creates a context with info, attributes and element in the shared graph", async () => {
    const response = await request(fixture.app)
      .post("/api/v2/context")
      .send(payload())
      .expect(201);

    expect(response.body.data.info).to.include(payload().info);
    expect(response.body.data.info.staticId).to.be.a("string");
    expect(response.body.data.attributes).to.deep.equal(payload().attributes);
    expect(response.body.data).not.to.have.property("element");

    const context = await fixture.graph.getContext("Energy Analysis");
    expect(context).to.be.instanceOf(SpinalContext);
    expect(context.getType().get()).to.equal("Analysis");
    expect((await context.getElement(true)).get()).to.deep.equal(
      payload().element
    );
    expect(
      (await fixture.graph.getChildren("hasContext")).filter(
        (child) => child === context
      )
    ).to.have.length(1);
  });

  it("adds the created context to both distinct profile and root graphs", async () => {
    const profileGraph = new SpinalGraph("profile", "profile");
    fixture.middleware.getProfileGraph = async () => profileGraph;

    await request(fixture.app)
      .post("/api/v2/context")
      .send({ info: { name: "Profile Context", type: "Custom" } })
      .expect(201);

    const inRoot = await fixture.graph.getContext("Profile Context");
    const inProfile = await profileGraph.getContext("Profile Context");
    expect(inRoot).to.be.instanceOf(SpinalContext);
    expect(inProfile).to.equal(inRoot);
  });

  it("returns 409 when the exact name exists in either graph", async () => {
    const profileGraph = new SpinalGraph("profile", "profile");
    fixture.middleware.getProfileGraph = async () => profileGraph;
    const existing = new SpinalContext("Taken", "Custom");
    await profileGraph.addContext(existing);

    const response = await request(fixture.app)
      .post("/api/v2/context")
      .send({ info: { name: "Taken", type: "Custom" } })
      .expect(409);

    expect(response.body).to.deep.equal({
      errorType: "CONFLICT",
      message: 'A context named "Taken" already exists',
    });
    expect(await fixture.graph.getContext("Taken")).to.equal(undefined);

    const rootExisting = new SpinalContext("Root Taken", "Custom");
    await fixture.graph.addContext(rootExisting);
    await request(fixture.app)
      .post("/api/v2/context")
      .send({ info: { name: "Root Taken", type: "Custom" } })
      .expect(409);
    expect(await profileGraph.getContext("Root Taken")).to.equal(undefined);
  });

  it("requires info and type and rejects parent fields", async () => {
    for (const body of [
      {},
      { info: { name: "Missing Type" } },
      {
        info: { name: "Has Parent", type: "Custom" },
        parents: [
          { parentDynamicId: fixture.room._server_id, relationName: "child" },
        ],
      },
    ]) {
      await request(fixture.app).post("/api/v2/context").send(body).expect(400);
    }
    expect(await fixture.graph.getContext("Has Parent")).to.equal(undefined);
  });
});
