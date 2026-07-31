import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TSelectionTransformerProps = {
  shape: TShape | null;
  node: Konva.Node | null;
};

export type { TSelectionTransformerProps };
