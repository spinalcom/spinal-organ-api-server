import { expect } from "chai";
import request from "supertest";
import { SpinalContext, SpinalNode } from "spinal-model-graph";
import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
import {
  createSpatialFixture,
  type SpatialFixture,
} from "./helpers/spatialFixture";

const registrars = [
  require("../../src/routes/v2/node/getNodeParents"),
  require("../../src/routes/v2/node/getNodeParentRelationships"),
];

describe("v2 direct parents and parent relationships GET", () => {
  let fixture: SpatialFixture;
  let child: SpinalNode;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
    child = fixture.node("Target sensor", "sensor");
    for (const register of registrars)
      register(null, fixture.app, fixture.middleware);
  });
  afterEach(() => fixture.cleanup());
  const path = (kind: string) => `/api/v2/node/${child._server_id}/${kind}`;

  it("deduplicates parents but preserves type/name occurrences and omits parentDynamicId", async () => {
    const a = fixture.node("Room A", "room");
    const b = fixture.node("Room B", "room");
    await a.addChild(child, "hasSensor", "LstPtr");
    await b.addChild(child, "hasSensor", "PtrLst");
    await a.addChild(child, "monitors", "Ref");
    const flat = await request(fixture.app)
      .get(path("parents"))
      .query({ info: "name" })
      .expect(200);
    expect(flat.body.total).to.equal(2);
    expect(
      flat.body.data.map((item: { dynamicId: number }) => item.dynamicId)
    ).to.have.members([a._server_id, b._server_id]);
    flat.body.data.forEach((item: object) =>
      expect(item).not.to.have.property("parentDynamicId")
    );
    const grouped = await request(fixture.app)
      .get(path("parent-relationships"))
      .query({ info: "name" })
      .expect(200);
    expect(grouped.body.nodeDynamicId).to.equal(child._server_id);
    expect(grouped.body).not.to.have.property("parentDynamicId");
    expect(grouped.body.total).to.equal(3);
    expect(grouped.body.data.LstPtr.hasSensor[0]).to.deep.equal({
      dynamicId: a._server_id,
      info: { name: "Room A" },
    });
    expect(grouped.body.data.PtrLst.hasSensor[0].dynamicId).to.equal(
      b._server_id
    );
    expect(grouped.body.data.Ref.monitors[0].dynamicId).to.equal(a._server_id);
    const flatEnd = await request(fixture.app)
      .get(path("parents"))
      .query({ offset: 2 })
      .expect(200);
    expect(flatEnd.body.total).to.equal(0);
    const groupedEnd = await request(fixture.app)
      .get(path("parent-relationships"))
      .query({ offset: 2 })
      .expect(200);
    expect(groupedEnd.body.total).to.equal(1);
    expect(groupedEnd.body.data.Ref.monitors[0].dynamicId).to.equal(
      a._server_id
    );
  });

  for (const kind of ["parents", "parent-relationships"]) {
    describe(kind, () => {
      it("selects OR names and type, filters and projects parents only", async () => {
        const parent = fixture.node("Room A", "room");
        const other = fixture.node("Room B", "room");
        const grandparent = fixture.node("Building", "building");
        await grandparent.addChild(parent, "hasRoom", "PtrLst");
        parent.info.add_attr("virtual", false);
        (await parent.getElement()).add_attr({ code: "A", hidden: "B" });
        await attributeService.createOrUpdateAttrsAndCategories(
          parent,
          "Technical",
          { Code: "001" }
        );
        await parent.addChild(child, "hasSensor", "Ref");
        await other.addChild(child, "monitors", "Ref");
        await other.addChild(child, "ignored", "PtrLst");
        const response = await request(fixture.app)
          .get(path(kind))
          .query({
            relationName: " hasSensor, monitors,hasSensor ",
            relationType: "Ref",
            "filter[info.virtual]": "false",
            info: "false",
            attributes: "Technical/Code",
            element: "code",
            "add-attributes-modification-date": "true",
          })
          .expect(200);
        expect(response.body.total).to.equal(1);
        const item =
          kind === "parents"
            ? response.body.data[0]
            : response.body.data.Ref.hasSensor[0];
        expect(item.dynamicId).to.equal(parent._server_id);
        expect(item).not.to.have.property("info");
        expect(item).not.to.have.property("parentDynamicId");
        expect(item.element).to.deep.equal({ code: "A" });
        expect(item.attributes.Technical.Code).to.have.property("value", "001");
        expect(item.attributes.Technical.Code)
          .to.have.property("lastModification")
          .that.is.a("number");
        expect(fixture.loads).not.to.include(grandparent._server_id);
        const or = await request(fixture.app)
          .get(path(kind))
          .query({
            relationName: "hasSensor,monitors",
            relationType: "Ref",
          })
          .expect(200);
        expect(or.body.total).to.equal(2);
        const named = await request(fixture.app)
          .get(path(kind))
          .query({ relationName: "monitors" })
          .expect(200);
        expect(named.body.total).to.equal(1);
      });

      it("requires child, relation and parent context membership without fetching unrelated parents", async () => {
        const context = new SpinalContext("Sensors", "context");
        fixture.register(context);
        const included = fixture.node("Included", "room");
        included.addContextId(context.getId().get());
        await included.addChildInContext(child, "hasSensor", "Ref", context);
        const noParentContext = fixture.node("No parent context", "room");
        await noParentContext.addChildInContext(
          child,
          "hasSensor",
          "Ref",
          context
        );
        const unrelated = fixture.node("Other relation", "room");
        await unrelated.addChild(child, "monitors", "PtrLst");
        const relation = unrelated.children
          .getElement("PtrLst")
          .getElement("monitors");
        relation.getParent = async () => {
          throw new Error("Must not fetch unrelated parent");
        };
        const response = await request(fixture.app)
          .get(path(kind))
          .query({
            contextDynamicId: context._server_id,
          })
          .expect(200);
        expect(response.body.total).to.equal(1);
        const item =
          kind === "parents"
            ? response.body.data[0]
            : response.body.data.Ref.hasSensor[0];
        expect(item.dynamicId).to.equal(included._server_id);
        expect(fixture.loads).not.to.include(unrelated._server_id);
        expect(fixture.loads).not.to.include(noParentContext._server_id);
        child.removeContextId(context.getId().get());
        const noChildContext = await request(fixture.app)
          .get(path(kind))
          .query({
            contextDynamicId: context._server_id,
          })
          .expect(200);
        expect(noChildContext.body.total).to.equal(0);
      });

      it("skips future relation pointers without loading them and warns, including explicit selection", async () => {
        const parent = fixture.node("Future parent", "room");
        await parent.addChild(child, "future", "Ref");
        const pointer = child.parents.getElement("future")[0];
        pointer.info.pointedType.set("LstPtrLst");
        pointer.load = async () => {
          throw new Error("Must not load unsupported relation");
        };
        const warnings: unknown[][] = [];
        const originalWarn = console.warn;
        console.warn = (...args: unknown[]) => {
          warnings.push(args);
        };
        try {
          for (const query of [{}, { relationType: "LstPtrLst" }]) {
            const response = await request(fixture.app)
              .get(path(kind))
              .query(query)
              .expect(200);
            expect(response.body.total).to.equal(0);
            expect(response.body.data).to.deep.equal(
              kind === "parents" ? [] : {}
            );
          }
          expect(warnings).to.have.length(2);
          for (const args of warnings)
            expect(args).to.deep.equal([
              `[listNodeRelations] Skipping unsupported relation type LstPtrLst on node ${child._server_id}`,
            ]);
        } finally {
          console.warn = originalWarn;
        }
      });

      it("paginates globally after filtering with a 200-item limit", async () => {
        const filtered = fixture.node("Excluded", "room");
        await filtered.addChild(child, "first", "Ref");
        for (let i = 0; i < 205; i++) {
          const parent = fixture.node(`Room ${i}`, "room");
          parent.info.add_attr("virtual", false);
          await parent.addChild(child, i < 100 ? "first" : "second", "Ref");
        }
        const response = await request(fixture.app)
          .get(path(kind))
          .query({
            offset: 3,
            "filter[info.virtual]": "false",
            info: "name",
          })
          .expect(200);
        expect(response.body.total).to.equal(200);
        const items =
          kind === "parents"
            ? response.body.data
            : Object.values(response.body.data.Ref).flat();
        expect(items).to.have.length(200);
        expect(items[0].info.name).to.equal("Room 3");
        expect(items[199].info.name).to.equal("Room 202");
        const end = await request(fixture.app)
          .get(path(kind))
          .query({
            offset: 203,
            "filter[info.virtual]": "false",
          })
          .expect(200);
        expect(end.body.total).to.equal(2);
      });

      it("returns empty results for no parents or no matching names", async () => {
        for (const query of [{}, { relationName: "missing" }]) {
          const response = await request(fixture.app)
            .get(path(kind))
            .query(query)
            .expect(200);
          expect(response.body.data).to.deep.equal(
            kind === "parents" ? [] : {}
          );
          expect(response.body.total).to.equal(0);
        }
      });

      it("rejects incoming names and types before loading their relation pointers", async () => {
        const parent = fixture.node("Room A", "room");
        await parent.addChild(child, "hasSensor", "Ref");
        const pointer = child.parents.getElement("hasSensor")[0];
        pointer.load = async () => {
          throw new Error("Must not load excluded relation");
        };
        for (const query of [
          { relationName: "missing,other" },
          { relationType: "PtrLst" },
        ]) {
          const response = await request(fixture.app)
            .get(path(kind))
            .query(query)
            .expect(200);
          expect(response.body.total).to.equal(0);
        }
      });

      it("rejects malformed queries, invalid nodes and non-context IDs", async () => {
        for (const query of [
          { relationType: "Invalid" },
          { relationName: "hasSensor,," },
          { offset: -1 },
          { offset: 1.5 },
          { contextDynamicId: 0 },
          { unknown: "x" },
          { "filter[info.name][unsupported]": "x" },
        ])
          await request(fixture.app).get(path(kind)).query(query).expect(400);
        await request(fixture.app)
          .get(path(kind))
          .query({ contextDynamicId: fixture.room._server_id })
          .expect(400);
        await request(fixture.app)
          .get(path(kind))
          .query({ contextDynamicId: 9999999 })
          .expect(400);
        for (const id of [0, 9999999])
          await request(fixture.app)
            .get(`/api/v2/node/${id}/${kind}`)
            .expect(400);
      });

      it("fails explicitly on denied parent access and pointer or parent traversal failures", async () => {
        const parent = fixture.node("Room A", "room");
        await parent.addChild(child, "hasSensor", "Ref");
        const original = fixture.middleware.load.bind(fixture.middleware);
        fixture.middleware.load = async (id, profile) => {
          if (id === parent._server_id) throw new Error("Denied");
          return original(id, profile);
        };
        await request(fixture.app).get(path(kind)).expect(400);
        fixture.middleware.load = original;
        const pointer = child.parents.getElement("hasSensor")[0];
        const relation = await pointer.load();
        const originalLoad = pointer.load.bind(pointer);
        pointer.load = async () => {
          throw new Error("private pointer failure");
        };
        const failedPointer = await request(fixture.app)
          .get(path(kind))
          .expect(500);
        expect(JSON.stringify(failedPointer.body)).not.to.include(
          "private pointer failure"
        );
        pointer.load = originalLoad;
        relation.getParent = async () => {
          throw new Error("private parent failure");
        };
        const failedParent = await request(fixture.app)
          .get(path(kind))
          .expect(500);
        expect(JSON.stringify(failedParent.body)).not.to.include(
          "private parent failure"
        );
      });
    });
  }
});
