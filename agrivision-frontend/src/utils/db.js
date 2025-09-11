import { openDB } from "idb";

const DB_NAME = "agrivision-db";
const STORE = "queue";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    },
  });
}

export async function queueRequest(req) {
  const db = await getDB();
  await db.add(STORE, { ...req, ts: Date.now() });
}

export async function listQueue() {
  const db = await getDB();
  return await db.getAll(STORE);
}

export async function clearQueue() {
  const db = await getDB();
  const tx = db.transaction(STORE, "readwrite");
  await tx.store.clear();
  await tx.done;
}
