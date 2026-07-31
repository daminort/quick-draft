import type { ChangeEvent } from 'react';

import { Box, Checkbox, Flex, Slider, Text, TextField } from '@radix-ui/themes';

import s from './PanelFields.module.css';

import type {
  TSectionProps,
  TCompactNumberInputProps,
  TInlineFieldProps,
  TLabeledRowProps,
  TColorInputProps,
  TStrokeSectionProps,
  TFillSectionProps,
} from './PanelFields.props';

function Section({ title, children }: TSectionProps) {
  return (
    <Flex direction="column" gap="2">
      <Text as="div" size="2" className={s.sectionTitle}>
        {title}
      </Text>
      {children}
    </Flex>
  );
}

function CompactNumberInput({ value, min, onChange }: TCompactNumberInputProps) {
  function onFieldChange(e: ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) {
      onChange(next);
    }
  }

  return <TextField.Root type="number" min={min} value={value} onChange={onFieldChange} />;
}

function InlineField({ label, value, min, onChange }: TInlineFieldProps) {
  return (
    <Flex align="center" gap="1" flexGrow="1">
      <Text as="label" size="2">
        {label}:
      </Text>
      <CompactNumberInput value={value} min={min} onChange={onChange} />
    </Flex>
  );
}

/** The label has a fixed width so inputs in stacked rows (Start/End, …) line up vertically. */
function LabeledRow({ label, children }: TLabeledRowProps) {
  return (
    <Flex align="center" gap="2">
      <Text as="div" size="2" className={s.rowLabel}>
        {label}:
      </Text>
      <Flex align="center" gap="2" flexGrow="1">
        {children}
      </Flex>
    </Flex>
  );
}

function ColorInput({ value, onChange }: TColorInputProps) {
  function onColorChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  return (
    <Box>
      <input type="color" value={value} onChange={onColorChange} />
    </Box>
  );
}

function StrokeSection({ style, onChange }: TStrokeSectionProps) {
  const onStrokeWidthChange = (value: number) => {
    if (value > 0) {
      onChange({ ...style, strokeWidth: value });
    }
  };
  const onStrokeColorChange = (value: string) => onChange({ ...style, stroke: value });

  return (
    <Section title="Stroke">
      <LabeledRow label="Width">
        <CompactNumberInput value={style.strokeWidth} min={1} onChange={onStrokeWidthChange} />
        <ColorInput value={style.stroke} onChange={onStrokeColorChange} />
      </LabeledRow>
    </Section>
  );
}

function FillSection({ style, onChange }: TFillSectionProps) {
  const enabled = style.fill !== undefined;
  const fillColor = style.fill ?? '#ffffff';
  const fillOpacity = style.fillOpacity ?? 1;

  const onFillEnabledChange = (checked: boolean) =>
    onChange({ ...style, fill: checked ? fillColor : undefined });
  const onFillColorChange = (value: string) => onChange({ ...style, fill: value });
  const onFillOpacityChange = ([value]: number[]) => onChange({ ...style, fillOpacity: value });

  return (
    <Flex direction="column" gap="2">
      <Text as="label" size="2" className={s.sectionTitle}>
        <Flex align="center" gap="2">
          <Checkbox checked={enabled} onCheckedChange={onFillEnabledChange} />
          Fill
        </Flex>
      </Text>
      {enabled && (
        <>
          <LabeledRow label="Color">
            <ColorInput value={fillColor} onChange={onFillColorChange} />
          </LabeledRow>
          <LabeledRow label="Opacity">
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[fillOpacity]}
              onValueChange={onFillOpacityChange}
            />
          </LabeledRow>
        </>
      )}
    </Flex>
  );
}

export {
  Section,
  CompactNumberInput,
  InlineField,
  LabeledRow,
  ColorInput,
  StrokeSection,
  FillSection,
};
