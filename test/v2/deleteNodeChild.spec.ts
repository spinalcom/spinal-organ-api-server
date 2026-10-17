import { expect } from "chai";
import request from "supertest";
import { Model } from "spinal-core-connectorjs";
import { SpinalContext } from "spinal-model-graph";
import {
  createSpatialFixture,
  type SpatialFixture,
} from "./helpers/spatialFixture";

const register = require("../../src/routes/v2/node/deleteNodeChild");
describe("DELETE exact child relationship membership", () => {
  let fixture: SpatialFixture;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
    register(null, fixture.app, fixture.middleware);
  });
  afterEach(() => fixture.cleanup());
  const path = (
    type = "PtrLst",
    name = "hasSensor",
    parentId = fixture.room._server_id,
    childId = fixture.equipment._server_id
  ) =>
    `/api/v2/node/${parentId}/child-relationships/${type}/${encodeURIComponent(
      name
    )}/children/${childId}`;

  for (const type of ["PtrLst", "LstPtr", "Ref"]) {
    it(`detaches ${type}, updates reverse links and is idempotent`, async () => {
      const parent = fixture.room;
      const child = fixture.equipment;
      await parent.addChild(child, "hasSensor", type);
      const original = parent.removeChild.bind(parent);
      let calls = 0;
      parent.removeChild = async (...args) => {
        calls++;
        return original(...args);
      };
      const response = await request(fixture.app)
        .delete(path(type))
        .expect(200);
      expect(response.body).to.deep.equal({
        data: {
          parentDynamicId: parent._server_id,
          childDynamicId: child._server_id,
          relationType: type,
          relationName: "hasSensor",
          status: "detached",
        },
      });
      expect(fixture.loads).to.deep.equal([
        parent._server_id,
        child._server_id,
      ]);
      expect(await parent.getChildren("hasSensor")).to.deep.equal([]);
      expect(await child.getParents("hasSensor")).to.deep.equal([]);
      expect(parent.hasRelation("hasSensor", type)).to.equal(true);
      const again = await request(fixture.app).delete(path(type)).expect(200);
      expect(again.body.data.status).to.equal("alreadyDetached");
      expect(calls).to.equal(1);
    });
  }

  it("preserves other names, types, parents, descendants and node data", async () => {
    const { room, equipment, floor } = fixture;
    const descendant = fixture.node("Descendant", "sensor");
    await equipment.addChild(descendant, "hasPart", "Ref");
    (await equipment.getElement()).add_attr("code", "S1");
    await room.addChild(equipment, "hasSensor", "PtrLst");
    await room.addChild(equipment, "hasSensor", "Ref");
    await room.addChild(equipment, "monitors", "PtrLst");
    await floor.addChild(equipment, "hasSensor", "PtrLst");
    const info = equipment.info.get();
    await request(fixture.app).delete(path()).expect(200);
    expect(
      await room.children
        .getElement("PtrLst")
        .getElement("hasSensor")
        .getChildren()
    ).to.deep.equal([]);
    expect(
      await room.children
        .getElement("Ref")
        .getElement("hasSensor")
        .getChildren()
    ).to.deep.equal([equipment]);
    expect(await room.getChildren("monitors")).to.deep.equal([equipment]);
    expect(await equipment.getParents("hasSensor")).to.have.members([
      room,
      floor,
    ]);
    expect(await equipment.getChildren("hasPart")).to.deep.equal([descendant]);
    const after = equipment.info.get();
    expect(after.directModificationDate).to.be.at.least(
      info.directModificationDate
    );
    expect({
      ...after,
      directModificationDate: info.directModificationDate,
    }).to.deep.equal(info);
    expect((await equipment.getElement()).get()).to.deep.equal({ code: "S1" });
  });

  it("detaches globally without clearing context IDs or empty relations", async () => {
    const otherContext = new SpinalContext("Other", "context");
    fixture.register(otherContext);
    await fixture.room.addChildInContext(
      fixture.equipment,
      "hasSensor",
      "PtrLst",
      fixture.context
    );
    const relation = fixture.room.children
      .getElement("PtrLst")
      .getElement("hasSensor");
    relation.addContextId(otherContext.getId().get());
    fixture.equipment.addContextId(otherContext.getId().get());
    await request(fixture.app).delete(path()).expect(200);
    for (const context of [fixture.context, otherContext]) {
      expect(relation.belongsToContext(context)).to.equal(true);
      expect(fixture.equipment.belongsToContext(context)).to.equal(true);
      expect(
        await fixture.room.getChildrenInContext(context, "hasSensor")
      ).to.deep.equal([]);
    }
    expect(fixture.room.hasRelation("hasSensor", "PtrLst")).to.equal(true);
  });

  it("treats missing relations and membership as no-ops without invoking removeChild", async () => {
    const another = fixture.node("Another", "sensor");
    await fixture.room.addChild(another, "hasSensor", "PtrLst");
    fixture.room.removeChild = async () => {
      throw new Error("Must not mutate");
    };
    for (const name of ["missing", "hasSensor"]) {
      const response = await request(fixture.app)
        .delete(path("PtrLst", name))
        .expect(200);
      expect(response.body.data.status).to.equal("alreadyDetached");
    }
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([
      another,
    ]);
  });

  it("uses exact decoded names, with no comma splitting or regex matching", async () => {
    for (const name of [
      "hasSensor,hasDocument",
      "^has.*",
      " has Sensor/\u6e29\u5ea6 ",
    ]) {
      await fixture.room.addChild(fixture.equipment, name, "Ref");
      const response = await request(fixture.app)
        .delete(path("Ref", name))
        .expect(200);
      expect(response.body.data.relationName).to.equal(name);
      expect(response.body.data.status).to.equal("detached");
    }
    await fixture.room.addChild(fixture.equipment, "hasSensor", "Ref");
    const noPattern = await request(fixture.app)
      .delete(path("Ref", "^has.*"))
      .expect(200);
    expect(noPattern.body.data.status).to.equal("alreadyDetached");
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([
      fixture.equipment,
    ]);
  });

  it("rejects invalid IDs, unsupported types, blank names and context/query selectors", async () => {
    for (const url of [
      path("LstPtrLst"),
      path("Invalid"),
      path("PtrLst", " "),
      path("PtrLst", "hasSensor", 0),
      path("PtrLst", "hasSensor", fixture.room._server_id, -1),
      path("PtrLst", "hasSensor", 1.5),
      path("PtrLst", "hasSensor", Number.MAX_SAFE_INTEGER + 1),
    ])
      await request(fixture.app).delete(url).expect(400);
    for (const query of [
      { contextDynamicId: fixture.context._server_id },
      { relationName: "other" },
    ])
      await request(fixture.app).delete(path()).query(query).expect(400);
    expect(fixture.loads).to.deep.equal([]);
  });

  it("fails for missing or non-node models even if the link is absent", async () => {
    const model = new Model();
    fixture.register(model);
    for (const id of [9999999, model._server_id]) {
      await request(fixture.app)
        .delete(path("PtrLst", "missing", id))
        .expect(400);
      await request(fixture.app)
        .delete(path("PtrLst", "missing", fixture.room._server_id, id))
        .expect(400);
    }
  });

  it("does not mutate when profile access to either node is denied", async () => {
    await fixture.room.addChild(fixture.equipment, "hasSensor", "PtrLst");
    const original = fixture.middleware.load.bind(fixture.middleware);
    for (const denied of [
      fixture.room._server_id,
      fixture.equipment._server_id,
    ]) {
      fixture.middleware.load = async (id, profile) => {
        if (id === denied) throw new Error("Denied");
        return original(id, profile);
      };
      await request(fixture.app).delete(path()).expect(400);
      expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([
        fixture.equipment,
      ]);
    }
  });

  it("reports removal failures without exposing internal details or claiming success", async () => {
    await fixture.room.addChild(fixture.equipment, "hasSensor", "PtrLst");
    fixture.room.removeChild = async () => {
      throw new Error("private failure");
    };
    const response = await request(fixture.app).delete(path()).expect(500);
    expect(response.body.errorType).to.equal("INTERNAL_ERROR");
    expect(JSON.stringify(response.body)).not.to.include("private failure");
    expect(response.body).not.to.have.property("data");
    expect(await fixture.room.getChildren("hasSensor")).to.deep.equal([
      fixture.equipment,
    ]);
  });
});
