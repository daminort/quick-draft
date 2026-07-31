import type { TShape } from '~/types/document';

type TTextSettingsPanelProps = {
  shape: Extract<TShape, { type: 'text' }>;
};

export type { TTextSettingsPanelProps };
