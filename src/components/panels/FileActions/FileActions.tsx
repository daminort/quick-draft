import { useRef } from 'react';
import type { ChangeEvent } from 'react';

import { IconButton } from '@radix-ui/themes';
import { Save, FolderOpen } from 'lucide-react';

import { exportDocumentToJsonFile, importDocumentFromJsonFile } from '~/lib/persistence/fileIO';

import { documentStore, documentSelectors, documentActions } from '~/stores/documentStore';

import s from './FileActions.module.css';

const FileActions = () => {
  const documentState = documentStore(documentSelectors.getDocument);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSaveClick = () => {
    exportDocumentToJsonFile(documentState);
  };

  const onOpenClick = () => {
    inputRef.current?.click();
  };

  const onOpen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    try {
      const doc = await importDocumentFromJsonFile(file);
      documentActions.loadDocument(doc);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to open the file.');
    }
  };

  return (
    <>
      <IconButton
        type="button"
        title="Save as JSON"
        aria-label="Save as JSON"
        onClick={onSaveClick}
        variant="ghost"
        size="3"
      >
        <Save size={20} />
      </IconButton>
      <IconButton
        type="button"
        title="Open JSON"
        aria-label="Open JSON"
        onClick={onOpenClick}
        variant="ghost"
        size="3"
      >
        <FolderOpen size={20} />
      </IconButton>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        onChange={onOpen}
        className={s.hiddenInput}
      />
    </>
  );
};

export { FileActions };
