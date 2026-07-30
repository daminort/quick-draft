import { create } from 'zustand';
import { temporal } from 'zundo';

import type { TDocument } from '~/types/document';

import { AUTOSAVE_DEBOUNCE_MS } from '~/constants/persistence';

import { saveCurrentDocument } from '~/lib/persistence/indexedDb';

import type { TDocumentState } from './types';

const initialDocument: TDocument = {
  shapes: [],
  components: {},
  units: 'mm',
  scale: 1,
};

export const documentStore = create<TDocumentState>()(
  temporal(() => ({
    document: initialDocument,
  })),
);

let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
documentStore.subscribe(state => {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
  }
  autosaveTimer = setTimeout(() => {
    void saveCurrentDocument(state.document);
  }, AUTOSAVE_DEBOUNCE_MS);
});
