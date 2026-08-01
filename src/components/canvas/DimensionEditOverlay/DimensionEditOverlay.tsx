import type { CSSProperties, KeyboardEvent } from 'react';
import { useEffect, useRef } from 'react';

import { EDIT_OVERLAY_PADDING_PX } from '~/constants/canvas';

import s from './DimensionEditOverlay.module.css';

import type { TDimensionEditOverlayProps } from './DimensionEditOverlay.props';

const ALIGN_TRANSFORM: Record<TDimensionEditOverlayProps['align'], string> = {
  start: '0%',
  center: '-50%',
  end: '-100%',
};

const BASELINE_TRANSFORM: Record<TDimensionEditOverlayProps['baseline'], string> = {
  top: '0%',
  bottom: '-100%',
};

const DimensionEditOverlay = ({
  initialValue,
  x,
  y,
  align,
  baseline,
  scale,
  offsetX,
  offsetY,
  fontSize,
  color,
  onCommit,
  onCancel,
}: TDimensionEditOverlayProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Seeded once on mount, same as TextEditOverlay: the value only needs to be applied on commit,
  // not tracked on every keystroke.
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.textContent = initialValue;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = () => onCommit(ref.current?.textContent ?? '');
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  const overlayStyle = {
    '--overlay-left': `${offsetX + x * scale}px`,
    '--overlay-top': `${offsetY + y * scale}px`,
    '--overlay-transform': `translate(${ALIGN_TRANSFORM[align]}, ${BASELINE_TRANSFORM[baseline]})`,
    '--overlay-padding': `${EDIT_OVERLAY_PADDING_PX}px`,
    '--overlay-font-size': `${fontSize * scale}px`,
    '--overlay-color': color,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={s.overlay}
      style={overlayStyle}
    />
  );
};

export { DimensionEditOverlay };
