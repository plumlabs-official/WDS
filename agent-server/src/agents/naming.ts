/**
 * Naming Agent
 *
 * 스크린샷을 분석하여 컴포넌트 타입과 시맨틱 이름을 추론
 */

import { askClaudeWithImage, parseJsonResponse } from '../utils/claude';
import type { NamingRequest, NamingResult, BaseResponse } from '../types';

const NAMING_PROMPT = `당신은 UI 컴포넌트 분석 전문가입니다.
주어진 Figma 프레임 스크린샷을 분석하여 적절한 시맨틱 이름을 제안해주세요.

## 컴포넌트 타입 분류
- Button: 클릭 가능한 버튼 (텍스트, 아이콘 포함 가능)
- Input: 텍스트 입력 필드
- Avatar: 사용자 프로필 이미지 (원형/정사각형)
- Icon: 아이콘 (단일 벡터 그래픽)
- Card: 정보를 담은 카드 컨테이너
- ListItem: 리스트의 개별 항목
- Tab: 탭 네비게이션 항목
- Toggle: ON/OFF 스위치
- Checkbox: 체크박스
- Badge: 상태 표시 배지
- Header: 상단 헤더 영역
- BottomSheet: 하단 시트
- Modal: 모달/다이얼로그
- Container: 여러 요소를 담는 컨테이너
- Frame: 분류되지 않는 일반 프레임

## Variant 분류 (색상/스타일 기반)
- Primary: 주요 액션 (녹색 #00cc61 계열)
- Secondary: 보조 액션 (회색 계열)
- Outline: 테두리만 있는 스타일
- Ghost: 배경 없는 투명 스타일
- Default: 기본 스타일 (흰색/무색)

## Size 분류
- XS, SM, MD, LG, XL, Full

## 네이밍 컨벤션
- 형식: ComponentType/Variant/Size
- Variant가 Default면 생략: ComponentType/Size
- 예시: Button/Primary/MD, Avatar/LG, Icon/SM

## 노드 정보
- 현재 이름: {{currentName}}
- 타입: {{nodeType}}
- 크기: {{width}} x {{height}}
- 자식 요소 수: {{childrenCount}}

## 응답 형식 (JSON)
\`\`\`json
{
  "suggestedName": "Button/Primary/MD",
  "componentType": "Button",
  "variant": "Primary",
  "size": "MD",
  "confidence": 0.95,
  "reasoning": "녹색 배경의 둥근 버튼으로, 텍스트가 포함되어 있음"
}
\`\`\`

스크린샷을 분석하고 JSON 형식으로만 응답해주세요.`;

export async function analyzeNaming(
  request: NamingRequest
): Promise<BaseResponse<NamingResult>> {
  try {
    if (!request.screenshot) {
      return {
        success: false,
        error: 'Screenshot is required',
      };
    }

    const prompt = NAMING_PROMPT
      .replace('{{currentName}}', request.currentName)
      .replace('{{nodeType}}', request.nodeType)
      .replace('{{width}}', String(request.width))
      .replace('{{height}}', String(request.height))
      .replace('{{childrenCount}}', String(request.childrenCount));

    const response = await askClaudeWithImage(prompt, request.screenshot);
    const result = parseJsonResponse<NamingResult>(response);

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
