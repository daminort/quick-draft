import type { TShape } from '~/types/document';

type TRectSettingsPanelProps = {
  shape: Extract<TShape, { type: 'rect' }>;
};

export type { TRectSettingsPanelProps };
