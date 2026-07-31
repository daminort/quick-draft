import type { TShape } from '~/types/document';

type TArcSettingsPanelProps = {
  shape: Extract<TShape, { type: 'arc' }>;
};

export type { TArcSettingsPanelProps };
