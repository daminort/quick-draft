import { Flex, IconButton, Select, TextArea } from '@radix-ui/themes';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

import { FONT_FAMILIES } from '~/constants/ui';

import { documentActions } from '~/stores/documentStore';

import {
  Section,
  InlineField,
  CompactNumberInput,
  ColorInput,
} from '~/components/panels/shared/PanelFields';

import s from './TextSettingsPanel.module.css';

import type { TTextSettingsPanelProps } from './TextSettingsPanel.props';

function TextSettingsPanel({ shape }: TTextSettingsPanelProps) {
  const isBoldClassName = shape.isBold ? s.active : undefined;
  const isItalicClassName = shape.isItalic ? s.active : undefined;
  const isAlignedLeftClassName = shape.align === 'left' ? s.active : undefined;
  const isAlignedCenterClassName = shape.align === 'center' ? s.active : undefined;
  const isAlignedRightClassName = shape.align === 'right' ? s.active : undefined;

  const onXChange = (v: number) => documentActions.updateShape(shape.id, { x: v });
  const onYChange = (v: number) => documentActions.updateShape(shape.id, { y: v });
  const onToggleBold = () => documentActions.updateShape(shape.id, { isBold: !shape.isBold });
  const onToggleItalic = () => documentActions.updateShape(shape.id, { isItalic: !shape.isItalic });
  const onAlignLeftClick = () => documentActions.updateShape(shape.id, { align: 'left' });
  const onAlignCenterClick = () => documentActions.updateShape(shape.id, { align: 'center' });
  const onAlignRightClick = () => documentActions.updateShape(shape.id, { align: 'right' });
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    documentActions.updateShape(shape.id, { text: e.target.value });
  const onFontFamilyChange = (value: string) =>
    documentActions.updateShape(shape.id, { fontFamily: value });
  const onFontSizeChange = (value: number) => {
    if (value > 0) {
      documentActions.updateShape(shape.id, { fontSize: value });
    }
  };
  const onFillColorChange = (value: string) =>
    documentActions.updateShape(shape.id, { fill: value });

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
            className={isBoldClassName}
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
            className={isItalicClassName}
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
            className={isAlignedLeftClassName}
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
            className={isAlignedCenterClassName}
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
            className={isAlignedRightClassName}
          >
            <AlignRight size={16} />
          </IconButton>
        </Flex>
        <TextArea value={shape.text} onChange={onTextChange} rows={2} className={s.textArea} />
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

export { TextSettingsPanel };
