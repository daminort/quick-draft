import type { CSSProperties, FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef } from 'react';

import { TEXT_EDIT_OVERLAY_PADDING_PX } from '~/constants/canvas';

import s from './TextEditOverlay.module.css';

import type { TTextEditOverlayProps } from './TextEditOverlay.props';

const TextEditOverlay = ({
  shape,
  scale,
  offsetX,
  offsetY,
  onChange,
  onCommit,
  onCancel,
}: TTextEditOverlayProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Seeded once on mount so re-renders triggered by our own onChange calls don't reset the
  // caret position while the user is typing.
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.textContent = shape.text;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontStyle =
    [shape.isBold && 'bold', shape.isItalic && 'italic'].filter(Boolean).join(' ') || 'normal';

  const onInput = (e: FormEvent<HTMLDivElement>) => onChange(e.currentTarget.textContent ?? '');
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCommit();
    }
  };

  const overlayStyle = {
    '--overlay-left': `${offsetX + shape.x * scale - TEXT_EDIT_OVERLAY_PADDING_PX}px`,
    '--overlay-top': `${offsetY + shape.y * scale - TEXT_EDIT_OVERLAY_PADDING_PX}px`,
    '--overlay-padding': `${TEXT_EDIT_OVERLAY_PADDING_PX}px`,
    '--overlay-font-family': shape.fontFamily,
    '--overlay-font-size': `${shape.fontSize * scale}px`,
    '--overlay-font-weight': shape.isBold ? 'bold' : 'normal',
    '--overlay-font-style': fontStyle,
    '--overlay-text-align': shape.align,
    '--overlay-color': shape.fill,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onInput={onInput}
      onBlur={onCommit}
      onKeyDown={onKeyDown}
      className={s.overlay}
      style={overlayStyle}
    />
  );
};

export { TextEditOverlay };
