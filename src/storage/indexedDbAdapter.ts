/**
 * IndexedDB 适配器（在线版 / 安装后的 App / Capacitor 主路径）
 *
 * 相比 localStorage 的优势：
 *   - 容量大得多（数百 MB 级），不会因题库/作答历史增长触碰 5MB 瓶颈
 *   - 异步写入，不阻塞主线程
 *
 * 兼容性处理：
 *   - file:// 下不会被选用（见 index.ts），因此这里不需要考虑 opaque origin
 *   - 写入串行化（writeChain）：快速连续多次 persist 不会让事务互相打断
 *   - 配额超限 / 不可用时 save 返回 false，让上层提示导出备份
 *
 * 迁移：旧版本数据写在 localStorage，首次 load 发现 IDB 为空时自动迁入 IDB
 * 并删除旧键，避免「重置清空 IDB 后旧 localStorage 又复活」的坑。
 */
import type { StorageAdapter } from './types';
import { STORAGE_KEY } from './types';
import { normalizeState, trimForPersist, type PersistedState } from './repository';

const DB_NAME = 'cmc-lab';
const STORE = 'state';
const RECORD_KEY = 'v1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB 不可用'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('打开 IndexedDB 失败'));
  });
  return dbPromise;
}

function reqAsync<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB 请求失败'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB 事务失败'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB 事务中止'));
  });
}

async function idbGet(db: IDBDatabase): Promise<PersistedState | undefined> {
  const tx = db.transaction(STORE, 'readonly');
  const store = tx.objectStore(STORE);
  const val = await reqAsync(store.get(RECORD_KEY) as IDBRequest<PersistedState | undefined>);
  await txDone(tx);
  return val;
}

async function idbPut(db: IDBDatabase, value: PersistedState): Promise<void> {
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(value, RECORD_KEY);
  await txDone(tx);
}

async function idbClear(db: IDBDatabase): Promise<void> {
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).clear();
  await txDone(tx);
}

// 写入串行锁：保证连续 save 按序提交，避免重叠事务互相干扰
let writeChain: Promise<unknown> = Promise.resolve();
function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function readLegacyLocalStorage(): PersistedState | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw) as Partial<PersistedState>);
  } catch {
    return null;
  }
}

export class IndexedDBAdapter implements StorageAdapter {
  async load(): Promise<PersistedState | null> {
    let db: IDBDatabase;
    try {
      db = await openDB();
    } catch {
      // IDB 打不开就退回 localStorage（与回退路径一致）
      return readLegacyLocalStorage();
    }

    const val = await idbGet(db);
    if (val && typeof val === 'object') return normalizeState(val);

    // IDB 为空：尝试从旧 localStorage 迁入（一次性）
    const legacy = readLegacyLocalStorage();
    if (legacy) {
      try {
        await this.save(legacy);
        try {
          if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* 忽略 */
        }
        return legacy;
      } catch {
        return legacy;
      }
    }
    return null;
  }

  async save(state: PersistedState): Promise<boolean> {
    return enqueueWrite(async () => {
      try {
        const db = await openDB();
        await idbPut(db, trimForPersist(state));
        return true;
      } catch {
        // 配额超限 / 事务失败 → 告知上层，由它提示导出备份
        return false;
      }
    });
  }

  async clear(): Promise<void> {
    try {
      const db = await openDB();
      await idbClear(db);
    } catch {
      /* 忽略 */
    }
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* 忽略 */
    }
  }
}
