import type { TShape } from '~/types/document';

type TCircleSettingsPanelProps = {
  shape: Extract<TShape, { type: 'circle' }>;
};

export type { TCircleSettingsPanelProps };
