/**
 * AutoLayout Agent
 *
 * 스크린샷과 자식 요소 위치를 분석하여 최적의 Auto Layout 설정 추론
 * - Direction, Gap, Padding (룰 베이스 값 검증)
 * - Sizing 모드 추론 (HUG/FILL/FIXED) - 반응형 핵심
 *
 * 중요: 기존 디자인이 깨지지 않도록 sizing 결정
 */

import { askClaudeWithImage, parseJsonResponse } from '../utils/claude';
import type { AutoLayoutRequest, AutoLayoutResult, BaseResponse } from '../types';

const AUTOLAYOUT_PROMPT = `당신은 UI 레이아웃 분석 전문가입니다.
주어진 Figma 프레임 스크린샷과 자식 요소 위치 정보를 분석하여 최적의 Auto Layout 설정을 제안해주세요.

## 핵심 원칙
1. **기존 디자인 보존**: 적용 후에도 현재와 동일한 모습이어야 함
2. **반응형 고려**: 화면 크기 변화에 적절히 대응하도록 sizing 결정
3. **일관성**: 디자인 토큰 값 사용

## 분석 항목

### 1. Direction (방향)
- HORIZONTAL: 자식들이 가로로 나열됨
- VERTICAL: 자식들이 세로로 나열됨
- NONE: Auto Layout이 적합하지 않음 (겹치는 요소, 자유 배치 등)

### 2. Gap & Padding
- 디자인 토큰: 0, 4, 8, 12, 16, 24, 32, 64
- 룰 베이스 계산값이 제공되면 검증만 수행

### 3. 컨테이너 Sizing (중요)
- **primaryAxisSizing**: 주축 방향 사이징
  - HUG: 자식 콘텐츠에 맞춤 (내용물 크기)
  - FIXED: 현재 크기 유지 (고정)
- **counterAxisSizing**: 교차축 방향 사이징
  - HUG: 자식 콘텐츠에 맞춤
  - FIXED: 현재 크기 유지

### 4. 자식 요소 개별 Sizing (핵심)
각 자식에 대해 결정:
- **layoutAlign**: 교차축 정렬
  - INHERIT: 부모 설정 따름
  - STRETCH: 교차축 방향으로 늘어남 (FILL 효과)
- **layoutGrow**: 주축 공간 채우기
  - 0: 고정 크기 유지
  - 1: 남은 공간 채움 (FILL 효과)

## Sizing 판단 가이드

| UI 요소 | Width | Height | 이유 |
|---------|-------|--------|------|
| 버튼 (일반) | HUG | HUG | 텍스트에 맞춤 |
| 버튼 (전체너비) | FILL (layoutGrow:1) | HUG | 컨테이너 채움 |
| 아이콘 | FIXED | FIXED | 정확한 크기 필요 |
| 아바타 | FIXED | FIXED | 정확한 크기 필요 |
| 텍스트 | HUG or FILL | HUG | 내용에 따라 |
| 입력 필드 | FILL | FIXED | 너비는 채움, 높이 고정 |
| 리스트 아이템 | FILL (STRETCH) | HUG | 전체 너비, 높이는 내용 |
| 카드 | FILL or FIXED | HUG | 컨텍스트에 따라 |
| 컨테이너/섹션 | FILL | HUG | 너비 채움, 높이 내용 |

## 프레임 정보
- 컨테이너 크기: {{containerWidth}} x {{containerHeight}}
- 룰 베이스 계산값: direction={{calculatedDirection}}, gap={{calculatedGap}}

## 자식 요소 정보
{{childrenInfo}}

## 응답 형식 (JSON)
\`\`\`json
{
  "direction": "VERTICAL",
  "gap": 16,
  "paddingTop": 24,
  "paddingRight": 16,
  "paddingBottom": 24,
  "paddingLeft": 16,
  "primaryAxisSizing": "HUG",
  "counterAxisSizing": "FIXED",
  "childrenSizing": [
    {
      "index": 0,
      "layoutAlign": "STRETCH",
      "layoutGrow": 0,
      "reasoning": "리스트 아이템으로 전체 너비 사용"
    },
    {
      "index": 1,
      "layoutAlign": "INHERIT",
      "layoutGrow": 1,
      "reasoning": "버튼으로 남은 공간 채움"
    }
  ],
  "reasoning": "세로 방향 리스트 레이아웃, 각 아이템이 전체 너비 사용"
}
\`\`\`

스크린샷과 위치 정보를 분석하고 JSON 형식으로만 응답해주세요.`;

export async function analyzeAutoLayout(
  request: AutoLayoutRequest
): Promise<BaseResponse<AutoLayoutResult>> {
  try {
    if (!request.screenshot) {
      return {
        success: false,
        error: 'Screenshot is required',
      };
    }

    // 자식 정보 포맷팅 (이름 포함)
    const childrenInfo = request.children
      .map(
        (c, i) =>
          `- Child ${i + 1} (${c.name || 'unnamed'}): x=${c.x}, y=${c.y}, width=${c.width}, height=${c.height}`
      )
      .join('\n');

    // 프롬프트 변수 치환
    const prompt = AUTOLAYOUT_PROMPT
      .replace('{{childrenInfo}}', childrenInfo || '(자식 없음)')
      .replace('{{containerWidth}}', String(request.width || 0))
      .replace('{{containerHeight}}', String(request.height || 0))
      .replace('{{calculatedDirection}}', request.calculatedDirection || 'AUTO')
      .replace('{{calculatedGap}}', String(request.calculatedGap || 0));

    const response = await askClaudeWithImage(prompt, request.screenshot);
    const result = parseJsonResponse<AutoLayoutResult>(response);

    if (!result) {
      return {
        success: false,
        error: 'Failed to parse response',
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
