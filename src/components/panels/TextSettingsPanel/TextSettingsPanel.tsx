import { Flex, IconButton, Select, TextArea } from '@radix-ui/themes';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

import type { TShape } from '~/types/document';

import { FONT_FAMILIES } from '~/constants/ui';

import { useDocumentStore } from '~/stores/useDocumentStore';

import {
  Section,
  InlineField,
  CompactNumberInput,
  ColorInput,
} from '~/components/panels/shared/PanelFields';

type TTextSettingsPanelProps = {
  shape: Extract<TShape, { type: 'text' }>;
};

// Keep `variant="ghost"` at all times (see Toolbar.tsx for why switching to `soft` on activation
// shifts the button) and fake the active look with a plain background instead.
const ACTIVE_TEXT_BUTTON_STYLE = { backgroundColor: 'var(--accent-a3)' };

export function TextSettingsPanel({ shape }: TTextSettingsPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  const isBoldStyle = shape.isBold ? ACTIVE_TEXT_BUTTON_STYLE : undefined;
  const isItalicStyle = shape.isItalic ? ACTIVE_TEXT_BUTTON_STYLE : undefined;
  const isAlignedLeftStyle = shape.align === 'left' ? ACTIVE_TEXT_BUTTON_STYLE : undefined;
  const isAlignedCenterStyle = shape.align === 'center' ? ACTIVE_TEXT_BUTTON_STYLE : undefined;
  const isAlignedRightStyle = shape.align === 'right' ? ACTIVE_TEXT_BUTTON_STYLE : undefined;
  const textAreaStyle = { resize: 'vertical' as const };

  return (
    <Flex direction="column" gap="4">
      <Section title="Position">
        <Flex gap="3">
          <InlineField label="x" value={shape.x} onChange={v => updateShape(shape.id, { x: v })} />
          <InlineField label="y" value={shape.y} onChange={v => updateShape(shape.id, { y: v })} />
        </Flex>
      </Section>

      <Section title="Text">
        <Flex gap="1">
          <IconButton
            type="button"
            title="Bold"
            aria-label="Bold"
            aria-pressed={shape.isBold}
            onClick={() => updateShape(shape.id, { isBold: !shape.isBold })}
            variant="ghost"
            size="1"
            style={isBoldStyle}
          >
            <Bold size={16} />
          </IconButton>
          <IconButton
            type="button"
            title="Italic"
            aria-label="Italic"
            aria-pressed={shape.isItalic}
            onClick={() => updateShape(shape.id, { isItalic: !shape.isItalic })}
            variant="ghost"
            size="1"
            style={isItalicStyle}
          >
            <Italic size={16} />
          </IconButton>
          <IconButton
            type="button"
            title="Align left"
            aria-label="Align left"
            aria-pressed={shape.align === 'left'}
            onClick={() => updateShape(shape.id, { align: 'left' })}
            variant="ghost"
            size="1"
            style={isAlignedLeftStyle}
          >
            <AlignLeft size={16} />
          </IconButton>
          <IconButton
            type="button"
            title="Align center"
            aria-label="Align center"
            aria-pressed={shape.align === 'center'}
            onClick={() => updateShape(shape.id, { align: 'center' })}
            variant="ghost"
            size="1"
            style={isAlignedCenterStyle}
          >
            <AlignCenter size={16} />
          </IconButton>
          <IconButton
            type="button"
            title="Align right"
            aria-label="Align right"
            aria-pressed={shape.align === 'right'}
            onClick={() => updateShape(shape.id, { align: 'right' })}
            variant="ghost"
            size="1"
            style={isAlignedRightStyle}
          >
            <AlignRight size={16} />
          </IconButton>
        </Flex>
        <TextArea
          value={shape.text}
          onChange={e => updateShape(shape.id, { text: e.target.value })}
          rows={2}
          style={textAreaStyle}
        />
      </Section>

      <Section title="Font">
        <Flex gap="2" align="center">
          <Select.Root
            value={shape.fontFamily}
            onValueChange={value => updateShape(shape.id, { fontFamily: value })}
          >
            <Select.Trigger />
            <Select.Content>
              {FONT_FAMILIES.map(font => (
                <Select.Item key={font} value={font}>
                  {font}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <CompactNumberInput
            value={shape.fontSize}
            min={1}
            onChange={value => {
              if (value > 0) {
                updateShape(shape.id, { fontSize: value });
              }
            }}
          />
          <ColorInput
            value={shape.fill}
            onChange={value => updateShape(shape.id, { fill: value })}
          />
        </Flex>
      </Section>
    </Flex>
  );
}
