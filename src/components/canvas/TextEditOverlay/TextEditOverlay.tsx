import type { CSSProperties, FormEvent, KeyboardEvent } from 'react';
import { useCallback, useState } from 'react';

import { EDIT_OVERLAY_PADDING_PX } from '~/constants/canvas';

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
  // Frozen at mount, rendered as the div's children below so the current text is there from the
  // very first paint — no imperative step has to race a browser render. `shape.text` itself
  // changes on every keystroke (onInput writes straight back to the document), so the frozen copy
  // is what's rendered, not the live prop: re-rendering with the live value would fight the user's
  // typing and caret position.
  const [seedText] = useState(() => shape.text);

  const setRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) {
      return;
    }
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
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
    '--overlay-left': `${offsetX + shape.x * scale - EDIT_OVERLAY_PADDING_PX}px`,
    '--overlay-top': `${offsetY + shape.y * scale - EDIT_OVERLAY_PADDING_PX}px`,
    '--overlay-padding': `${EDIT_OVERLAY_PADDING_PX}px`,
    '--overlay-font-family': shape.fontFamily,
    '--overlay-font-size': `${shape.fontSize * scale}px`,
    '--overlay-font-weight': shape.isBold ? 'bold' : 'normal',
    '--overlay-font-style': fontStyle,
    '--overlay-text-align': shape.align,
    '--overlay-color': shape.fill,
  } as CSSProperties;

  return (
    <div
      ref={setRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onInput={onInput}
      onBlur={onCommit}
      onKeyDown={onKeyDown}
      className={s.overlay}
      style={overlayStyle}
    >
      {seedText}
    </div>
  );
};

export { TextEditOverlay };
