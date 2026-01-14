/**
 * Wellwe Design System Automator
 *
 * Figma 플러그인 메인 엔트리
 * - Auto Layout 적용
 * - 간격 표준화
 * - 네이밍 자동화
 * - 컴포넌트화
 * - Agent Server 연동 (LLM 기반 분석)
 */

import {
  applyAutoLayoutToSelection,
} from './modules/autolayout';

import {
  standardizeSelectionSpacing,
} from './modules/spacing';

import {
  cleanupSelectionWrappers,
} from './modules/cleanup';

import {
  renameSelectionFrames,
} from './modules/naming';

import {
  componentizeSelection,
} from './modules/componentize';

// 현재 명령어 가져오기
const command = figma.command;

// 항상 UI 열기 (플로팅 패널)
figma.showUI(__html__, {
  width: 300,
  height: 520,
  themeColors: true,
  title: 'Design System Automator',
});

// UI에서 오는 메시지 처리
figma.ui.onmessage = handleUIMessage;

// 메뉴에서 직접 명령어 실행한 경우 처리
if (command && command !== 'open-ui') {
  handleCommandWithUI(command);
}

/**
 * 명령어 처리 (UI 유지)
 */
function handleCommandWithUI(cmd: string) {
  switch (cmd) {
    case 'apply-autolayout':
      handleApplyAutoLayout();
      break;

    case 'standardize-spacing':
      handleStandardizeSpacing();
      break;

    case 'cleanup-wrappers':
      handleCleanupWrappers();
      break;

    case 'detach-components':
      handleDetachComponents();
      break;

    case 'delete-hidden-layers':
      handleDeleteHiddenLayers();
      break;

    case 'confirm-delete-hidden':
      confirmDeleteHiddenLayers();
      break;

    case 'cancel-delete-hidden':
      cancelDeleteHiddenLayers();
      break;

    case 'auto-naming':
      handleAutoNaming();
      break;

    case 'componentize':
      handleComponentize();
      break;

    case 'componentize-convert':
      handleComponentizeConvert();
      break;

    case 'run-all':
      handleRunAll();
      break;

    case 'apply-autolayout-agent':
      handleAutoLayoutAgent();
      break;

    case 'auto-naming-agent':
      handleNamingAgent();
      break;

    case 'run-all-agent':
      handleRunAllAgent();
      break;

    default:
      figma.notify('알 수 없는 명령입니다.', { error: true });
  }
}

// Agent 결과 타입 정의
interface NamingResultMessage {
  type: 'naming-result';
  success?: boolean;
  data?: {
    suggestedName: string;
    componentType?: string;
    confidence?: number;
    reasoning?: string;
  };
  error?: string;
}

interface NamingBatchResultMessage {
  type: 'naming-batch-result';
  success?: boolean;
  results?: Array<{
    success?: boolean;
    data?: { suggestedName: string };
  }>;
  error?: string;
}

interface ChildSizing {
  index: number;
  layoutAlign: 'INHERIT' | 'STRETCH';
  layoutGrow: 0 | 1;
  reasoning?: string;
}

interface AutoLayoutResultMessage {
  type: 'autolayout-result';
  success?: boolean;
  data?: {
    direction: string;
    gap: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    primaryAxisSizing?: 'HUG' | 'FIXED';
    counterAxisSizing?: 'HUG' | 'FIXED';
    childrenSizing?: ChildSizing[];
    reasoning?: string;
  };
  error?: string;
}

type UIMessage =
  | { type: string }
  | NamingResultMessage
  | NamingBatchResultMessage
  | AutoLayoutResultMessage;

/**
 * UI 메시지 핸들러
 */
async function handleUIMessage(msg: UIMessage) {
  // 기존 명령어 (Rule-based)
  if (!msg.type.endsWith('-agent') && !msg.type.startsWith('agent-') && !msg.type.endsWith('-result')) {
    handleCommandWithUI(msg.type);
    return;
  }

  // Agent 관련 명령어
  switch (msg.type) {
    case 'apply-autolayout-agent':
      await handleAutoLayoutAgent();
      break;

    case 'auto-naming-agent':
      await handleNamingAgent();
      break;

    case 'run-all-agent':
      await handleRunAllAgent();
      break;

    case 'naming-result':
      handleNamingResult(msg as NamingResultMessage);
      break;

    case 'naming-batch-result':
      handleNamingBatchResult(msg as NamingBatchResultMessage);
      break;

    case 'autolayout-result':
      handleAutoLayoutResult(msg as AutoLayoutResultMessage);
      break;
  }
}

/**
 * Auto Layout 적용 핸들러
 */
function handleApplyAutoLayout() {
  try {
    const result = applyAutoLayoutToSelection({
      direction: 'AUTO',
      standardizeSpacing: true,
      recursive: true,
      skipExisting: true,
    });

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  // UI 유지 (closePlugin 제거)
}

/**
 * 의미 없는 래퍼 제거 핸들러
 */
function handleCleanupWrappers() {
  try {
    const result = cleanupSelectionWrappers();

    if (result.details && result.details.removedCount > 0) {
      console.log('=== 래퍼 제거 결과 ===');
      for (const name of result.details.removedNames) {
        console.log(`  - ${name}`);
      }
    }

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  // UI 유지 (closePlugin 제거)
}

/**
 * 컴포넌트 브레이크 (일반 프레임으로 전환)
 */
function handleDetachComponents() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('프레임을 선택해주세요.', { error: true });
    return;
  }

  let detachedCount = 0;

  function detachRecursively(node: SceneNode) {
    // 인스턴스인 경우 detach
    if (node.type === 'INSTANCE') {
      try {
        node.detachInstance();
        detachedCount++;
      } catch (e) {
        console.error('Detach failed:', node.name, e);
      }
    }

    // 자식이 있으면 재귀 처리
    if ('children' in node) {
      for (const child of [...node.children]) {
        detachRecursively(child);
      }
    }
  }

  for (const node of selection) {
    detachRecursively(node);
  }

  if (detachedCount > 0) {
    figma.notify(`${detachedCount}개 컴포넌트 인스턴스를 프레임으로 전환했습니다.`, { timeout: 3000 });
  } else {
    figma.notify('전환할 컴포넌트 인스턴스가 없습니다.', { timeout: 3000 });
  }
}

// 꺼진 레이어 저장용
let pendingHiddenLayers: SceneNode[] = [];

/**
 * 꺼진 레이어 삭제 (확인 후)
 */
function handleDeleteHiddenLayers() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('프레임을 선택해주세요.', { error: true });
    return;
  }

  const hiddenLayers: SceneNode[] = [];

  function findHiddenLayers(node: SceneNode) {
    if (!node.visible) {
      hiddenLayers.push(node);
      return; // 숨겨진 노드의 자식은 탐색하지 않음
    }

    if ('children' in node) {
      for (const child of node.children) {
        findHiddenLayers(child);
      }
    }
  }

  for (const node of selection) {
    findHiddenLayers(node);
  }

  if (hiddenLayers.length === 0) {
    figma.notify('꺼진 레이어가 없습니다.', { timeout: 3000 });
    return;
  }

  // 꺼진 레이어 임시로 켜서 보여주기
  for (const layer of hiddenLayers) {
    layer.visible = true;
  }

  // 선택해서 보여주기
  figma.currentPage.selection = hiddenLayers;
  if (hiddenLayers.length > 0) {
    figma.viewport.scrollAndZoomIntoView(hiddenLayers);
  }

  // 저장
  pendingHiddenLayers = hiddenLayers;

  // UI에 확인 요청
  const layerNames = hiddenLayers.map(l => l.name).join('\n- ');
  figma.ui.postMessage({
    type: 'confirm-hidden-layers',
    data: {
      count: hiddenLayers.length,
      names: layerNames,
    },
  });
}

/**
 * 꺼진 레이어 삭제 확인
 */
function confirmDeleteHiddenLayers() {
  let deletedCount = 0;

  for (const layer of pendingHiddenLayers) {
    try {
      if (layer.parent) {
        layer.remove();
        deletedCount++;
      }
    } catch (e) {
      console.error('Delete failed:', layer.name, e);
    }
  }

  pendingHiddenLayers = [];
  figma.notify(`${deletedCount}개 레이어를 삭제했습니다.`, { timeout: 3000 });
}

/**
 * 꺼진 레이어 삭제 취소
 */
function cancelDeleteHiddenLayers() {
  // 다시 숨기기
  for (const layer of pendingHiddenLayers) {
    try {
      if (layer.parent) {
        layer.visible = false;
      }
    } catch (e) {
      // 무시
    }
  }

  pendingHiddenLayers = [];
  figma.notify('삭제가 취소되었습니다.', { timeout: 2000 });
}

/**
 * 간격 표준화 핸들러
 */
function handleStandardizeSpacing() {
  try {
    const result = standardizeSelectionSpacing();

    if (result.details && result.details.changedFrames > 0) {
      console.log('=== 간격 표준화 결과 ===');
      for (const item of result.details.allChanges) {
        console.log(`[${item.name}]`);
        for (const change of item.changes) {
          console.log(`  - ${change}`);
        }
      }
    }

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  // UI 유지 (closePlugin 제거)
}

/**
 * 네이밍 자동화 핸들러
 */
function handleAutoNaming() {
  try {
    const result = renameSelectionFrames();

    if (result.details && result.details.renamedCount > 0) {
      console.log('=== 네이밍 변경 결과 ===');
      for (const change of result.details.changes) {
        console.log(`  ${change.oldName} → ${change.newName}`);
      }
    }

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  // UI 유지 (closePlugin 제거)
}

/**
 * 컴포넌트화 핸들러 (미리보기)
 */
function handleComponentize() {
  try {
    const result = componentizeSelection({
      minOccurrences: 2,
      autoConvert: false,
    });

    if (result.details && result.details.candidatesFound > 0) {
      console.log('=== 컴포넌트 후보 ===');
      for (const candidate of result.details.candidates) {
        console.log(`  [${candidate.name}] - ${candidate.count}회 반복`);
      }
    }

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  // UI 유지 (closePlugin 제거)
}

/**
 * 컴포넌트화 실행 핸들러 (실제 변환)
 */
function handleComponentizeConvert() {
  try {
    const result = componentizeSelection({
      minOccurrences: 2,
      autoConvert: true,
    });

    if (result.details && result.details.componentsCreated > 0) {
      console.log('=== 컴포넌트화 결과 ===');
      for (const candidate of result.details.candidates) {
        console.log(`  [${candidate.name}] - ${candidate.count}회`);
      }
    }

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  // UI 유지 (closePlugin 제거)
}

/**
 * 전체 실행 핸들러
 */
function handleRunAll() {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.notify('선택된 요소가 없습니다.', { error: true });
      // UI 유지 (closePlugin 제거)
      return;
    }

    // 전처리는 제외 (수동 실행만)

    // 1. Auto Layout 적용
    const autoLayoutResult = applyAutoLayoutToSelection({
      direction: 'AUTO',
      standardizeSpacing: true,
      recursive: true,
      skipExisting: false,
    });

    // 2. 간격 표준화
    const spacingResult = standardizeSelectionSpacing();

    // 3. 네이밍 자동화
    const namingResult = renameSelectionFrames();

    // 결과 메시지
    const message = [
      'Auto Layout: ' + autoLayoutResult.count + '개',
      (spacingResult.details && spacingResult.details.changedFrames) ? '간격: ' + spacingResult.details.changedFrames + '개' : '',
      (namingResult.details && namingResult.details.renamedCount) ? '네이밍: ' + namingResult.details.renamedCount + '개' : '',
    ].filter(Boolean).join(' | ');

    figma.notify(message, { timeout: 4000 });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  // UI 유지 (closePlugin 제거)
}

/**
 * 설정 핸들러
 */
function handleSettings() {
  figma.notify('설정 UI는 추후 구현 예정입니다.', {
    timeout: 3000,
  });
  // UI 유지 (closePlugin 제거)
}

// ============================================
// Agent Server 연동 함수들
// ============================================

/**
 * 노드 스크린샷 캡처 (Base64)
 */
async function captureNodeScreenshot(node: SceneNode): Promise<string | null> {
  try {
    const bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 },
    });

    // Uint8Array to Base64
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return 'data:image/png;base64,' + figma.base64Encode(bytes);
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return null;
  }
}

/**
 * 자식 노드 위치 정보 추출
 */
function extractChildrenLayout(frame: FrameNode | GroupNode): Array<{
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}> {
  const children: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];

  for (let i = 0; i < frame.children.length; i++) {
    const child = frame.children[i];
    children.push({
      id: child.id,
      name: child.name,
      x: child.x,
      y: child.y,
      width: child.width,
      height: child.height,
    });
  }

  return children;
}

/**
 * 룰 베이스로 방향과 간격 계산
 */
function calculateDirectionAndGap(frame: FrameNode | GroupNode): {
  direction: 'HORIZONTAL' | 'VERTICAL';
  gap: number;
} {
  const children = frame.children;

  if (children.length < 2) {
    return { direction: 'VERTICAL', gap: 0 };
  }

  // 첫 두 자식으로 방향 판단
  const first = children[0];
  const second = children[1];
  const horizontalDiff = Math.abs(first.x - second.x);
  const verticalDiff = Math.abs(first.y - second.y);

  const direction = horizontalDiff > verticalDiff ? 'HORIZONTAL' : 'VERTICAL';

  // 간격 계산
  let totalGap = 0;
  let gapCount = 0;

  for (let i = 0; i < children.length - 1; i++) {
    const current = children[i];
    const next = children[i + 1];

    let gap: number;
    if (direction === 'HORIZONTAL') {
      gap = next.x - (current.x + current.width);
    } else {
      gap = next.y - (current.y + current.height);
    }

    if (gap > 0) {
      totalGap += gap;
      gapCount++;
    }
  }

  const avgGap = gapCount > 0 ? Math.round(totalGap / gapCount) : 0;

  return { direction, gap: avgGap };
}

// 현재 처리 중인 노드 저장 (결과 콜백에서 사용)
let pendingNamingNode: SceneNode | null = null;
let pendingNamingNodes: SceneNode[] = [];
let pendingAutoLayoutNode: FrameNode | null = null;

// 적용 전 스냅샷 저장 (안전 검증용)
let preAutoLayoutSnapshot: {
  width: number;
  height: number;
  childSizes: Array<{ id: string; width: number; height: number }>;
} | null = null;

/**
 * AI Auto Layout Agent 핸들러
 */
async function handleAutoLayoutAgent() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('프레임을 선택해주세요.', { error: true });
    return;
  }

  const node = selection[0];

  if (node.type !== 'FRAME' && node.type !== 'GROUP') {
    figma.notify('프레임 또는 그룹을 선택해주세요.', { error: true });
    return;
  }

  figma.notify('AI Auto Layout 분석 중...', { timeout: 2000 });

  // 스크린샷 캡처
  const screenshot = await captureNodeScreenshot(node);
  const children = extractChildrenLayout(node as FrameNode | GroupNode);

  // 룰 베이스 계산값
  const calculated = calculateDirectionAndGap(node as FrameNode | GroupNode);

  // 적용 전 스냅샷 저장 (안전 검증용)
  const frame = node as FrameNode | GroupNode;
  preAutoLayoutSnapshot = {
    width: frame.width,
    height: frame.height,
    childSizes: frame.children.map(c => ({
      id: c.id,
      width: c.width,
      height: c.height,
    })),
  };

  // 노드 저장
  pendingAutoLayoutNode = node as FrameNode;

  // UI에 Agent 요청 전송
  figma.ui.postMessage({
    type: 'agent-autolayout',
    data: {
      nodeId: node.id,
      screenshot: screenshot,
      width: node.width,
      height: node.height,
      calculatedDirection: calculated.direction,
      calculatedGap: calculated.gap,
      children: children,
    },
  });
}

/**
 * AutoLayout Agent 결과 처리
 */
function handleAutoLayoutResult(msg: AutoLayoutResultMessage) {
  if (!msg.success || !msg.data) {
    figma.notify('Auto Layout 분석 실패: ' + (msg.error || 'Unknown error'), { error: true });
    pendingAutoLayoutNode = null;
    preAutoLayoutSnapshot = null;
    return;
  }

  const node = pendingAutoLayoutNode;
  if (!node) {
    figma.notify('대상 노드를 찾을 수 없습니다.', { error: true });
    preAutoLayoutSnapshot = null;
    return;
  }

  const result = msg.data;

  // NONE인 경우 Auto Layout 적용하지 않음
  if (result.direction === 'NONE') {
    figma.notify('Auto Layout이 적합하지 않은 레이아웃입니다.', { timeout: 3000 });
    pendingAutoLayoutNode = null;
    preAutoLayoutSnapshot = null;
    return;
  }

  const direction = result.direction === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL';

  try {
    // 0. Auto Layout 적용 전에 자식들을 시각적 순서로 재정렬
    // Figma의 children은 레이어 순서(z-index)이므로 시각적 순서와 다를 수 있음
    const childrenWithPos = node.children.map(child => ({
      node: child,
      x: child.x,
      y: child.y,
    }));

    // 방향에 따라 정렬 (VERTICAL: y 기준, HORIZONTAL: x 기준)
    if (direction === 'VERTICAL') {
      childrenWithPos.sort((a, b) => a.y - b.y);
    } else {
      childrenWithPos.sort((a, b) => a.x - b.x);
    }

    // 레이어 순서 재정렬 (시각적 순서대로)
    for (let i = 0; i < childrenWithPos.length; i++) {
      const child = childrenWithPos[i].node;
      // insertChild로 순서 변경 (마지막 index = 맨 위 레이어)
      node.insertChild(i, child);
    }

    console.log('[AI AutoLayout] 자식 순서 재정렬 완료:', childrenWithPos.map(c => c.node.name).join(', '));

    // 1. Auto Layout 기본 설정
    node.layoutMode = direction;
    node.itemSpacing = result.gap || 0;

    // 2. 패딩 적용
    node.paddingTop = result.paddingTop || 0;
    node.paddingRight = result.paddingRight || 0;
    node.paddingBottom = result.paddingBottom || 0;
    node.paddingLeft = result.paddingLeft || 0;

    // 3. 기본 정렬
    node.primaryAxisAlignItems = 'MIN';
    node.counterAxisAlignItems = 'MIN';

    // 4. 컨테이너 Sizing 적용
    if (result.primaryAxisSizing === 'HUG') {
      node.primaryAxisSizingMode = 'AUTO';
    } else {
      node.primaryAxisSizingMode = 'FIXED';
    }

    if (result.counterAxisSizing === 'HUG') {
      node.counterAxisSizingMode = 'AUTO';
    } else {
      node.counterAxisSizingMode = 'FIXED';
    }

    // 5. 자식 요소 개별 Sizing 적용
    if (result.childrenSizing && result.childrenSizing.length > 0) {
      const children = node.children;
      for (const sizing of result.childrenSizing) {
        if (sizing.index < children.length) {
          const child = children[sizing.index];

          // layoutAlign 적용 (STRETCH = 교차축 FILL)
          if ('layoutAlign' in child) {
            (child as SceneNode & { layoutAlign: string }).layoutAlign = sizing.layoutAlign;
          }

          // layoutGrow 적용 (1 = 주축 FILL)
          if ('layoutGrow' in child) {
            (child as SceneNode & { layoutGrow: number }).layoutGrow = sizing.layoutGrow;
          }

          console.log('[AI AutoLayout] Child ' + sizing.index + ':', sizing.layoutAlign, 'grow=' + sizing.layoutGrow, '-', sizing.reasoning);
        }
      }
    }

    // 6. 안전 검증 - 크기 변화 확인
    if (preAutoLayoutSnapshot) {
      const widthDiff = Math.abs(node.width - preAutoLayoutSnapshot.width);
      const heightDiff = Math.abs(node.height - preAutoLayoutSnapshot.height);
      const threshold = 5; // 5px 이상 변화 시 경고

      if (widthDiff > threshold || heightDiff > threshold) {
        console.warn('[AI AutoLayout] 크기 변화 감지:',
          'width:', preAutoLayoutSnapshot.width, '→', node.width,
          'height:', preAutoLayoutSnapshot.height, '→', node.height
        );
        figma.notify('주의: 프레임 크기가 변경되었습니다 (확인 필요)', { timeout: 4000 });
      }
    }

    console.log('[AI AutoLayout]', result.reasoning);
    figma.notify('AI Auto Layout 적용 완료: ' + direction + ', gap=' + result.gap, { timeout: 3000 });

  } catch (e) {
    console.error('[AI AutoLayout] Error:', e);
    figma.notify('Auto Layout 적용 중 오류: ' + String(e), { error: true });
  }

  pendingAutoLayoutNode = null;
  preAutoLayoutSnapshot = null;
}

/**
 * AI Naming Agent 핸들러
 */
async function handleNamingAgent() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('노드를 선택해주세요.', { error: true });
    return;
  }

  // 단일 노드 vs 다중 노드
  if (selection.length === 1) {
    const node = selection[0];
    figma.notify('AI 네이밍 분석 중...', { timeout: 2000 });

    const screenshot = await captureNodeScreenshot(node);
    pendingNamingNode = node;

    figma.ui.postMessage({
      type: 'agent-naming',
      data: {
        nodeId: node.id,
        currentName: node.name,
        nodeType: node.type,
        width: node.width,
        height: node.height,
        screenshot: screenshot,
      },
    });
  } else {
    // 배치 처리
    figma.notify('AI 네이밍 분석 중... (' + selection.length + '개)', { timeout: 2000 });

    const nodes: Array<{
      nodeId: string;
      currentName: string;
      nodeType: string;
      width: number;
      height: number;
      screenshot: string | null;
    }> = [];

    pendingNamingNodes = [];

    for (let i = 0; i < selection.length; i++) {
      const node = selection[i];
      const screenshot = await captureNodeScreenshot(node);
      pendingNamingNodes.push(node);

      nodes.push({
        nodeId: node.id,
        currentName: node.name,
        nodeType: node.type,
        width: node.width,
        height: node.height,
        screenshot: screenshot,
      });
    }

    figma.ui.postMessage({
      type: 'agent-naming-batch',
      data: { nodes: nodes },
    });
  }
}

/**
 * Naming Agent 단일 결과 처리
 */
function handleNamingResult(msg: NamingResultMessage) {
  if (!msg.success || !msg.data) {
    figma.notify('네이밍 분석 실패: ' + (msg.error || 'Unknown error'), { error: true });
    pendingNamingNode = null;
    return;
  }

  const node = pendingNamingNode;
  if (!node) {
    figma.notify('대상 노드를 찾을 수 없습니다.', { error: true });
    return;
  }

  const result = msg.data;
  const oldName = node.name;
  node.name = result.suggestedName;

  console.log('[AI Naming]', oldName, '→', result.suggestedName);
  console.log('[AI Naming] Confidence:', result.confidence, ', Reasoning:', result.reasoning);

  figma.notify('이름 변경: ' + oldName + ' → ' + result.suggestedName, { timeout: 3000 });

  pendingNamingNode = null;
}

/**
 * Naming Agent 배치 결과 처리
 */
function handleNamingBatchResult(msg: NamingBatchResultMessage) {
  if (!msg.success || !msg.results) {
    figma.notify('배치 네이밍 분석 실패: ' + (msg.error || 'Unknown error'), { error: true });
    pendingNamingNodes = [];
    return;
  }

  let renamedCount = 0;

  for (let i = 0; i < msg.results.length; i++) {
    const result = msg.results[i];
    const node = pendingNamingNodes[i];

    if (result && result.success && result.data && node) {
      const oldName = node.name;
      node.name = result.data.suggestedName;
      console.log('[AI Naming]', oldName, '→', result.data.suggestedName);
      renamedCount++;
    }
  }

  figma.notify('AI 네이밍 완료: ' + renamedCount + '개 이름 변경', { timeout: 3000 });

  pendingNamingNodes = [];
}

/**
 * 전체 실행 (Agent 포함)
 */
async function handleRunAllAgent() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('선택된 요소가 없습니다.', { error: true });
    return;
  }

  figma.notify('AI 파이프라인 실행 중...', { timeout: 2000 });

  // 전처리는 제외 (수동 실행만)

  // 1. AI 네이밍 (Agent) - 먼저 실행
  await handleNamingAgent();

  // 2. AI Auto Layout (Agent)
  await handleAutoLayoutAgent();

  // 3. 간격 표준화 (Rule-based)
  const spacingResult = standardizeSelectionSpacing();
  console.log('[Pipeline] Spacing:', spacingResult.message);

  figma.notify('AI 파이프라인 완료', { timeout: 3000 });
}
