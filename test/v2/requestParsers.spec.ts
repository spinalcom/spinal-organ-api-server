import { expect } from 'chai';
import { z } from 'zod';
import { parseInfoQuery } from '../../src/utilities/v2/requestParse/parseInfoQuery';
import { parseAttributesQuery } from '../../src/utilities/v2/requestParse/parseAttributesQuery';
import { addExtraInfoValidation } from '../../src/utilities/v2/requestParse/addExtraInfoValidation';
import {
  addExtraAttrValidation, addExtraCatAttrValidation,
} from '../../src/utilities/v2/requestParse/addExtraAttrValidation';

describe('v2 info and attributes query parsers', () => {
  it('returns default info fields only when omitted', () => {
    const defaults = ['staticId', 'name', 'type', 'color', 'icon', 'virtual', 'bimFileId', 'dbid'];
    expect(parseInfoQuery()).to.deep.equal(defaults);
  });

  it('selects no info fields for explicit false', () => {
    for (const value of ['false', ' FALSE ']) {
      expect(parseInfoQuery(value)).to.deep.equal([]);
    }
  });

  it('selects all info for true or an empty string', () => {
    for (const value of ['', ' ', 'true', ' TRUE ']) {
      expect(parseInfoQuery(value)).to.equal(true);
    }
  });

  it('trims info field lists, drops empty entries and aliases id', () => {
    expect(parseInfoQuery(' ID, name, , virtual ')).to.deep.equal(['staticId', 'name', 'virtual']);
    expect(parseInfoQuery(' , , ')).to.deep.equal([]);
  });

  it('defaults to no attributes and parses boolean flags', () => {
    expect(parseAttributesQuery()).to.equal(false);
    expect(parseAttributesQuery('false')).to.equal(false);
    expect(parseAttributesQuery('true')).to.equal(true);
  });

  it('selects categories and individual attributes with whitespace', () => {
    expect(parseAttributesQuery(' Geometry / Surface , Geometry/Code, Spatial ')).to.deep.equal({
      Geometry: ['Surface', 'Code'], Spatial: true,
    });
    expect(parseAttributesQuery('Geometry/Surface,Geometry')).to.deep.equal({ Geometry: true });
    expect(parseAttributesQuery('Geometry,Geometry/Surface')).to.deep.equal({ Geometry: true });
    expect(parseAttributesQuery(' , , ')).to.deep.equal({});
  });

  it('rejects non-string attribute parameters', () => {
    // Exercise the runtime guard against unvalidated request input.
    for (const value of [true, 12, {}, []]) {
      try {
        Reflect.apply(parseAttributesQuery, undefined, [value]);
        expect.fail('Expected INVALID_REQUEST');
      } catch (error) {
        expect(error).to.have.property('errorType', 'INVALID_REQUEST');
      }
    }
  });
});

describe('v2 extra info and attribute validation', () => {
  const infoSchema = addExtraInfoValidation(z.object({ name: z.string() }), ['id', 'type']);
  const attributeSchema = addExtraAttrValidation(z.object({ area: z.string().optional() }));
  const categoriesSchema = addExtraCatAttrValidation(z.object({ Spatial: attributeSchema.optional() }));

  it('preserves additional scalar info fields and undefined values', () => {
    const info = { name: 'Room', code: '001', flag: false, count: 0, optional: undefined };
    expect(infoSchema.parse(info)).to.deep.equal(info);
  });

  it('reports forbidden keys at their field paths', () => {
    for (const key of ['id', 'type']) {
      const parsed = infoSchema.safeParse({ name: 'Room', [key]: 'forbidden' });
      expect(parsed.success).to.equal(false);
      if (!parsed.success) expect(parsed.error.issues[0].path).to.deep.equal([key]);
    }
  });

  it('accepts nested objects and arrays while rejecting null extra info', () => {
    for (const value of [[], {}, { values: [false, 0, { $modelRef: 123 }] }]) {
      expect(infoSchema.safeParse({ name: 'Room', extra: value }).success).to.equal(true);
    }
    for (const value of [null, { invalid: null }]) {
      expect(infoSchema.safeParse({ name: 'Room', extra: value }).success).to.equal(false);
    }
  });

  it('rejects underscore-prefixed info keys at every nesting level', () => {
    for (const key of ['_', '_custom', '_server_id', '_attribute_names']) {
      for (const extra of [
        { [key]: 'invalid' },
        { nested: { [key]: 'invalid' } },
        { samples: [{ [key]: 'invalid' }] },
      ]) {
        expect(infoSchema.safeParse({ name: 'Room', ...extra }).success).to.equal(false);
      }
    }
  });

  it('allows new categories and string attributes without dropping them', () => {
    const attrs = { Spatial: { area: '42', custom: '' }, Geometry: { Surface: '25' } };
    expect(categoriesSchema.parse(attrs)).to.deep.equal(attrs);
  });

  it('rejects non-string attributes and invalid category shapes', () => {
    for (const value of [
      { Spatial: { area: 42 } }, { Spatial: { custom: false } },
      { Geometry: { Surface: 25 } }, { Geometry: null }, { Geometry: [] },
    ]) {
      expect(categoriesSchema.safeParse(value).success).to.equal(false);
    }
  });
});
