import type { ReactNode } from 'react'
import { Box, Checkbox, Flex, Slider, Text, TextField } from '@radix-ui/themes'
import type { Style } from '~/types/document'

/** Weight for section titles — only labels wrapped in `**` in .ai/TODO.md are bold. */
export const LABEL_WEIGHT = { fontWeight: 600 } as const

interface SectionProps {
  title: string
  children: ReactNode
}

export function Section({ title, children }: SectionProps) {
  return (
    <Flex direction="column" gap="2">
      <Text as="div" size="2" style={LABEL_WEIGHT}>
        {title}
      </Text>
      {children}
    </Flex>
  )
}

interface CompactNumberInputProps {
  value: number
  min?: number
  onChange: (value: number) => void
}

export function CompactNumberInput({ value, min, onChange }: CompactNumberInputProps) {
  return (
    <TextField.Root
      type="number"
      min={min}
      value={value}
      onChange={(e) => {
        const next = Number(e.target.value)
        if (Number.isFinite(next)) onChange(next)
      }}
    />
  )
}

interface InlineFieldProps {
  label: string
  value: number
  min?: number
  onChange: (value: number) => void
}

/** Renders `label: [ input ]` inline, e.g. paired "x: [ ]  y: [ ]" fields. */
export function InlineField({ label, value, min, onChange }: InlineFieldProps) {
  return (
    <Flex align="center" gap="1" flexGrow="1">
      <Text as="label" size="2">
        {label}:
      </Text>
      <CompactNumberInput value={value} min={min} onChange={onChange} />
    </Flex>
  )
}

interface LabeledRowProps {
  label: string
  children: ReactNode
}

/**
 * Renders `label: input input…` inline on one row, e.g. "Start: [X] [Y]".
 * The label has a fixed width so inputs in stacked rows (Start/End, …) line up vertically.
 */
export function LabeledRow({ label, children }: LabeledRowProps) {
  return (
    <Flex align="center" gap="2">
      <Text as="div" size="2" style={{ width: '56px', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {label}:
      </Text>
      <Flex align="center" gap="2" flexGrow="1">
        {children}
      </Flex>
    </Flex>
  )
}

export function ColorInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Box>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </Box>
  )
}

interface StrokeSectionProps {
  style: Style
  onChange: (style: Style) => void
}

export function StrokeSection({ style, onChange }: StrokeSectionProps) {
  return (
    <Section title="Stroke">
      <LabeledRow label="Width">
        <CompactNumberInput
          value={style.strokeWidth}
          min={1}
          onChange={(value) => {
            if (value > 0) onChange({ ...style, strokeWidth: value })
          }}
        />
        <ColorInput value={style.stroke} onChange={(value) => onChange({ ...style, stroke: value })} />
      </LabeledRow>
    </Section>
  )
}

interface FillSectionProps {
  style: Style
  onChange: (style: Style) => void
}

export function FillSection({ style, onChange }: FillSectionProps) {
  const enabled = style.fill !== undefined

  return (
    <Flex direction="column" gap="2">
      <Text as="label" size="2" style={LABEL_WEIGHT}>
        <Flex align="center" gap="2">
          <Checkbox
            checked={enabled}
            onCheckedChange={(checked) =>
              onChange({ ...style, fill: checked ? (style.fill ?? '#ffffff') : undefined })
            }
          />
          Fill
        </Flex>
      </Text>
      {enabled && (
        <>
          <LabeledRow label="Color">
            <ColorInput
              value={style.fill ?? '#ffffff'}
              onChange={(value) => onChange({ ...style, fill: value })}
            />
          </LabeledRow>
          <LabeledRow label="Opacity">
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[style.fillOpacity ?? 1]}
              onValueChange={([value]) => onChange({ ...style, fillOpacity: value })}
            />
          </LabeledRow>
        </>
      )}
    </Flex>
  )
}
