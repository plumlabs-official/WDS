/**
 * 공통 타입 정의
 */

// 에이전트 타입
export type AgentType = 'naming' | 'autolayout' | 'componentize';

// 기본 요청/응답 타입
export interface BaseRequest {
  nodeId: string;
  screenshot?: string; // base64
}

export interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Naming Agent 타입
export interface NamingRequest extends BaseRequest {
  currentName: string;
  nodeType: string;
  width: number;
  height: number;
  childrenCount: number;
}

export interface NamingResult {
  suggestedName: string;
  componentType: string;
  variant?: string;
  size?: string;
  confidence: number;
  reasoning: string;
}

// AutoLayout Agent 타입
export interface AutoLayoutRequest extends BaseRequest {
  width?: number;
  height?: number;
  calculatedDirection?: string; // 룰 베이스 계산값
  calculatedGap?: number;
  children: Array<{
    id: string;
    name?: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

// 자식 요소 Sizing 설정
export interface ChildSizing {
  index: number;
  layoutAlign: 'INHERIT' | 'STRETCH'; // 교차축 정렬 (STRETCH = FILL)
  layoutGrow: 0 | 1; // 주축 공간 채우기 (1 = FILL)
  reasoning?: string;
}

export interface AutoLayoutResult {
  direction: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  // 컨테이너 Sizing
  primaryAxisSizing?: 'HUG' | 'FIXED'; // 주축 사이징 (AUTO = HUG)
  counterAxisSizing?: 'HUG' | 'FIXED'; // 교차축 사이징
  // 자식 개별 Sizing
  childrenSizing?: ChildSizing[];
  reasoning: string;
}

// Orchestrator 타입
export interface PipelineRequest {
  nodeId: string;
  screenshot: string;
  steps: AgentType[];
}

export interface PipelineResult {
  results: Record<AgentType, BaseResponse>;
  summary: string;
}
