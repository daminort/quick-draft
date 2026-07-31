import type { TShape } from '~/types/document';

type TDimensionSettingsPanelProps = {
  shape: Extract<TShape, { type: 'dimension' }>;
};

export type { TDimensionSettingsPanelProps };
