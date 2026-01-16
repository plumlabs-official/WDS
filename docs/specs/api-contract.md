# API Contract

> Agent Server API 명세

## Base URL

```
http://localhost:3001
```

## 공통 응답 형식

```typescript
interface BaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## GET /health

헬스체크

**Response**
```json
{ "status": "ok", "timestamp": "2026-01-15T12:00:00.000Z" }
```

---

## POST /agents/naming/context

컨텍스트 기반 네이밍 (권장)

**Request**
```typescript
interface ContextAwareNamingRequest {
  screenScreenshot: string;  // base64 (전체 스크린 1장)
  screenWidth: number;
  screenHeight: number;
  nodes: Array<{
    nodeId: string;
    currentName: string;
    nodeType: string;
    x: number;
    y: number;
    width: number;
    height: number;
    depth?: number;      // 1=최상위, 2=Layout, 3+=컴포넌트
    texts?: string[];    // 자식 TEXT 노드 텍스트
    iconHints?: string[]; // 자식 Icon/* 이름
  }>;
}
```

**Response**
```typescript
interface ContextAwareNamingResult {
  results: Array<{
    nodeId: string;
    suggestedName: string;  // "Button/Primary/Filled/48"
    componentType: string;  // "Button"
    intent?: string;        // "Primary"
    shape?: string;         // "Filled"
    size?: string;          // "48"
    confidence: number;     // 0.0 ~ 1.0
    reasoning: string;
  }>;
}
```

---

## POST /agents/autolayout

Auto Layout 분석

**Request**
```typescript
interface AutoLayoutRequest {
  nodeId: string;
  screenshot?: string;  // base64
  width?: number;
  height?: number;
  children: Array<{
    id: string;
    name?: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}
```

**Response**
```typescript
interface AutoLayoutResult {
  direction: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  primaryAxisSizing?: 'HUG' | 'FIXED';
  counterAxisSizing?: 'HUG' | 'FIXED';
  childrenSizing?: Array<{
    index: number;
    layoutAlign: 'INHERIT' | 'STRETCH';
    layoutGrow: 0 | 1;
  }>;
  reasoning: string;
}
```

---

## POST /agents/cleanup/validate

병합 전후 스크린샷 비교 (AI 검증)

**Request**
```typescript
interface CleanupValidationRequest {
  beforeScreenshot: string;  // base64
  afterScreenshot: string;   // base64
  nodeId: string;
  nodeName: string;
  operationType: 'flatten' | 'cleanup';
}
```

**Response**
```typescript
interface CleanupValidationResult {
  isIdentical: boolean;
  differences?: Array<{
    element: string;
    issue: 'position' | 'size' | 'visibility' | 'style';
    description: string;
  }>;
  summary?: string;
}
```

---

## 기술 제약

| 제약 | 해결 |
|------|------|
| Figma 플러그인 외부 API 불가 | Agent Server 프록시 |
| base64 이미지 prefix | `data:image` prefix 제거 후 전송 |
| JSON body 크기 | Express limit 50mb 설정 |
