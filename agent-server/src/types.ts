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

// 컨텍스트 기반 네이밍 (전체 스크린 활용)
export interface ContextAwareNamingRequest {
  screenScreenshot: string;  // 전체 스크린 (1장)
  screenWidth: number;
  screenHeight: number;
  nodes: Array<{
    nodeId: string;
    currentName: string;
    parentNodeId?: string | null;  // 부모 노드 ID (후처리에서 부모 suggestedName 찾기용)
    parentName?: string | null;  // 부모 노드 이름 (AI 프롬프트용)
    nodeType: string;
    x: number;       // 스크린 내 상대 위치
    y: number;
    width: number;
    height: number;
    depth?: number;   // 스크린 기준 깊이 (1=최상위, 2=Layout레벨, 3+=컴포넌트)
    texts?: string[];      // 자식 TEXT 노드의 텍스트 (Purpose 추론용)
    iconHints?: string[];  // 자식 Icon/* 이름 (Purpose 추론용)
  }>;
}

export interface ContextAwareNamingResult {
  results: Array<{
    nodeId: string;
    suggestedName: string;
    componentType: string;
    purpose?: string;    // 역할/용도 (CTA, Profile, ButtonArea 등)
    variant?: string;
    size?: string;
    confidence: number;
    reasoning: string;
  }>;
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

// Cleanup Validator 타입
export interface CleanupValidationRequest {
  beforeScreenshot: string;  // base64
  afterScreenshot: string;   // base64
  nodeId: string;
  nodeName: string;
  operationType: 'flatten' | 'cleanup';
}

export interface CleanupDifference {
  element: string;
  issue: 'position' | 'size' | 'visibility' | 'style';
  description: string;
  fix: {
    nodeId: string;
    action: 'move' | 'resize' | 'show' | 'setStyle';
    params: Record<string, number | string>;
  };
}

export interface CleanupValidationResult {
  isIdentical: boolean;
  differences?: CleanupDifference[];
  summary?: string;
}
