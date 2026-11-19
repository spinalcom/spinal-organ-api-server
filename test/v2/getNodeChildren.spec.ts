import { expect } from "chai";
import request from "supertest";
import { Model } from "spinal-core-connectorjs";
import { SpinalContext, SpinalMap } from "spinal-model-graph";
import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
import {
  createSpatialFixture,
  type SpatialFixture,
} from "./helpers/spatialFixture";

const registrars = [
  require("../../src/routes/v2/node/getNodeChildren"),
  require("../../src/routes/v2/node/getNodeChildRelationships"),
];
describe("v2 direct children and relationships GET", () => {
  let fixture: SpatialFixture;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
    for (const register of registrars)
      register(null, fixture.app, fixture.middleware);
  });
  afterEach(() => fixture.cleanup());
  const path = (kind: string) =>
    `/api/v2/node/${fixture.room._server_id}/${
      kind === "relationships" ? "child-relationships" : kind
    }`;

  it("replaces the old relationships route with child-relationships", async () => {
    await request(fixture.app).get(path("relationships")).expect(200);
    await request(fixture.app)
      .get(`/api/v2/node/${fixture.room._server_id}/relationships`)
      .expect(404);
  });

  it("deduplicates children but preserves occurrences grouped by exact type and name", async () => {
    await fixture.room.addChild(fixture.equipment, "hasSensor", "Ref");
    await fixture.room.addChild(fixture.equipment, "hasSensor", "PtrLst");
    const child = fixture.node("Document", "document");
    await fixture.room.addChild(child, "hasDocument", "PtrLst");
    const flat = await request(fixture.app)
      .get(path("children"))
      .query({ info: "name" })
      .expect(200);
    expect(flat.body.total).to.equal(2);
    expect(
      flat.body.data.map((n: { dynamicId: number }) => n.dynamicId)
    ).to.deep.equal([fixture.equipment._server_id, child._server_id]);
    const grouped = await request(fixture.app)
      .get(path("relationships"))
      .query({ info: "name" })
      .expect(200);
    expect(grouped.body.total).to.equal(4);
    expect(grouped.body.parentDynamicId).to.equal(fixture.room._server_id);
    expect(grouped.body.data.Ref.hasSensor[0].dynamicId).to.equal(
      fixture.equipment._server_id
    );
    expect(grouped.body.data.PtrLst.hasSensor[0].dynamicId).to.equal(
      fixture.equipment._server_id
    );
    expect(grouped.body.data.PtrLst.hasDocument[0].info.name).to.equal(
      "Document"
    );
  });

  for (const kind of ["children", "relationships"]) {
    describe(kind, () => {
      it("matches multiple trimmed relation names with OR without loading other children", async () => {
        const sensor = fixture.node("Sensor", "sensor");
        const document = fixture.node("Guide", "document");
        await fixture.room.addChild(sensor, "hasSensor", "Ref");
        await fixture.room.addChild(document, "hasDocument", "PtrLst");
        const response = await request(fixture.app)
          .get(path(kind))
          .query({
            relationName: " hasSensor, hasDocument,hasSensor ",
            info: "name",
          })
          .expect(200);
        expect(response.body.total).to.equal(2);
        const items =
          kind === "children"
            ? response.body.data
            : [
                ...response.body.data.Ref.hasSensor,
                ...response.body.data.PtrLst.hasDocument,
              ];
        expect(
          items.map((item: { dynamicId: number }) => item.dynamicId)
        ).to.have.members([sensor._server_id, document._server_id]);
        expect(fixture.loads).not.to.include(fixture.equipment._server_id);
        const selectedType = await request(fixture.app)
          .get(path(kind))
          .query({
            relationName: "hasSensor,hasDocument",
            relationType: "Ref",
          })
          .expect(200);
        expect(selectedType.body.total).to.equal(1);
        for (const relationName of [
          ",",
          "hasSensor,",
          ",hasSensor",
          "hasSensor, ,hasDocument",
        ])
          await request(fixture.app)
            .get(path(kind))
            .query({ relationName })
            .expect(400);
      });

      it("selects types and names, filters, projects and does not traverse descendants", async () => {
        const child = fixture.node("Sensor", "sensor");
        child.info.add_attr("virtual", false);
        await attributeService.createOrUpdateAttrsAndCategories(
          child,
          "Technical",
          { Code: "001" }
        );
        const grandchild = fixture.node("Grandchild", "sensor");
        await child.addChild(grandchild, "hasSensor", "PtrLst");
        await fixture.room.addChild(child, "hasSensor", "Ref");
        const response = await request(fixture.app)
          .get(path(kind))
          .query({
            relationType: "Ref",
            relationName: "hasSensor",
            "filter[info.virtual]": "false",
            info: "false",
            attributes: "Technical/Code",
            element: "true",
          })
          .expect(200);
        expect(response.body.total).to.equal(1);
        const item =
          kind === "children"
            ? response.body.data[0]
            : response.body.data.Ref.hasSensor[0];
        expect(item).to.deep.equal({
          dynamicId: child._server_id,
          parentDynamicId: fixture.room._server_id,
          attributes: { Technical: { Code: "001" } },
          element: null,
        });
        expect(fixture.loads).to.include(child._server_id);
        expect(fixture.loads).not.to.include(grandchild._server_id);
      });

      it("restricts both relation and child membership to the selected context", async () => {
        const context = new SpinalContext("Other", "context");
        fixture.register(context);
        const child = fixture.node("Context child", "sensor");
        await fixture.room.addChildInContext(
          child,
          "hasSensor",
          "Ref",
          context
        );
        await fixture.room.addChild(fixture.equipment, "hasSensor", "PtrLst");
        const unrelated = fixture.room.children
          .getElement("PtrLst")
          .getElement("hasSensor");
        unrelated.getChildren = async () => {
          throw new Error("Must not fetch unrelated children");
        };
        unrelated.getChildrenInContext = async () => {
          throw new Error("Must not fetch unrelated children");
        };
        const outsideContext = fixture.node("Outside context", "sensor");
        await fixture.room.addChild(outsideContext, "hasSensor", "Ref");
        const response = await request(fixture.app)
          .get(path(kind))
          .query({
            contextDynamicId: context._server_id,
            info: "name",
          })
          .expect(200);
        expect(response.body.total).to.equal(1);
        const item =
          kind === "children"
            ? response.body.data[0]
            : response.body.data.Ref.hasSensor[0];
        expect(item.dynamicId).to.equal(child._server_id);
        expect(fixture.loads).not.to.include(fixture.equipment._server_id);
        expect(fixture.loads).not.to.include(outsideContext._server_id);
      });

      it("skips LstPtrLst before touching any relation methods, even when selected", async () => {
        const unsupported = new Model();
        unsupported.getChildren = () => {
          throw new Error("Must not inspect");
        };
        unsupported.belongsToContext = () => {
          throw new Error("Must not inspect");
        };
        const map = new SpinalMap<Model>();
        map.setElement("future", unsupported);
        fixture.room.children.setElement("LstPtrLst", map);
        const warnings: unknown[][] = [];
        const originalWarn = console.warn;
        console.warn = (...args: unknown[]) => {
          warnings.push(args);
        };
        try {
          await request(fixture.app).get(path(kind)).expect(200);
          const response = await request(fixture.app)
            .get(path(kind))
            .query({
              relationType: "LstPtrLst",
              contextDynamicId: fixture.context._server_id,
            })
            .expect(200);
          expect(response.body.total).to.equal(0);
          expect(response.body.data).to.deep.equal(
            kind === "children" ? [] : {}
          );
          expect(warnings).to.deep.equal([
            [
              `[listNodeRelations] Skipping unsupported relation type LstPtrLst on node ${fixture.room._server_id}`,
            ],
            [
              `[listNodeRelations] Skipping unsupported relation type LstPtrLst on node ${fixture.room._server_id}`,
            ],
          ]);
        } finally {
          console.warn = originalWarn;
        }
      });

      it("paginates globally after filtering with an exact 200-item limit", async () => {
        for (let i = 0; i < 205; i++) {
          const child = fixture.node(`Sensor ${i}`, "sensor");
          child.info.add_attr("virtual", false);
          await fixture.room.addChild(
            child,
            i < 100 ? "first" : "second",
            "Ref"
          );
        }
        const response = await request(fixture.app)
          .get(path(kind))
          .query({
            relationType: "Ref",
            "filter[info.virtual]": "false",
            info: "name",
            offset: 3,
          })
          .expect(200);
        expect(response.body.total).to.equal(200);
        const items =
          kind === "children"
            ? response.body.data
            : Object.values(response.body.data.Ref).flat();
        expect(items).to.have.length(200);
        expect(items[0].info.name).to.equal("Sensor 3");
        expect(items[199].info.name).to.equal("Sensor 202");
        const end = await request(fixture.app)
          .get(path(kind))
          .query({
            relationType: "Ref",
            offset: 203,
            info: "name",
          })
          .expect(200);
        expect(end.body.total).to.equal(2);
      });

      it("returns empty results for unmatched selectors", async () => {
        const response = await request(fixture.app)
          .get(path(kind))
          .query({ relationName: "missing" })
          .expect(200);
        expect(response.body.data).to.deep.equal(kind === "children" ? [] : {});
        expect(response.body.total).to.equal(0);
      });

      it("reports invalid nodes and contexts, and rejects malformed queries", async () => {
        for (const query of [
          { relationType: "Invalid" },
          { relationName: "" },
          { offset: -1 },
          { offset: 1.5 },
          { contextDynamicId: 0 },
          { unknown: "x" },
          { "filter[info.name][unsupported]": "x" },
        ])
          await request(fixture.app).get(path(kind)).query(query).expect(400);
        await request(fixture.app)
          .get(path(kind))
          .query({ contextDynamicId: fixture.floor._server_id })
          .expect(400);
        await request(fixture.app)
          .get(
            `/api/v2/node/9999999/${
              kind === "relationships" ? "child-relationships" : kind
            }`
          )
          .expect(400);
        await request(fixture.app)
          .get(
            `/api/v2/node/0/${
              kind === "relationships" ? "child-relationships" : kind
            }`
          )
          .expect(400);
      });

      it("fails explicitly on denied child access and unexpected traversal errors", async () => {
        const original = fixture.middleware.load.bind(fixture.middleware);
        fixture.middleware.load = async (id, profile) => {
          if (id === fixture.equipment._server_id) throw new Error("Denied");
          return original(id, profile);
        };
        await request(fixture.app).get(path(kind)).expect(400);
        fixture.middleware.load = original;
        const relations = fixture.room.children.getElement("PtrLst");
        const relation = relations.getElement([...relations.keys()][0]);
        relation.getChildren = async () => {
          throw new Error("private failure");
        };
        const response = await request(fixture.app).get(path(kind)).expect(500);
        expect(JSON.stringify(response.body)).not.to.include("private failure");
      });
    });
  }

  it("deduplicates before offset for children, but offsets relationship occurrences", async () => {
    await fixture.room.addChild(fixture.equipment, "second", "Ref");
    const flat = await request(fixture.app)
      .get(path("children"))
      .query({ offset: 1 })
      .expect(200);
    expect(flat.body.total).to.equal(0);
    const grouped = await request(fixture.app)
      .get(path("relationships"))
      .query({ offset: 1 })
      .expect(200);
    expect(grouped.body.total).to.equal(1);
    expect(grouped.body.data.Ref.second[0].dynamicId).to.equal(
      fixture.equipment._server_id
    );
  });
});
