import type { TDocument } from '~/types/document';

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
];

const UNIT_OPTIONS: TDocument['units'][] = ['mm', 'cm', 'm'];

export { FONT_FAMILIES, UNIT_OPTIONS };
