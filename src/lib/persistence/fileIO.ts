import type { TComponentDef, TDocument } from '~/types/document';

import { DEFAULT_DOCUMENT_FILENAME, DEFAULT_COMPONENT_LIBRARY_FILENAME } from '~/constants/fileIO';

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportDocumentToJsonFile(doc: TDocument): void {
  const json = JSON.stringify(doc, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), DEFAULT_DOCUMENT_FILENAME);
}

function isDocumentShape(value: unknown): value is TDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.shapes) &&
    typeof candidate.components === 'object' &&
    candidate.components !== null &&
    typeof candidate.units === 'string' &&
    typeof candidate.scale === 'number'
  );
}

function parseJsonFile(file: File): Promise<unknown> {
  return file.text().then(text => {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`"${file.name}" is not valid JSON.`);
    }
  });
}

export async function importDocumentFromJsonFile(file: File): Promise<TDocument> {
  const parsed = await parseJsonFile(file);
  if (!isDocumentShape(parsed)) {
    throw new Error(
      `"${file.name}" doesn't look like a QuickDraft document (missing shapes/components/units/scale).`,
    );
  }
  return parsed;
}

export function exportComponentLibraryToJsonFile(components: Record<string, TComponentDef>): void {
  const json = JSON.stringify(components, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), DEFAULT_COMPONENT_LIBRARY_FILENAME);
}

function isComponentDef(value: unknown): value is TComponentDef {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.shapes)
  );
}

export async function importComponentLibraryFromJsonFile(file: File): Promise<TComponentDef[]> {
  const parsed = await parseJsonFile(file);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`"${file.name}" doesn't look like a component library file.`);
  }
  const defs = Object.values(parsed as Record<string, unknown>);
  if (defs.length === 0 || !defs.every(isComponentDef)) {
    throw new Error(`"${file.name}" doesn't look like a component library file.`);
  }
  return defs;
}
