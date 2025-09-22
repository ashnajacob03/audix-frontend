// Lightweight IndexedDB wrapper for offline song storage
// Stores: audio Blob, basic song metadata

export type OfflineSongMeta = {
  id: string; // song _id
  title: string;
  artist?: string;
  coverUrl?: string;
  durationMs?: number;
  mimeType?: string;
  downloadedAt: number;
};

export type OfflineSongRecord = OfflineSongMeta & {
  blob: Blob;
};

const DB_NAME = 'audix_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'songs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineSong(record: OfflineSongRecord): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getOfflineSong(id: string): Promise<OfflineSongRecord | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as OfflineSongRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function listOfflineSongs(): Promise<OfflineSongMeta[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const songs: OfflineSongMeta[] = [];
    const req = store.openCursor(undefined, 'prev');
    req.onsuccess = () => {
      const cursor = req.result as IDBCursorWithValue | null;
      if (cursor) {
        const value = cursor.value as OfflineSongRecord;
        songs.push({
          id: value.id,
          title: value.title,
          artist: value.artist,
          coverUrl: value.coverUrl,
          durationMs: value.durationMs,
          mimeType: value.mimeType,
          downloadedAt: value.downloadedAt,
        });
        cursor.continue();
      } else {
        resolve(songs);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOfflineSong(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function hasOfflineSong(id: string): Promise<boolean> {
  const rec = await getOfflineSong(id);
  return !!rec;
}


