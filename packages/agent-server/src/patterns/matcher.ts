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
  childCount: 0.20,      // 자식 수
  childTypes: 0.25,      // 자식 타입 구성
  layoutMode: 0.15,      // 레이아웃 방향
  positionZone: 0.15,    // 위치 (상단/하단/중앙)
  aspectRatio: 0.15,     // 가로/세로 비율
  childNames: 0.10,      // 자식 이름 유사도 (보너스)
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

  // 가중 평균 계산
  const totalScore =
    childCountScore * WEIGHTS.childCount +
    childTypesScore * WEIGHTS.childTypes +
    layoutModeScore * WEIGHTS.layoutMode +
    positionZoneScore * WEIGHTS.positionZone +
    aspectRatioScore * WEIGHTS.aspectRatio +
    childNamesScore * WEIGHTS.childNames;

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
