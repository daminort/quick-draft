import type { TDocument } from '~/types/document';

/** Font choices offered in the text shape's font-family dropdown. Used in: components/panels/TextPanel.tsx */
export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
];

/** Measurement unit choices offered in the document's units dropdown. Used in: components/panels/UnitsControl.tsx */
export const UNIT_OPTIONS: TDocument['units'][] = ['mm', 'cm', 'm'];
