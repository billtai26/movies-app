
// src/lib/mockCrud.ts
// Generic localStorage CRUD with namespaced collections.
// Provides: getAll, create, update, remove, upsertMany, subscribe, seedIfEmpty.
// Also exports React hooks: useCollection (list + create/update/delete), useDoc (by id).

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "cinesta_crud_v4";

export type EntityRecord = { id: string; [k: string]: any };
export type CollectionName =
  | "movies" | "genres" | "theaters" | "rooms" | "seats"
  | "showtimes" | "users" | "promotions" | "comments" | "notifications"
  | "tickets" | "combos" | "orders";

type DB = Record<CollectionName, EntityRecord[]>;

const listeners = new Set<() => void>();

function readDB(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    const empty: DB = {
      movies: [], genres: [], theaters: [], rooms: [], seats: [],
      showtimes: [], users: [], promotions: [], comments: [], notifications: [],
      tickets: [], combos: [], orders: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }
}

function writeDB(db: DB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  listeners.forEach(l => l());
}

export function seedIfEmpty(seed: Partial<DB>) {
  const db = readDB();
  let changed = false;
  (Object.keys(seed) as CollectionName[]).forEach(name => {
    const arr = (db[name] || []) as EntityRecord[];
    if (!arr || arr.length === 0) {
      db[name] = (seed[name] as EntityRecord[]) || [];
      changed = true;
    }
  });
  if (changed) writeDB(db);
}

export function getAll<T extends EntityRecord>(name: CollectionName): T[] {
  const db = readDB();
  return (db[name] as T[]) || [];
}

export function getById<T extends EntityRecord>(name: CollectionName, id: string): T | undefined {
  return getAll<T>(name).find(x => x.id === id);
}

export function create<T extends EntityRecord>(name: CollectionName, data: Omit<T, "id">): T {
  const db = readDB();
  const rec = { id: uuidv4(), ...data } as T;
  (db[name] as T[]).push(rec);
  writeDB(db);
  return rec;
}

export function update<T extends EntityRecord>(name: CollectionName, id: string, patch: Partial<T>): T {
  const db = readDB();
  const list = db[name] as T[];
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) throw new Error("Not found");
  list[idx] = { ...list[idx], ...patch, id };
  writeDB(db);
  return list[idx];
}

export function remove(name: CollectionName, id: string) {
  const db = readDB();
  db[name] = (db[name] as EntityRecord[]).filter(x => x.id !== id);
  writeDB(db);
}

export function upsertMany<T extends EntityRecord>(name: CollectionName, rows: T[]) {
  const db = readDB();
  db[name] = rows;
  writeDB(db);
}

// ---- React hooks ----
export function useCollection<T extends EntityRecord>(name: CollectionName) {
  const [rows, setRows] = useState<T[]>(() => getAll<T>(name));
  useEffect(() => {
    const l = () => setRows(getAll<T>(name));
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, [name]);

  const actions = useMemo(() => ({
    create: (data: Omit<T, "id">) => create<T>(name, data),
    update: (id: string, patch: Partial<T>) => update<T>(name, id, patch),
    remove: (id: string) => remove(name, id),
    refresh: () => setRows(getAll<T>(name))
  }), [name]);

  return { rows, ...actions };
}

export function useDoc<T extends EntityRecord>(name: CollectionName, id: string | null) {
  const [doc, setDoc] = useState<T | null>(() => (id ? (getById<T>(name, id) ?? null) : null));
  useEffect(() => {
    const l = () => setDoc(id ? (getById<T>(name, id) ?? null) : null);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, [name, id]);
  return doc;
}

// Small helper to reset DB while developing
export function __resetAll() {
  localStorage.removeItem(STORAGE_KEY);
}
