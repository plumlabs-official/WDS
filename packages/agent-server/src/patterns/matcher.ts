/**
 * 패턴 매칭 서비스
 *
 * 구조 기반 유사성 판단 (MVP - 시각적 유사도 제외)
 */

import {
  StructureFeatures,
  Pattern,
  MatchCandidate,
  MatchReason,
  MatchResult,
} from '@wellwe/common';
import { getAllPatterns } from './store';

// ============================================
// 가중치 설정
// ============================================

const WEIGHTS = {
  childCount: 0.08,      // 자식 수
  childTypes: 0.12,      // 자식 타입 구성
  layoutMode: 0.06,      // 레이아웃 방향
  positionZone: 0.06,    // 위치 (상단/하단/중앙)
  aspectRatio: 0.08,     // 가로/세로 비율
  childNames: 0.08,      // 자식 이름 유사도 (보너스)
  parentName: 0.17,      // 부모 이름 일치 (context 기반)
  vectorPathHash: 0.17,  // 벡터 경로 해시 (아이콘 구분)
  textFingerprint: 0.18, // 텍스트 지문 (TEXT 노드 구분)
};

// ============================================
// 개별 요소 점수 계산
// ============================================

/**
 * 자식 수 점수 (정확 일치: 1.0, ±1: 0.8, ±2: 0.5, 그 외: 0)
 */
function scoreChildCount(a: number, b: number): number {
  const diff = Math.abs(a - b);
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.8;
  if (diff === 2) return 0.5;
  return 0;
}

/**
 * 자식 타입 배열 점수 (Jaccard 유사도)
 */
function scoreChildTypes(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1.0;
  if (a.length === 0 || b.length === 0) return 0;

  // 순서 고려한 LCS (Longest Common Subsequence) 비율
  const lcsLength = longestCommonSubsequence(a, b);
  const maxLength = Math.max(a.length, b.length);

  return lcsLength / maxLength;
}

/**
 * LCS 길이 계산
 */
function longestCommonSubsequence(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * 레이아웃 모드 점수 (일치: 1.0, 불일치: 0)
 */
function scoreLayoutMode(a: string, b: string): number {
  return a === b ? 1.0 : 0;
}

/**
 * 위치 영역 점수 (일치: 1.0, 인접: 0.5, 불일치: 0)
 */
function scorePositionZone(a: string, b: string): number {
  if (a === b) return 1.0;

  // 인접 영역: top-middle, middle-bottom
  const adjacent = [
    ['top', 'middle'],
    ['middle', 'bottom'],
  ];

  for (const [x, y] of adjacent) {
    if ((a === x && b === y) || (a === y && b === x)) {
      return 0.5;
    }
  }

  return 0;
}

/**
 * 가로/세로 비율 점수 (유사할수록 높은 점수)
 */
function scoreAspectRatio(a: number, b: number): number {
  const ratio = Math.min(a, b) / Math.max(a, b);
  // 0.9 이상: 매우 유사, 0.7 이상: 유사, 그 외: 선형 감소
  if (ratio >= 0.9) return 1.0;
  if (ratio >= 0.7) return 0.8;
  if (ratio >= 0.5) return 0.5;
  return ratio;
}

/**
 * 자식 이름 점수 (선택적, Jaccard 유사도)
 */
function scoreChildNames(a?: string[], b?: string[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;

  // 집합 교집합 / 합집합
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...a, ...b]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * 부모 이름 점수 (context 기반 매칭)
 * - 정확히 일치: 1.0
 * - 둘 다 없음: 0.5 (중립)
 * - 하나만 있거나 불일치: 0.0
 */
function scoreParentName(a?: string | null, b?: string | null): number {
  // 둘 다 없으면 중립 (기존 패턴과 호환)
  if (!a && !b) return 0.5;

  // 하나만 있으면 불일치
  if (!a || !b) return 0.0;

  // 정확히 일치
  if (a === b) return 1.0;

  // 부분 일치 (예: "Container/TimeRemaining" vs "TimeRemaining")
  if (a.includes(b) || b.includes(a)) return 0.7;

  // 완전 불일치
  return 0.0;
}

/**
 * 벡터 경로 해시 점수 (아이콘 구분)
 * - 정확히 일치: 1.0
 * - 둘 다 없음: 0.5 (중립 - 벡터가 아닌 노드)
 * - 하나만 있거나 불일치: 0.0
 */
function scoreVectorPathHash(a?: string | null, b?: string | null): number {
  // 둘 다 없으면 중립 (벡터가 아닌 노드끼리 비교)
  if (!a && !b) return 0.5;

  // 하나만 있으면 불일치 (벡터 vs 비벡터)
  if (!a || !b) return 0.0;

  // 정확히 일치 (같은 모양의 아이콘)
  if (a === b) return 1.0;

  // 해시 길이(path 길이)만 비교 - 부분 일치
  const aLen = parseInt(a.split('-')[0]) || 0;
  const bLen = parseInt(b.split('-')[0]) || 0;
  if (aLen > 0 && bLen > 0) {
    const ratio = Math.min(aLen, bLen) / Math.max(aLen, bLen);
    if (ratio > 0.9) return 0.3; // 길이가 비슷하면 약간의 점수
  }

  // 완전 불일치
  return 0.0;
}

/**
 * 텍스트 지문 점수 (TEXT 노드 구분)
 * - 정확히 일치: 1.0
 * - 둘 다 없음: 0.5 (중립 - TEXT가 아닌 노드)
 * - 하나만 있거나 불일치: 0.0
 */
function scoreTextFingerprint(a?: string | null, b?: string | null): number {
  // 둘 다 없으면 중립 (TEXT가 아닌 노드끼리 비교)
  if (!a && !b) return 0.5;

  // 하나만 있으면 불일치 (TEXT vs non-TEXT)
  if (!a || !b) return 0.0;

  // 정확히 일치 (같은 패턴의 텍스트)
  if (a === b) return 1.0;

  // 부분 일치: 길이 버킷이 같으면 약간의 점수
  const aLen = a.charAt(0); // S, M, L
  const bLen = b.charAt(0);
  if (aLen === bLen) return 0.3;

  // 완전 불일치
  return 0.0;
}

// ============================================
// 매칭 함수
// ============================================

/**
 * 두 구조 특징의 유사도 계산
 */
export function calculateSimilarity(
  input: StructureFeatures,
  pattern: StructureFeatures
): { score: number; reasons: MatchReason[] } {
  const reasons: MatchReason[] = [];

  // 1. 자식 수
  const childCountScore = scoreChildCount(input.childCount, pattern.childCount);
  reasons.push({
    factor: 'childCount',
    score: childCountScore,
    detail: `입력: ${input.childCount}, 패턴: ${pattern.childCount}`,
  });

  // 2. 자식 타입
  const childTypesScore = scoreChildTypes(input.childTypes, pattern.childTypes);
  reasons.push({
    factor: 'childTypes',
    score: childTypesScore,
    detail: `입력: [${input.childTypes.slice(0, 3).join(', ')}${input.childTypes.length > 3 ? '...' : ''}], 패턴: [${pattern.childTypes.slice(0, 3).join(', ')}${pattern.childTypes.length > 3 ? '...' : ''}]`,
  });

  // 3. 레이아웃 모드
  const layoutModeScore = scoreLayoutMode(input.layoutMode, pattern.layoutMode);
  reasons.push({
    factor: 'layoutMode',
    score: layoutModeScore,
    detail: `입력: ${input.layoutMode}, 패턴: ${pattern.layoutMode}`,
  });

  // 4. 위치 영역
  const positionZoneScore = scorePositionZone(input.positionZone, pattern.positionZone);
  reasons.push({
    factor: 'positionZone',
    score: positionZoneScore,
    detail: `입력: ${input.positionZone}, 패턴: ${pattern.positionZone}`,
  });

  // 5. 가로/세로 비율
  const aspectRatioScore = scoreAspectRatio(input.aspectRatio, pattern.aspectRatio);
  reasons.push({
    factor: 'aspectRatio',
    score: aspectRatioScore,
    detail: `입력: ${input.aspectRatio.toFixed(2)}, 패턴: ${pattern.aspectRatio.toFixed(2)}`,
  });

  // 6. 자식 이름 (보너스)
  const childNamesScore = scoreChildNames(input.childNames, pattern.childNames);
  if (childNamesScore > 0) {
    reasons.push({
      factor: 'childNames',
      score: childNamesScore,
      detail: `자식 이름 일치율: ${(childNamesScore * 100).toFixed(0)}%`,
    });
  }

  // 7. 부모 이름 (context 기반 매칭 - 핵심!)
  const parentNameScore = scoreParentName(input.parentName, pattern.parentName);
  if (input.parentName || pattern.parentName) {
    reasons.push({
      factor: 'parentName',
      score: parentNameScore,
      detail: `입력: ${input.parentName || '(없음)'}, 패턴: ${pattern.parentName || '(없음)'}`,
    });
  }

  // 8. 벡터 경로 해시 (아이콘 구분)
  const vectorPathHashScore = scoreVectorPathHash(input.vectorPathHash, pattern.vectorPathHash);
  if (input.vectorPathHash || pattern.vectorPathHash) {
    reasons.push({
      factor: 'vectorPathHash',
      score: vectorPathHashScore,
      detail: `입력: ${input.vectorPathHash ? '있음' : '없음'}, 패턴: ${pattern.vectorPathHash ? '있음' : '없음'}`,
    });
  }

  // 9. 텍스트 지문 (TEXT 노드 구분)
  const textFingerprintScore = scoreTextFingerprint(input.textFingerprint, pattern.textFingerprint);
  if (input.textFingerprint || pattern.textFingerprint) {
    reasons.push({
      factor: 'textFingerprint',
      score: textFingerprintScore,
      detail: `입력: ${input.textFingerprint || '(없음)'}, 패턴: ${pattern.textFingerprint || '(없음)'}`,
    });
  }

  // 가중 평균 계산
  const totalScore =
    childCountScore * WEIGHTS.childCount +
    childTypesScore * WEIGHTS.childTypes +
    layoutModeScore * WEIGHTS.layoutMode +
    positionZoneScore * WEIGHTS.positionZone +
    aspectRatioScore * WEIGHTS.aspectRatio +
    childNamesScore * WEIGHTS.childNames +
    parentNameScore * WEIGHTS.parentName +
    vectorPathHashScore * WEIGHTS.vectorPathHash +
    textFingerprintScore * WEIGHTS.textFingerprint;

  return { score: totalScore, reasons };
}

/**
 * 유사 패턴 찾기
 */
export function findSimilarPatterns(
  input: StructureFeatures,
  options: { limit?: number; minScore?: number } = {}
): MatchResult {
  const { limit = 3, minScore = 0.5 } = options;

  const patterns = getAllPatterns();
  const candidates: MatchCandidate[] = [];

  for (const pattern of patterns) {
    const { score, reasons } = calculateSimilarity(input, pattern.structure);

    if (score >= minScore) {
      candidates.push({
        pattern,
        score,
        reasons,
      });
    }
  }

  // 점수 내림차순 정렬
  candidates.sort((a, b) => b.score - a.score);

  // 상위 N개만
  const topCandidates = candidates.slice(0, limit);

  // 정확히 일치하는 패턴이 있는지 (점수 0.95 이상)
  const hasExactMatch = topCandidates.some(c => c.score >= 0.95);

  console.log(`[PatternMatcher] Found ${candidates.length} candidates (min score: ${minScore})`);
  if (topCandidates.length > 0) {
    console.log(`[PatternMatcher] Top match: "${topCandidates[0].pattern.name}" (score: ${topCandidates[0].score.toFixed(2)})`);
  }

  return {
    candidates: topCandidates,
    hasExactMatch,
  };
}

/**
 * 정확히 일치하는 패턴 찾기 (이름으로)
 */
export function findExactPattern(name: string): Pattern | null {
  const patterns = getAllPatterns();
  return patterns.find(p => p.name === name) || null;
}
