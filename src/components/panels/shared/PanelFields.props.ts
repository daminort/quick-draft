import type { ReactNode } from 'react';

import type { TStyle } from '~/types/document';

type TSectionProps = {
  title: string;
  children: ReactNode;
};

type TCompactNumberInputProps = {
  value: number;
  min?: number;
  onChange: (value: number) => void;
};

type TInlineFieldProps = {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
};

type TLabeledRowProps = {
  label: string;
  children: ReactNode;
};

type TColorInputProps = {
  value: string;
  onChange: (value: string) => void;
};

type TStrokeSectionProps = {
  style: TStyle;
  onChange: (style: TStyle) => void;
};

type TFillSectionProps = {
  style: TStyle;
  onChange: (style: TStyle) => void;
};

export type {
  TSectionProps,
  TCompactNumberInputProps,
  TInlineFieldProps,
  TLabeledRowProps,
  TColorInputProps,
  TStrokeSectionProps,
  TFillSectionProps,
};
