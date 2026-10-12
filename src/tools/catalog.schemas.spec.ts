import {
  catalogDefinitions,
  getCodingLabInputSchema,
  getWorkshopInputSchema,
  listWorkshopsInputSchema,
  getWorkshopOutputSchema,
} from './catalog.schemas';

describe('Catalog input and output contracts', () => {
  it.each(['', '   ', 'x'.repeat(121)])(
    'rejects invalid section %p',
    (sectionId) => {
      expect(listWorkshopsInputSchema.safeParse({ sectionId }).success).toBe(
        false
      );
    }
  );
  it('rejects unknown arguments for all tools', () => {
    for (const definition of Object.values(catalogDefinitions))
      expect(
        definition.inputSchema.safeParse({
          sectionId: 'angular',
          workshopId: 'w',
          labId: '0123456789abcdef01234567',
          extra: true,
        }).success
      ).toBe(false);
  });
  it('requires a section for detail rather than inventing global lookup', () => {
    expect(getWorkshopInputSchema.safeParse({ workshopId: 'w' }).success).toBe(
      false
    );
  });
  it.each(['bad', 'f'.repeat(23), 'f'.repeat(25), '../secret'])(
    'rejects invalid lab/version identifier %p',
    (id) => {
      expect(getCodingLabInputSchema.safeParse({ labId: id }).success).toBe(
        false
      );
      expect(
        getCodingLabInputSchema.safeParse({
          labId: '0123456789abcdef01234567',
          versionId: id,
        }).success
      ).toBe(false);
    }
  );
  it('requires external references for lab and assessment outline entries', () => {
    expect(
      getWorkshopOutputSchema.safeParse({
        workshop: {
          id: 'w',
          sectionId: 's',
          title: '',
          summary: '',
          level: 1,
          outline: [{ id: 'e', title: '', kind: 'CODING_LAB' }],
        },
      }).success
    ).toBe(false);
  });
});
