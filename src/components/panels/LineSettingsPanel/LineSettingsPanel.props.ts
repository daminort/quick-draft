import type { TShape } from '~/types/document';

type TLineSettingsPanelProps = {
  shape: Extract<TShape, { type: 'line' }>;
};

export type { TLineSettingsPanelProps };
