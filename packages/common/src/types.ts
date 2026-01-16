// 공통 타입 정의

export interface BaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface NamingNode {
  nodeId: string;
  currentName: string;
  nodeType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth?: number;
  texts?: string[];
  iconHints?: string[];
}

export interface NamingResult {
  nodeId: string;
  suggestedName: string;
  componentType: string;
  intent?: string;
  shape?: string;
  size?: string;
  confidence: number;
  reasoning: string;
}
