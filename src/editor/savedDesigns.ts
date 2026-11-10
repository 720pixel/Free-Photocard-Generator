"use client";

import type { EditorDoc } from "./types";

// Saved designs stay in this browser (IndexedDB), so saving needs no account
// and works offline. Records hold the full design including embedded photos.
const DB_NAME = "photocard-designs";
const STORE = "designs";
export const DESIGNS_CHANGED = "pc:designs-changed";

export interface SavedDesign {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  design: EditorDoc;
  thumbnail: Blob | null;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

function announce() {
  window.dispatchEvent(new Event(DESIGNS_CHANGED));
}

export async function listDesigns(): Promise<SavedDesign[]> {
  const all = await withStore<SavedDesign[]>("readonly", (s) => s.getAll() as IDBRequest<SavedDesign[]>);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDesign(id: string): Promise<SavedDesign | null> {
  const row = await withStore<SavedDesign | undefined>("readonly", (s) => s.get(id) as IDBRequest<SavedDesign | undefined>);
  return row ?? null;
}

export async function saveDesign(name: string, design: EditorDoc, thumbnail: Blob | null): Promise<string> {
  const now = Date.now();
  const record: SavedDesign = {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    design: structuredClone(design),
    thumbnail,
  };
  await withStore("readwrite", (s) => s.put(record));
  announce();
  return record.id;
}

export async function deleteDesign(id: string): Promise<void> {
  await withStore("readwrite", (s) => s.delete(id));
  announce();
}
