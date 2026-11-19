import { expect } from "chai";
import request from "supertest";
import { Model, Lst } from "spinal-core-connectorjs";
import { SpinalNode } from "spinal-model-graph";
import {
  patchNode,
  patchNodeSchema,
} from "../../src/utilities/v2/node/patchNode";
import {
  attributeService,
  NODE_TO_CATEGORY_RELATION,
} from "spinal-env-viewer-plugin-documentation-service";
import {
  createSpatialFixture,
  type SpatialFixture,
} from "./helpers/spatialFixture";

const register = require("../../src/routes/v2/node/patchNodeById");
describe("PATCH /api/v2/node/:nodeId", () => {
  let fixture: SpatialFixture;
  let node: SpinalNode;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
    register(null, fixture.app, fixture.middleware);
    node = new SpinalNode(
      "Sensor",
      "sensor",
      new Model({
        value: 20,
        metadata: { oldCode: "001" },
        samples: [1, 2],
      })
    );
    node.info.add_attr({ unit: "Celsius", obsolete: true });
    fixture.register(node);
  });
  afterEach(() => fixture.cleanup());
  const path = () => `/api/v2/node/${node._server_id}`;

  it("stages only info.name without reading unrelated branches, element or categories", async () => {
    const name = node.info.name;
    const unrelated = new Model({ nested: "Untouched" });
    node.info.add_attr("unrelated", unrelated);
    unrelated.nested.get = () => {
      throw new Error("Must not clone unrelated info");
    };
    node.getElement = async () => {
      throw new Error("Must not load element");
    };
    node.getChildren = async () => {
      throw new Error("Must not load categories");
    };
    await patchNode(
      node,
      patchNodeSchema.parse({ info: { set: { name: "Renamed" } } }),
      fixture.middleware,
      fixture.profileId
    );
    expect(node.info.name).to.equal(name);
    expect(name.get()).to.equal("Renamed");
    expect(node.info.unrelated).to.equal(unrelated);
    expect(node.info.unit.get()).to.equal("Celsius");
    expect(node.info.obsolete.get()).to.equal(true);
  });

  it("stages only selected element branches and leaves info and sibling Models untouched", async () => {
    const element = await node.getElement(true);
    const samples = element.samples;
    const metadata = element.metadata;
    element.value.get = () => {
      throw new Error("Must not clone sibling");
    };
    node.info.unit.get = () => {
      throw new Error("Must not clone info");
    };
    node.getChildren = async () => {
      throw new Error("Must not load categories");
    };
    await patchNode(
      node,
      patchNodeSchema.parse({
        element: {
          set: { "metadata.code": "002" },
          remove: ["metadata.oldCode"],
        },
      }),
      fixture.middleware,
      fixture.profileId
    );
    expect(element.metadata).to.equal(metadata);
    expect(metadata.get()).to.deep.equal({ code: "002" });
    expect(element.samples).to.equal(samples);
  });

  it("loads only needed attribute category elements and clones only selected values", async () => {
    await attributeService.createOrUpdateAttrsAndCategories(node, "Technical", {
      Code: "001",
      Other: "x",
    });
    await attributeService.createOrUpdateAttrsAndCategories(node, "Unrelated", {
      Value: "y",
    });
    const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);
    const technical = categories.find(
      (category) => category.getName().get() === "Technical"
    )!;
    const unrelated = categories.find(
      (category) => category.getName().get() === "Unrelated"
    )!;
    const list = await technical.getElement(true);
    const code = [...list].find((attr) => attr.label.get() === "Code");
    const other = [...list].find((attr) => attr.label.get() === "Other");
    const value = code.value;
    other.value.get = () => {
      throw new Error("Must not clone other attribute");
    };
    unrelated.getElement = async () => {
      throw new Error("Must not load unrelated category element");
    };
    node.getElement = async () => {
      throw new Error("Must not load node element");
    };
    await patchNode(
      node,
      patchNodeSchema.parse({
        attributes: { set: { Technical: { Code: "002" } } },
      }),
      fixture.middleware,
      fixture.profileId
    );
    expect(code.value).to.equal(value);
    expect(value.get()).to.equal("002");
    expect([...list]).to.include(other);
    expect(node.info.unit.get()).to.equal("Celsius");
  });

  it("stages self-reference dependencies without touching unrelated sections", async () => {
    const element = await node.getElement(true);
    const code = element.metadata.oldCode;
    element.value.get = () => {
      throw new Error("Must not clone unrelated element branch");
    };
    node.getChildren = async () => {
      throw new Error("Must not load attributes");
    };
    await patchNode(
      node,
      patchNodeSchema.parse({
        info: {
          set: {
            alias: { $modelRef: "self", path: "element.metadata.oldCode" },
          },
        },
      }),
      fixture.middleware,
      fixture.profileId
    );
    expect(node.info.alias).to.equal(code);
    expect(element.metadata.oldCode).to.equal(code);
  });

  it("preserves aliases in unselected sections when a selected shared scalar changes", async () => {
    const element = await node.getElement(true);
    element.add_attr("unitAlias", node.info.unit);
    const unit = node.info.unit;
    node.getElement = async () => {
      throw new Error("Must not load unselected alias");
    };
    node.getChildren = async () => {
      throw new Error("Must not load attributes");
    };
    await patchNode(
      node,
      patchNodeSchema.parse({ info: { set: { unit: "Kelvin" } } }),
      fixture.middleware,
      fixture.profileId
    );
    expect(element.unitAlias).to.equal(unit);
    expect(unit.get()).to.equal("Kelvin");
  });

  it("stages the full element when referenced as a whole and preserves its identity", async () => {
    const element = await node.getElement(true);
    await patchNode(
      node,
      patchNodeSchema.parse({
        info: { set: { payload: { $modelRef: "self", path: "element" } } },
        element: { set: { value: 25 } },
      }),
      fixture.middleware,
      fixture.profileId
    );
    expect(node.info.payload).to.equal(element);
    expect(element.get()).to.deep.equal({
      value: 25,
      metadata: { oldCode: "001" },
      samples: [1, 2],
    });
  });

  it("keeps shared selected branches connected and retains unselected aliases", async () => {
    const shared = new Model({ code: "001" });
    node.info.add_attr("first", shared);
    node.info.add_attr("second", shared);
    node.info.add_attr("unselected", shared);
    await patchNode(
      node,
      patchNodeSchema.parse({
        info: {
          set: {
            "first.code": "002",
            alias: { $modelRef: "self", path: "info.second.code" },
          },
        },
      }),
      fixture.middleware,
      fixture.profileId
    );
    expect(node.info.first).to.equal(shared);
    expect(node.info.second).to.equal(shared);
    expect(node.info.unselected).to.equal(shared);
    expect(node.info.alias).to.equal(shared.code);
    expect(shared.code.get()).to.equal("002");
  });

  it("rejects invalid selected branches without committing other staged changes", async () => {
    const element = await node.getElement(true);
    const metadata = element.metadata;
    await request(fixture.app)
      .patch(path())
      .send({
        info: { set: { name: "Must not change" } },
        element: {
          set: {
            "metadata.cycle": { $modelRef: "self", path: "element.metadata" },
          },
        },
      })
      .expect(400);
    expect(node.getName().get()).to.equal("Sensor");
    expect(metadata.cycle).to.equal(undefined);
    expect(metadata.oldCode.get()).to.equal("001");
  });

  it("sets type and nested fields, removes fields and preserves scalar and rename identity", async () => {
    const originalName = node.info.name;
    const element = await node.getElement(true);
    const code = element.metadata.oldCode;
    const value = element.value;
    const response = await request(fixture.app)
      .patch(path())
      .query({ info: "true", element: "true" })
      .send({
        info: {
          set: { name: "Updated", type: "newType", "metadata.flag": false },
          remove: ["obsolete"],
        },
        element: {
          set: { value: 22, "samples.1": 3 },
          rename: [{ from: "metadata.oldCode", to: "metadata.code" }],
        },
      })
      .expect(200);
    expect(node.info.name).to.equal(originalName);
    expect(node.getType().get()).to.equal("newType");
    expect(element.metadata.code).to.equal(code);
    expect(element.value).to.equal(value);
    expect(element.samples.get()).to.deep.equal([1, 3]);
    expect(response.body.data.info.metadata).to.deep.equal({ flag: false });
    expect(node.info.obsolete).to.equal(undefined);
  });

  it("blocks all ID changes including rename destinations and top-level dynamicId", async () => {
    const id = node.getId().get();
    const dynamicId = node._server_id;
    for (const field of [
      "id",
      "staticId",
      "dynamicId",
      "id.value",
      "dynamicId.value",
    ]) {
      for (const info of [
        { set: { [field]: "override", name: "Must not change" } },
        { remove: [field] },
        { rename: [{ from: field, to: "other" }] },
        { rename: [{ from: "unit", to: field }] },
      ])
        await request(fixture.app).patch(path()).send({ info }).expect(400);
    }
    await request(fixture.app)
      .patch(path())
      .send({ dynamicId: 12 })
      .expect(400);
    expect(node.getId().get()).to.equal(id);
    expect(node._server_id).to.equal(dynamicId);
    expect(node.getName().get()).to.equal("Sensor");
  });

  it("allows setting type but blocks removing and renaming it", async () => {
    for (const info of [
      { remove: ["type"] },
      { rename: [{ from: "type", to: "other" }] },
      { rename: [{ from: "unit", to: "type" }] },
      { set: { "type.value": "bad" } },
      { set: { type: {} } },
      { set: { type: "" } },
    ])
      await request(fixture.app).patch(path()).send({ info }).expect(400);
    await request(fixture.app)
      .patch(path())
      .send({ info: { set: { type: "updated" } } })
      .expect(200);
    expect(node.getType().get()).to.equal("updated");
  });

  it("renames attribute labels in place, updates values and removes attributes", async () => {
    await attributeService.createOrUpdateAttrsAndCategories(node, "Technical", {
      OldCode: "001",
      Remove: "x",
    });
    const [category] = await node.getChildren(NODE_TO_CATEGORY_RELATION);
    const list = await category.getElement(true);
    const attribute = [...list].find((a) => a.label.get() === "OldCode");
    const value = attribute.value;
    await request(fixture.app)
      .patch(path())
      .query({ attributes: "true" })
      .send({
        attributes: {
          rename: [{ category: "Technical", from: "OldCode", to: "Code" }],
          remove: [{ category: "Technical", label: "Remove" }],
          set: { Technical: { New: "new" } },
        },
      })
      .expect(200);
    expect(attribute.label.get()).to.equal("Code");
    expect(attribute.value).to.equal(value);
    expect([...list].map((a) => a.label.get())).to.deep.equal(["Code", "New"]);
    await request(fixture.app)
      .patch(path())
      .send({ attributes: { set: { Technical: { Code: "002" } } } })
      .expect(200);
    expect(value.get()).to.equal("002");
  });

  it("resolves forward self references against final state, including new attributes", async () => {
    await request(fixture.app)
      .patch(path())
      .send({
        info: {
          set: { alias: { $modelRef: "self", path: "element.later.value" } },
        },
        element: {
          set: {
            unit: { $modelRef: "self", path: "info.unit" },
            code: { $modelRef: "self", path: "attr.Technical.Code" },
            later: { value: 42 },
          },
        },
        attributes: { set: { Technical: { Code: "001" } } },
      })
      .expect(200);
    const element = await node.getElement(true);
    expect(node.info.alias).to.equal(element.later.value);
    expect(element.unit).to.equal(node.info.unit);
    const [category] = await node.getChildren(NODE_TO_CATEGORY_RELATION);
    expect(element.code).to.equal((await category.getElement(true))[0].value);
  });

  for (const initial of [undefined, 42, "Kelvin"]) {
    it(`treats its own dynamic ID as self with initial unit ${initial}`, async () => {
      node.info.rem_attr("unit");
      if (initial !== undefined) node.info.add_attr("unit", initial);
      const loadsBefore = fixture.loads.length;
      await request(fixture.app)
        .patch(path())
        .send({
          info: {
            set: {
              unitAlias: { $modelRef: node._server_id, path: "info.unit" },
              unit: "Celsius",
            },
          },
          element: {
            set: {
              aliases: [
                { $modelRef: node._server_id, path: "info.unit" },
                { code: { $modelRef: node._server_id, path: "attr.Technical.Code" } },
              ],
            },
          },
          attributes: { set: { Technical: { Code: "001" } } },
        })
        .expect(200);
      const element = await node.getElement(true);
      const [category] = await node.getChildren(NODE_TO_CATEGORY_RELATION);
      const [attribute] = await category.getElement(true);
      expect(node.info.unit.get()).to.equal("Celsius");
      expect(node.info.unitAlias === node.info.unit).to.equal(true);
      expect(element.aliases[0] === node.info.unit).to.equal(true);
      expect(element.aliases[1].code === attribute.value).to.equal(true);
      expect(fixture.loads.slice(loadsBefore)).to.deep.equal([node._server_id]);
    });
  }

  it("stages unchanged branches referenced by its own dynamic ID", async () => {
    await request(fixture.app)
      .patch(path())
      .send({
        info: {
          set: { alias: { $modelRef: node._server_id, path: "element" } },
        },
      })
      .expect(200);
    expect(node.info.alias === await node.getElement(true)).to.equal(true);
  });

  it("rejects cycles through its own dynamic ID before committing", async () => {
    const name = node.getName().get();
    await request(fixture.app)
      .patch(path())
      .send({
        info: {
          set: {
            name: "Not committed",
            a: { $modelRef: node._server_id, path: "info.b" },
            b: { $modelRef: node._server_id, path: "info.a" },
          },
        },
      })
      .expect(400);
    expect(node.getName().get()).to.equal(name);
    expect(node.info.a === undefined).to.equal(true);
    expect(node.info.b === undefined).to.equal(true);
  });

  it("resolves forward references inside a replacement object and to updated existing scalars", async () => {
    const unit = node.info.unit;
    await request(fixture.app)
      .patch(path())
      .send({
        info: {
          set: {
            alias: { $modelRef: "self", path: "info.unit" },
            unit: "Kelvin",
          },
        },
        element: {
          set: {
            bundle: {
              alias: { $modelRef: "self", path: "element.bundle.later.value" },
              later: { value: 42 },
            },
          },
        },
      })
      .expect(200);
    const element = await node.getElement(true);
    expect(element.bundle.alias).to.equal(element.bundle.later.value);
    expect(node.info.alias).to.equal(unit);
    expect(node.info.unit).to.equal(unit);
    expect(unit.get()).to.equal("Kelvin");
  });

  it("rejects bad references and conflicts without mutating any section", async () => {
    for (const patch of [
      {
        info: {
          set: {
            name: "Bad",
            value: { $modelRef: 9999999, path: "info.name" },
          },
        },
      },
      {
        info: {
          set: {
            a: { $modelRef: "self", path: "info.b" },
            b: { $modelRef: "self", path: "info.a" },
          },
        },
      },
      { info: { set: { metadata: {}, "metadata.value": 1 } } },
      { info: { set: { unit: "Bad" }, remove: ["unit"] } },
      { element: { rename: [{ from: "metadata.oldCode", to: "other.code" }] } },
      { element: { rename: [{ from: "missing", to: "new" }] } },
      { element: { remove: ["samples.0"] } },
      { element: { set: { "samples.2": 3 } } },
      { info: { set: { _hidden: 1 } } },
    ])
      await request(fixture.app).patch(path()).send(patch).expect(400);
    expect(node.getName().get()).to.equal("Sensor");
    expect(node.info.unit.get()).to.equal("Celsius");
    expect(node.info.a).to.equal(undefined);
    expect((await node.getElement(true)).samples.get()).to.deep.equal([1, 2]);
  });

  it("replaces complete objects and arrays while preserving unmodified branches", async () => {
    const element = await node.getElement(true);
    const originalSamples = element.samples;
    await request(fixture.app)
      .patch(path())
      .send({
        element: { set: { metadata: { newCode: "002" }, samples: [4, 5, 6] } },
      })
      .expect(200);
    expect(element.metadata.get()).to.deep.equal({ newCode: "002" });
    expect(element.samples).not.to.equal(originalSamples);
    expect(element.samples).to.be.instanceOf(Lst);
    expect(element.samples.get()).to.deep.equal([4, 5, 6]);
  });

  it("creates an absent element only when edited and rejects empty or invalid requests", async () => {
    for (const body of [
      {},
      { info: {} },
      { attributes: { set: {} } },
      { unknown: 1 },
    ]) {
      await request(fixture.app).patch(path()).send(body).expect(400);
    }
    await request(fixture.app)
      .patch(`/api/v2/node/${fixture.room._server_id}`)
      .send({
        info: { set: { flag: false } },
      })
      .expect(200);
    expect(await fixture.room.getElement(true)).to.equal(undefined);
    await request(fixture.app)
      .patch(`/api/v2/node/${fixture.room._server_id}`)
      .query({ element: "true" })
      .send({
        element: { set: { value: 1 } },
      })
      .expect(200);
    expect((await fixture.room.getElement(true)).get()).to.deep.equal({
      value: 1,
    });
  });

  it("rejects occupied rename destinations and conflicting attribute operations", async () => {
    await attributeService.createOrUpdateAttrsAndCategories(node, "Technical", {
      A: "1",
      B: "2",
    });
    for (const body of [
      {
        attributes: { rename: [{ category: "Technical", from: "A", to: "B" }] },
      },
      {
        attributes: {
          rename: [{ category: "Technical", from: "Missing", to: "C" }],
        },
      },
      {
        attributes: {
          rename: [{ category: "Technical", from: "A", to: "C" }],
          set: { Technical: { C: "3" } },
        },
      },
      {
        attributes: {
          remove: [{ category: "Technical", label: "A" }],
          set: { Technical: { A: "3" } },
        },
      },
      { info: { rename: [{ from: "unit", to: "obsolete" }] } },
    ])
      await request(fixture.app).patch(path()).send(body).expect(400);
    expect(node.info.unit.get()).to.equal("Celsius");
    const [category] = await node.getChildren(NODE_TO_CATEGORY_RELATION);
    expect(
      [...(await category.getElement(true))].map((a) => a.label.get())
    ).to.deep.equal(["A", "B"]);
  });

  it("supports same-name rename and missing-remove no-ops without creating an element", async () => {
    await request(fixture.app)
      .patch(`/api/v2/node/${fixture.room._server_id}`)
      .send({
        element: { remove: ["missing"] },
        info: { rename: [{ from: "name", to: "name" }] },
      })
      .expect(400);
    await request(fixture.app)
      .patch(`/api/v2/node/${fixture.room._server_id}`)
      .send({
        element: { remove: ["missing"] },
        info: { rename: [{ from: "color", to: "color" }] },
      })
      .expect(400);
    await request(fixture.app)
      .patch(path())
      .send({
        info: { rename: [{ from: "unit", to: "unit" }], remove: ["missing"] },
      })
      .expect(200);
    await request(fixture.app)
      .patch(`/api/v2/node/${fixture.room._server_id}`)
      .send({
        element: { remove: ["missing"] },
      })
      .expect(200);
    expect(await fixture.room.getElement(true)).to.equal(undefined);
  });

  it("uses profile-scoped node loads and shares numeric reference targets", async () => {
    await request(fixture.app)
      .patch(path())
      .send({
        element: {
          set: {
            shared: { $modelRef: fixture.room._server_id, path: "info.name" },
          },
        },
      })
      .expect(200);
    expect((await node.getElement(true)).shared).to.equal(
      fixture.room.info.name
    );
    expect(fixture.loads).to.deep.equal([
      node._server_id,
      fixture.room._server_id,
    ]);
    fixture.middleware.load = async (_id, profileId) => {
      expect(profileId).to.equal(fixture.profileId);
      throw new Error("Access denied");
    };
    await request(fixture.app)
      .patch(path())
      .send({ info: { set: { name: "Denied" } } })
      .expect(400);
    expect(node.getName().get()).to.equal("Sensor");
  });

  it("rejects malformed queries and invalid IDs before writing", async () => {
    for (const query of [
      { info: "metadata..value" },
      { element: "_server_id" },
      { unknown: "true" },
    ]) {
      await request(fixture.app)
        .patch(path())
        .query(query)
        .send({
          info: { set: { name: "Must not change" } },
        })
        .expect(400);
    }
    for (const id of ["0", "-1", "1.5", "invalid"]) {
      await request(fixture.app)
        .patch(`/api/v2/node/${id}`)
        .send({ info: { set: { name: "Bad" } } })
        .expect(400);
    }
    expect(node.getName().get()).to.equal("Sensor");
    expect(fixture.loads).to.deep.equal([]);
  });

  it("rejects ancestor embedding and references to removed fields before mutation", async () => {
    for (const body of [
      { element: { set: { self: { $modelRef: "self", path: "element" } } } },
      {
        info: {
          set: { alias: { $modelRef: "self", path: "info.unit" } },
          remove: ["unit"],
        },
      },
    ])
      await request(fixture.app).patch(path()).send(body).expect(400);
    expect(node.info.unit.get()).to.equal("Celsius");
    expect((await node.getElement(true)).self).to.equal(undefined);
  });
});
