/**
 * AutoLayout Agent
 *
 * 스크린샷과 자식 요소 위치를 분석하여 최적의 Auto Layout 설정 추론
 * - Direction, Gap, Padding (룰 베이스 값 검증)
 * - Sizing 모드 추론 (HUG/FILL/FIXED) - 반응형 핵심
 *
 * 핵심 원칙: 기존 디자인이 절대 깨지지 않아야 함
 * - 요소 순서 유지
 * - 요소 크기 유지 (기본값)
 * - FILL은 명확한 경우에만 사용
 */

import { askClaudeWithImage, parseJsonResponse } from '../utils/claude';
import type { AutoLayoutRequest, AutoLayoutResult, BaseResponse } from '../types';

const AUTOLAYOUT_PROMPT = `당신은 Figma Auto Layout 전문가입니다.
주어진 프레임 스크린샷과 자식 요소 정보를 분석하여 Auto Layout 설정을 제안해주세요.

## 절대 원칙 (반드시 준수)

### 1. 기존 디자인 100% 보존
- Auto Layout 적용 후에도 **현재 스크린샷과 완전히 동일한 모습**이어야 함
- 요소 위치, 크기, 순서가 바뀌면 안 됨
- 의심스러우면 FIXED/HUG 사용 (FILL 사용 자제)

### 2. 요소 순서 절대 유지
- 자식 요소의 레이어 순서(index)는 변경하지 않음
- Figma에서 위에서 아래로, 왼쪽에서 오른쪽으로 배치됨

### 3. 크기 유지 우선
- 기본적으로 모든 자식은 **현재 크기 유지** (layoutAlign: INHERIT, layoutGrow: 0)
- STRETCH나 layoutGrow:1은 정말 필요한 경우에만 사용

## 언제 FILL(STRETCH/layoutGrow:1)을 사용하는가?

### 사용해야 하는 경우 (명확한 증거가 있을 때만)
- 입력 필드(Input): 너비가 부모 컨테이너에 거의 꽉 차있음
- 전체 너비 버튼: 너비가 부모와 거의 동일
- 구분선(Divider): 너비가 부모와 동일

### 사용하지 않아야 하는 경우
- 카드, 섹션: 고정 크기 유지 (여백이 있으면 FILL 아님)
- 아이콘, 아바타, 썸네일: 항상 FIXED
- 일반 버튼: 텍스트에 맞춤 (HUG)
- 개별 컴포넌트들: 대부분 고정 크기

## 판단 기준

자식 요소의 width가 (부모 width - padding*2)의 95% 이상이면 → FILL 고려
그 외에는 → FIXED/HUG 유지

## 프레임 정보
- 컨테이너 크기: {{containerWidth}} x {{containerHeight}}
- 룰 베이스 계산값: direction={{calculatedDirection}}, gap={{calculatedGap}}

## 자식 요소 정보 (레이어 순서대로)
{{childrenInfo}}

## 응답 형식 (JSON만 출력)
\`\`\`json
{
  "direction": "VERTICAL",
  "gap": 16,
  "paddingTop": 0,
  "paddingRight": 0,
  "paddingBottom": 0,
  "paddingLeft": 0,
  "primaryAxisSizing": "HUG",
  "counterAxisSizing": "FIXED",
  "childrenSizing": [
    {
      "index": 0,
      "layoutAlign": "INHERIT",
      "layoutGrow": 0,
      "reasoning": "상단 요소, 현재 크기 유지"
    }
  ],
  "reasoning": "세로 방향 레이아웃, 기존 크기 유지"
}
\`\`\`

**중요**:
- childrenSizing의 index는 제공된 자식 순서와 동일해야 함
- 대부분의 자식은 layoutAlign: "INHERIT", layoutGrow: 0 이어야 함
- STRETCH나 layoutGrow:1은 정말 필요한 경우에만 사용`;

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

    // 자식 정보 포맷팅 (이름, 크기, 부모 대비 비율 포함)
    const containerWidth = request.width || 0;
    const childrenInfo = request.children
      .map((c, i) => {
        const widthRatio = containerWidth > 0 ? Math.round((c.width / containerWidth) * 100) : 0;
        return `- [${i}] "${c.name || 'unnamed'}": x=${c.x}, y=${c.y}, size=${c.width}x${c.height} (부모 대비 ${widthRatio}%)`;
      })
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
