import type { TShape } from '~/types/document';

type TNumberFieldProps = {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
};

type TGeometryFieldsProps = {
  shape: Extract<TShape, { type: 'guide' | 'component-instance' }>;
};

type TGeometryPanelProps = {
  shape: Extract<TShape, { type: 'guide' | 'component-instance' }>;
};

export type { TNumberFieldProps, TGeometryFieldsProps, TGeometryPanelProps };
