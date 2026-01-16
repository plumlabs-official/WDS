/**
 * 패턴 저장소 서비스
 *
 * JSON 파일 기반 영구 저장 (MVP)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  PatternStore,
  PatternStoreSchema,
  Pattern,
  PatternSchema,
  CreatePatternRequest,
  PatternHistory,
} from '@wellwe/common';

// 저장소 파일 경로
const STORE_PATH = join(__dirname, '../../data/naming-patterns.json');

// 메모리 캐시
let storeCache: PatternStore | null = null;

/**
 * 저장소 초기화 (파일이 없으면 생성)
 */
function initStore(): PatternStore {
  if (!existsSync(STORE_PATH)) {
    const initial: PatternStore = {
      version: 1,
      patterns: [],
      history: [],
    };
    writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  const content = readFileSync(STORE_PATH, 'utf-8');
  const parsed = JSON.parse(content);
  const validated = PatternStoreSchema.safeParse(parsed);

  if (!validated.success) {
    console.error('[PatternStore] Invalid store file, resetting:', validated.error);
    const initial: PatternStore = {
      version: 1,
      patterns: [],
      history: [],
    };
    writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  return validated.data;
}

/**
 * 저장소 로드 (캐시 사용)
 */
export function loadStore(): PatternStore {
  if (storeCache) return storeCache;
  storeCache = initStore();
  return storeCache;
}

/**
 * 저장소 저장
 */
function saveStore(store: PatternStore): void {
  storeCache = store;
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * 캐시 무효화 (테스트용)
 */
export function invalidateCache(): void {
  storeCache = null;
}

// ============================================
// CRUD 함수
// ============================================

/**
 * 모든 패턴 조회
 */
export function getAllPatterns(): Pattern[] {
  return loadStore().patterns;
}

/**
 * 패턴 ID로 조회
 */
export function getPatternById(id: string): Pattern | null {
  const store = loadStore();
  return store.patterns.find(p => p.id === id) || null;
}

/**
 * 패턴 이름으로 조회
 */
export function getPatternByName(name: string): Pattern | null {
  const store = loadStore();
  return store.patterns.find(p => p.name === name) || null;
}

/**
 * 최근 사용 패턴 조회
 */
export function getRecentPatterns(limit: number = 10): Pattern[] {
  const store = loadStore();
  return [...store.patterns]
    .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
    .slice(0, limit);
}

/**
 * 자주 사용 패턴 조회
 */
export function getFrequentPatterns(limit: number = 10): Pattern[] {
  const store = loadStore();
  return [...store.patterns]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

/**
 * 패턴 생성 또는 업데이트 (Upsert)
 *
 * - 동일 이름 패턴이 있으면 업데이트
 * - 없으면 새로 생성
 */
export function upsertPattern(request: CreatePatternRequest): Pattern {
  const store = loadStore();
  const now = new Date().toISOString();

  // 기존 패턴 찾기 (이름으로)
  const existingIndex = store.patterns.findIndex(p => p.name === request.name);

  if (existingIndex >= 0) {
    // 업데이트
    const existing = store.patterns[existingIndex];
    const updated: Pattern = {
      ...existing,
      structure: request.structure,
      lastUsedAt: now,
      usageCount: existing.usageCount + 1,
      sourceNodeId: request.sourceNodeId || existing.sourceNodeId,
      sourceFileKey: request.sourceFileKey || existing.sourceFileKey,
    };

    store.patterns[existingIndex] = updated;
    saveStore(store);

    console.log(`[PatternStore] Updated pattern: "${request.name}" (usage: ${updated.usageCount})`);
    return updated;
  }

  // 새로 생성
  const newPattern: Pattern = {
    id: uuidv4(),
    name: request.name,
    structure: request.structure,
    createdAt: now,
    lastUsedAt: now,
    usageCount: 1,
    sourceNodeId: request.sourceNodeId,
    sourceFileKey: request.sourceFileKey,
  };

  // zod 검증
  const validated = PatternSchema.safeParse(newPattern);
  if (!validated.success) {
    console.error('[PatternStore] Invalid pattern:', validated.error);
    throw new Error('Invalid pattern data');
  }

  store.patterns.push(validated.data);
  saveStore(store);

  console.log(`[PatternStore] Created pattern: "${request.name}" (id: ${newPattern.id})`);
  return validated.data;
}

/**
 * 패턴 삭제
 */
export function deletePattern(id: string): boolean {
  const store = loadStore();
  const index = store.patterns.findIndex(p => p.id === id);

  if (index < 0) return false;

  store.patterns.splice(index, 1);
  saveStore(store);

  console.log(`[PatternStore] Deleted pattern: ${id}`);
  return true;
}

/**
 * 패턴 사용 기록 (usageCount 증가)
 */
export function recordPatternUsage(id: string): Pattern | null {
  const store = loadStore();
  const pattern = store.patterns.find(p => p.id === id);

  if (!pattern) return null;

  pattern.usageCount += 1;
  pattern.lastUsedAt = new Date().toISOString();
  saveStore(store);

  return pattern;
}

/**
 * 패턴 이름 변경 + 히스토리 기록
 */
export function renamePattern(id: string, newName: string): Pattern | null {
  const store = loadStore();
  const pattern = store.patterns.find(p => p.id === id);

  if (!pattern) return null;

  const oldName = pattern.name;

  // 히스토리 기록
  const historyEntry: PatternHistory = {
    patternId: id,
    fromName: oldName,
    toName: newName,
    changedAt: new Date().toISOString(),
  };
  store.history.push(historyEntry);

  // 이름 변경
  pattern.name = newName;
  pattern.lastUsedAt = new Date().toISOString();
  saveStore(store);

  console.log(`[PatternStore] Renamed pattern: "${oldName}" → "${newName}"`);
  return pattern;
}

/**
 * 히스토리 조회
 */
export function getHistory(limit: number = 50): PatternHistory[] {
  const store = loadStore();
  return [...store.history]
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
    .slice(0, limit);
}
