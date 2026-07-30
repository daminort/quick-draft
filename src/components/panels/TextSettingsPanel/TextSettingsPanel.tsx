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

  const onXChange = (v: number) => updateShape(shape.id, { x: v });
  const onYChange = (v: number) => updateShape(shape.id, { y: v });
  const onToggleBold = () => updateShape(shape.id, { isBold: !shape.isBold });
  const onToggleItalic = () => updateShape(shape.id, { isItalic: !shape.isItalic });
  const onAlignLeftClick = () => updateShape(shape.id, { align: 'left' });
  const onAlignCenterClick = () => updateShape(shape.id, { align: 'center' });
  const onAlignRightClick = () => updateShape(shape.id, { align: 'right' });
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    updateShape(shape.id, { text: e.target.value });
  const onFontFamilyChange = (value: string) => updateShape(shape.id, { fontFamily: value });
  const onFontSizeChange = (value: number) => {
    if (value > 0) {
      updateShape(shape.id, { fontSize: value });
    }
  };
  const onFillColorChange = (value: string) => updateShape(shape.id, { fill: value });

  return (
    <Flex direction="column" gap="4">
      <Section title="Position">
        <Flex gap="3">
          <InlineField label="x" value={shape.x} onChange={onXChange} />
          <InlineField label="y" value={shape.y} onChange={onYChange} />
        </Flex>
      </Section>

      <Section title="Text">
        <Flex gap="1">
          <IconButton
            type="button"
            title="Bold"
            aria-label="Bold"
            aria-pressed={shape.isBold}
            onClick={onToggleBold}
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
            onClick={onToggleItalic}
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
            onClick={onAlignLeftClick}
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
            onClick={onAlignCenterClick}
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
            onClick={onAlignRightClick}
            variant="ghost"
            size="1"
            style={isAlignedRightStyle}
          >
            <AlignRight size={16} />
          </IconButton>
        </Flex>
        <TextArea value={shape.text} onChange={onTextChange} rows={2} style={textAreaStyle} />
      </Section>

      <Section title="Font">
        <Flex gap="2" align="center">
          <Select.Root value={shape.fontFamily} onValueChange={onFontFamilyChange}>
            <Select.Trigger />
            <Select.Content>
              {FONT_FAMILIES.map(font => (
                <Select.Item key={font} value={font}>
                  {font}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <CompactNumberInput value={shape.fontSize} min={1} onChange={onFontSizeChange} />
          <ColorInput value={shape.fill} onChange={onFillColorChange} />
        </Flex>
      </Section>
    </Flex>
  );
}
