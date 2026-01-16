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

// Rule-based Auto Layout은 삭제됨 - AI Auto Layout만 사용

import {
  standardizeSelectionSpacing,
} from './modules/spacing';

import {
  cleanupSelectionWrappers,
  flattenSelectionSameNameWrappers,
  cleanupSelectionWrappersAggressive,
  convertSelectionGroupsToFrames,
  collectSelectionMergeCandidates,
  flattenSelectedCandidates,
} from './modules/cleanup';

// Note: modules/naming 함수들은 naming/ 모듈을 통해 간접 사용
// 직접 import는 필요 없음 (handler.ts, direct.ts에서 사용)

import {
  componentizeSelection,
} from './modules/componentize';

import {
  handleNamingAgent,
  handleNamingResult,
  handleNamingBatchResult,
  handleNamingContextResult,
  NamingResultMessage,
  NamingBatchResultMessage,
  NamingContextResultMessage,
} from './naming';

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
    // apply-autolayout은 삭제됨 - apply-autolayout-agent 사용

    case 'standardize-spacing':
      handleStandardizeSpacing();
      break;

    case 'cleanup-wrappers-ai':
      handleCleanupWrappersAI();
      break;

    case 'convert-groups-to-frames':
      handleConvertGroupsToFrames();
      break;

    case 'flatten-same-name':
      handleFlattenSameName();
      break;

    case 'collect-merge-candidates':
      handleCollectMergeCandidates();
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

    // auto-naming은 삭제됨 - auto-naming-agent 사용

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

// Agent 결과 타입 정의 (Naming 타입은 naming/ 모듈에서 import)

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
  // confirm-delete-hidden은 selectedIds 포함하므로 특별 처리
  if (msg.type === 'confirm-delete-hidden') {
    const selectedIds = (msg as { type: string; selectedIds?: string[] }).selectedIds;
    confirmDeleteHiddenLayers(selectedIds);
    return;
  }

  // 체크박스 변경 시 Figma 선택 상태 동기화
  if (msg.type === 'update-hidden-selection') {
    const selectedIds = (msg as { type: string; selectedIds?: string[] }).selectedIds || [];
    updateHiddenLayerSelection(selectedIds);
    return;
  }

  // 병합 후보 선택 동기화 (꺼진 레이어 삭제와 동일 방식)
  if (msg.type === 'update-merge-selection') {
    const selectedIds = (msg as { type: string; selectedIds?: string[] }).selectedIds || [];
    updateMergeNodeSelection(selectedIds);
    return;
  }

  // 병합 실행
  if (msg.type === 'execute-merge') {
    const { parentIds } = msg as { type: string; parentIds: string[] };
    console.log('[handleUIMessage] execute-merge received:', parentIds);
    handleExecuteMerge(parentIds);
    return;
  }

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

    case 'naming-context-result':
      handleNamingContextResult(msg as NamingContextResultMessage);
      break;

    case 'autolayout-result':
      handleAutoLayoutResult(msg as AutoLayoutResultMessage);
      break;
  }
}

// Rule-based handleApplyAutoLayout은 삭제됨 - AI Auto Layout만 사용

/**
 * 의미 없는 래퍼 제거 핸들러
 */
/**
 * 래퍼 제거 핸들러
 */
function handleCleanupWrappersAI() {
  figma.ui.postMessage({ type: 'task-start', taskName: '공격적 래퍼 제거 중...' });

  try {
    const result = cleanupSelectionWrappersAggressive();

    if (result.details) {
      if (result.details.removed > 0) {
        console.log('=== 공격적 래퍼 제거 결과 ===');
        for (const name of result.details.removedNames) {
          console.log(`  - ${name}`);
        }
      }
      if (result.details.outOfBoundsRemoved > 0) {
        console.log(`=== 범위 밖 요소 ${result.details.outOfBoundsRemoved}개 제거 ===`);
      }
    }

    figma.notify(result.message, {
      timeout: 4000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  figma.ui.postMessage({ type: 'task-complete' });
}

/**
 * 동일 이름 중첩 레이어 병합 핸들러 (AI 검증 포함)
 */
async function handleFlattenSameName() {
  figma.ui.postMessage({ type: 'task-start', taskName: '중첩 레이어 병합 중 (AI 검증)...' });

  try {
    const result = await flattenSelectionSameNameWrappers(true);

    if (result.details && result.details.flattenedCount > 0) {
      console.log('=== 중첩 레이어 병합 결과 ===');
      for (const name of result.details.flattenedNames) {
        console.log(`  - ${name}`);
      }
      if (result.details.aiValidatedCount > 0) {
        console.log(`AI 검증: ${result.details.aiValidatedCount}개`);
      }
    }

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  figma.ui.postMessage({ type: 'task-complete' });
}

/**
 * 병합 후보 수집 핸들러 (Human-in-the-loop)
 * - 중첩 레이어 병합 버튼 클릭 시 호출
 * - 후보 목록을 UI로 전달하여 사용자가 선택
 */
async function handleCollectMergeCandidates() {
  figma.ui.postMessage({ type: 'task-start', taskName: '병합 후보 수집 중...' });

  try {
    const result = collectSelectionMergeCandidates();

    if (!result.success) {
      figma.notify(result.message || '병합 후보 수집 실패', { error: true });
      figma.ui.postMessage({ type: 'task-complete' });
      return;
    }

    if (result.candidates.length === 0) {
      figma.notify('병합할 중첩 체인이 없습니다.');
      figma.ui.postMessage({ type: 'task-complete' });
      return;
    }

    // 노드들을 저장 (체크박스 선택 동기화용) - getNodeByIdAsync 사용
    pendingMergeNodes = [];
    for (const candidate of result.candidates) {
      const node = await figma.getNodeByIdAsync(candidate.id);
      if (node && 'parent' in node) {
        pendingMergeNodes.push(node as SceneNode);
      }
    }

    // UI로 후보 목록 전달
    figma.ui.postMessage({
      type: 'merge-candidates',
      candidates: result.candidates,
    });

    // 초기 선택 상태 설정 (모두 선택)
    figma.currentPage.selection = pendingMergeNodes;

    figma.notify(`${result.candidates.length}개 병합 후보 발견. 선택 후 실행하세요.`);
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  figma.ui.postMessage({ type: 'task-complete' });
}

/**
 * 선택된 병합 실행 핸들러 (Human-in-the-loop)
 */
async function handleExecuteMerge(selectedIds: string[]) {
  figma.ui.postMessage({ type: 'task-start', taskName: '중첩 레이어 병합 중 (AI 검증)...' });

  try {
    console.log('[Execute Merge] selectedIds:', selectedIds);

    if (!selectedIds || selectedIds.length === 0) {
      figma.notify('선택된 후보가 없습니다.', { error: true });
      figma.ui.postMessage({ type: 'task-complete' });
      return;
    }

    // AI 검증 포함 병합 실행
    const result = await flattenSelectedCandidates(selectedIds, true);

    console.log('[Execute Merge] result:', result);

    if (result.details) {
      console.log('=== 중첩 레이어 병합 결과 ===');
      for (const name of result.details.flattenedNames) {
        console.log(`  - ${name}`);
      }
    }

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });

    // 결과 전달 - 후보 목록 닫기
    figma.ui.postMessage({
      type: 'merge-result',
      success: result.success,
      flattenedCount: result.details?.flattenedCount || 0,
    });
  } catch (e) {
    console.log('[Execute Merge] error:', e);
    figma.notify(`오류: ${e}`, { error: true });
  }

  figma.ui.postMessage({ type: 'task-complete' });
}

/**
 * 체크박스 선택에 따라 병합 후보 노드 선택 업데이트 (꺼진 레이어 삭제와 동일 방식)
 */
function updateMergeNodeSelection(selectedIds: string[]) {
  const selectedSet = new Set(selectedIds);
  const selectedNodes: SceneNode[] = [];

  for (const node of pendingMergeNodes) {
    if (selectedSet.has(node.id)) {
      selectedNodes.push(node);
    }
  }

  // Figma 선택 상태 업데이트
  figma.currentPage.selection = selectedNodes;
}

/**
 * GROUP → FRAME 변환 핸들러
 */
function handleConvertGroupsToFrames() {
  figma.ui.postMessage({ type: 'task-start', taskName: 'GROUP → FRAME 변환 중...' });

  try {
    const result = convertSelectionGroupsToFrames();

    if (result.converted > 0) {
      console.log(`=== GROUP → FRAME 변환 결과: ${result.converted}개 ===`);
    }

    figma.notify(result.message, {
      timeout: 3000,
      error: !result.success,
    });
  } catch (e) {
    figma.notify(`오류: ${e}`, { error: true });
  }

  figma.ui.postMessage({ type: 'task-complete' });
}

/**
 * 컴포넌트 브레이크 (일반 프레임으로 전환)
 * - detachInstance() 후 원래 인스턴스 크기 유지
 * - 모든 자식 노드도 함께 스케일링
 */
function handleDetachComponents() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('프레임을 선택해주세요.', { error: true });
    return;
  }

  figma.ui.postMessage({ type: 'task-start', taskName: '컴포넌트 브레이크 중...' });

  let detachedCount = 0;
  let scaledCount = 0;
  let cleanedCount = 0;

  /**
   * 부모보다 큰 보조 레이어 정리 및 크기 초과 자식 스케일링
   * - Ratio, Constraints 등 반응형 보조 레이어 제거
   * - 부모 bounds를 초과하는 빈 프레임 제거
   * - 원본 크기를 초과하는 자식은 스케일링
   */
  function cleanupAndScaleOversizedChildren(parent: FrameNode, targetWidth: number, targetHeight: number): { removed: number; scaled: number } {
    let removed = 0;
    let scaled = 0;

    // 보조 레이어 이름 패턴 (삭제 대상)
    const auxiliaryPatterns = ['Ratio', 'Constraints', 'Spacer', 'Placeholder'];

    // children 복사본으로 순회 (삭제 중 변경되므로)
    for (const child of [...parent.children]) {
      // 1. 보조 레이어 이름 패턴 체크
      const isAuxiliaryLayer = auxiliaryPatterns.some(pattern =>
        child.name === pattern || child.name.startsWith(pattern + '/')
      );

      // 2. 원본 크기 초과 여부 체크 (targetWidth/Height 기준)
      const exceedsTarget = child.width > targetWidth + 2 || child.height > targetHeight + 2;

      // 3. 빈 프레임 여부 체크 (자식 없고 스타일 없음)
      let isEmptyFrame = false;
      if (child.type === 'FRAME') {
        const frame = child as FrameNode;
        const hasChildren = frame.children.length > 0;
        const fills = frame.fills;
        const hasFills = Array.isArray(fills) && fills.length > 0 &&
                        fills.some(f => f.visible !== false);
        const hasStrokes = frame.strokes.length > 0;
        isEmptyFrame = !hasChildren && !hasFills && !hasStrokes;
      }

      // 보조 레이어이면서 타겟 초과하면 삭제
      if (isAuxiliaryLayer && exceedsTarget) {
        console.log(`[Cleanup] 보조 레이어 삭제: ${child.name} (${child.width}x${child.height} > ${targetWidth}x${targetHeight})`);
        child.remove();
        removed++;
        continue;
      }

      // 빈 프레임이면서 타겟 초과하면 삭제
      if (isEmptyFrame && exceedsTarget) {
        console.log(`[Cleanup] 빈 프레임 삭제: ${child.name} (${child.width}x${child.height})`);
        child.remove();
        removed++;
        continue;
      }

      // 타겟 크기를 초과하는 일반 자식은 스케일링
      if (exceedsTarget && 'resize' in child) {
        const scaleX = child.width > targetWidth ? targetWidth / child.width : 1;
        const scaleY = child.height > targetHeight ? targetHeight / child.height : 1;
        const scale = Math.min(scaleX, scaleY); // 비율 유지를 위해 작은 값 사용

        console.log(`[Cleanup] 크기 초과 자식 스케일링: ${child.name} (${child.width}x${child.height} → scale ${scale.toFixed(3)})`);

        // 스케일링 적용
        scaleNodeRecursively(child, scale, scale);
        scaled++;
      }

      // 재귀적으로 자식도 정리 (타겟 크기는 자식 기준으로)
      if (child.type === 'FRAME' && 'children' in child) {
        const childResult = cleanupAndScaleOversizedChildren(
          child as FrameNode,
          child.width,
          child.height
        );
        removed += childResult.removed;
        scaled += childResult.scaled;
      }
    }

    return { removed, scaled };
  }

  /**
   * 노드와 모든 자식을 스케일링 (constraints 해제 포함)
   */
  function scaleNodeRecursively(node: SceneNode, scaleX: number, scaleY: number): void {
    // constraints 해제 (프레임인 경우)
    if (node.type === 'FRAME') {
      const frame = node as FrameNode;
      // Auto Layout 해제
      if (frame.layoutMode !== 'NONE') {
        frame.layoutMode = 'NONE';
      }
    }

    // 위치 스케일링
    if ('x' in node) {
      node.x = node.x * scaleX;
      node.y = node.y * scaleY;
    }

    // 크기 스케일링 (resize 가능한 노드만)
    if ('resize' in node) {
      const newWidth = node.width * scaleX;
      const newHeight = node.height * scaleY;
      if (newWidth > 0.01 && newHeight > 0.01) {
        try {
          (node as FrameNode).resize(newWidth, newHeight);
        } catch (e) {
          console.log(`[Scale] resize 실패: ${node.name}`, e);
        }
      }
    }

    // 자식이 있으면 재귀 처리
    if ('children' in node) {
      for (const child of [...(node as FrameNode).children]) {
        scaleNodeRecursively(child, scaleX, scaleY);
      }
    }
  }

  function detachRecursively(node: SceneNode): void {
    // 인스턴스인 경우 detach
    if (node.type === 'INSTANCE') {
      try {
        // 1. 원래 크기/위치/clipsContent 저장
        const originalWidth = node.width;
        const originalHeight = node.height;
        const originalX = node.x;
        const originalY = node.y;
        const originalClipsContent = node.clipsContent;

        console.log(`[Detach] 시작: ${node.name} (원래 크기: ${originalWidth}x${originalHeight}, clips: ${originalClipsContent})`);

        // 2. detachInstance()는 새 FrameNode를 반환
        const detachedFrame = node.detachInstance();
        detachedCount++;

        console.log(`[Detach] 완료: ${detachedFrame.name} (detach 후 크기: ${detachedFrame.width}x${detachedFrame.height})`);

        // 3. 크기가 변경되었으면 스케일링으로 복원
        if (detachedFrame) {
          const widthDiff = Math.abs(detachedFrame.width - originalWidth);
          const heightDiff = Math.abs(detachedFrame.height - originalHeight);

          if (widthDiff > 1 || heightDiff > 1) {
            const scaleX = originalWidth / detachedFrame.width;
            const scaleY = originalHeight / detachedFrame.height;

            console.log(`[Detach] 스케일링 필요: ${detachedFrame.name} (scale: ${scaleX.toFixed(3)}x${scaleY.toFixed(3)})`);

            // 프레임 Auto Layout 먼저 해제
            if (detachedFrame.layoutMode !== 'NONE') {
              console.log(`[Detach] Auto Layout 해제: ${detachedFrame.layoutMode}`);
              detachedFrame.layoutMode = 'NONE';
            }

            // 모든 자식 노드 스케일링
            for (const child of [...detachedFrame.children]) {
              scaleNodeRecursively(child, scaleX, scaleY);
            }

            // 프레임 자체 크기 조정
            try {
              detachedFrame.resize(originalWidth, originalHeight);
              console.log(`[Detach] 프레임 resize 완료: ${detachedFrame.width}x${detachedFrame.height}`);
              scaledCount++;
            } catch (e) {
              console.error(`[Detach] 프레임 resize 실패:`, e);
            }
          }

          // 위치 복원
          detachedFrame.x = originalX;
          detachedFrame.y = originalY;

          // clipsContent 복원 (중요: 자식이 부모보다 클 때 잘리도록)
          if (originalClipsContent !== undefined) {
            detachedFrame.clipsContent = originalClipsContent;
            console.log(`[Detach] clipsContent 복원: ${originalClipsContent}`);
          }

          // 원본 크기 기준으로 보조 레이어 정리 및 크기 초과 자식 스케일링
          // Auto Layout 먼저 해제 (HUG 방지)
          if (detachedFrame.layoutMode !== 'NONE') {
            console.log(`[Detach] Cleanup 전 Auto Layout 해제: ${detachedFrame.layoutMode}`);
            detachedFrame.layoutMode = 'NONE';
          }

          const cleanupResult = cleanupAndScaleOversizedChildren(detachedFrame, originalWidth, originalHeight);
          if (cleanupResult.removed > 0) {
            cleanedCount += cleanupResult.removed;
            console.log(`[Detach] ${cleanupResult.removed}개 보조 레이어 정리됨`);
          }
          if (cleanupResult.scaled > 0) {
            scaledCount += cleanupResult.scaled;
            console.log(`[Detach] ${cleanupResult.scaled}개 자식 스케일링됨`);
          }

          // 최종 크기 검증 및 복원
          const finalWidth = detachedFrame.width;
          const finalHeight = detachedFrame.height;
          if (Math.abs(finalWidth - originalWidth) > 1 || Math.abs(finalHeight - originalHeight) > 1) {
            console.log(`[Detach] 최종 크기 복원: ${finalWidth}x${finalHeight} → ${originalWidth}x${originalHeight}`);
            try {
              detachedFrame.resize(originalWidth, originalHeight);
            } catch (e) {
              console.error(`[Detach] 최종 resize 실패:`, e);
            }
          }

          // 반환된 프레임의 자식들도 재귀 탐색 (중첩 인스턴스 처리)
          if ('children' in detachedFrame) {
            for (const child of [...detachedFrame.children]) {
              detachRecursively(child);
            }
          }
        }
        return; // 이미 자식 처리했으므로 종료
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
    let msg = `${detachedCount}개 인스턴스 전환`;
    if (scaledCount > 0) {
      msg += `, ${scaledCount}개 크기 복원`;
    }
    if (cleanedCount > 0) {
      msg += `, ${cleanedCount}개 보조 레이어 정리`;
    }
    figma.notify(msg, { timeout: 3000 });
  } else {
    figma.notify('전환할 컴포넌트 인스턴스가 없습니다.', { timeout: 3000 });
  }

  figma.ui.postMessage({ type: 'task-complete' });
}

// 꺼진 레이어 저장용
let pendingHiddenLayers: SceneNode[] = [];

// 병합 후보 노드 저장용
let pendingMergeNodes: SceneNode[] = [];

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

  // UI에 확인 요청 (id, name 배열 전송)
  figma.ui.postMessage({
    type: 'confirm-hidden-layers',
    data: {
      count: hiddenLayers.length,
      layers: hiddenLayers.map(l => ({ id: l.id, name: l.name })),
    },
  });
}

/**
 * 꺼진 레이어 삭제 확인 (선택된 ID만)
 */
function confirmDeleteHiddenLayers(selectedIds?: string[]) {
  let deletedCount = 0;
  const idsToDelete = selectedIds ? new Set(selectedIds) : null;

  for (const layer of pendingHiddenLayers) {
    try {
      // selectedIds가 없으면 전체, 있으면 선택된 것만 삭제
      const shouldDelete = !idsToDelete || idsToDelete.has(layer.id);

      if (shouldDelete && layer.parent) {
        layer.remove();
        deletedCount++;
      } else if (!shouldDelete && layer.parent) {
        // 선택되지 않은 레이어는 다시 숨김
        layer.visible = false;
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
 * 체크박스 선택에 따라 Figma 선택 상태 업데이트
 */
function updateHiddenLayerSelection(selectedIds: string[]) {
  const selectedSet = new Set(selectedIds);
  const selectedNodes: SceneNode[] = [];

  for (const layer of pendingHiddenLayers) {
    if (selectedSet.has(layer.id)) {
      selectedNodes.push(layer);
    }
  }

  // Figma 선택 상태 업데이트
  figma.currentPage.selection = selectedNodes;

  // 선택된 노드가 있으면 뷰포트 이동
  if (selectedNodes.length > 0) {
    figma.viewport.scrollAndZoomIntoView(selectedNodes);
  }
}

/**
 * 간격 표준화 핸들러
 */
function handleStandardizeSpacing() {
  figma.ui.postMessage({ type: 'task-start', taskName: '간격 표준화 중...' });

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

  figma.ui.postMessage({ type: 'task-complete' });
}

// Rule-based 네이밍은 삭제됨 - AI 네이밍만 사용

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
 * 전체 실행 핸들러 (레거시 - Agent 버전으로 리다이렉트)
 */
function handleRunAll() {
  // Rule-based 버전은 삭제됨 - AI Agent 버전으로 리다이렉트
  figma.notify('AI Agent 파이프라인으로 실행됩니다.', { timeout: 2000 });
  handleRunAllAgent();
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
 * 노드 스크린샷 캡처 (Base64) - 개별 노드용 (AutoLayout에서 사용)
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

// Note: 컨텍스트 기반 네이밍 유틸은 naming/ 모듈로 이동

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
// Note: pendingNamingNode, pendingNamingNodes는 naming/ 모듈로 이동
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

  figma.ui.postMessage({ type: 'task-start', taskName: 'AI Auto Layout 분석 중...' });

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
    figma.ui.postMessage({ type: 'task-complete' });
    pendingAutoLayoutNode = null;
    preAutoLayoutSnapshot = null;
    return;
  }

  const node = pendingAutoLayoutNode;
  if (!node) {
    figma.notify('대상 노드를 찾을 수 없습니다.', { error: true });
    figma.ui.postMessage({ type: 'task-complete' });
    preAutoLayoutSnapshot = null;
    return;
  }

  const result = msg.data;

  // NONE인 경우 Auto Layout 적용하지 않음
  if (result.direction === 'NONE') {
    figma.notify('Auto Layout이 적합하지 않은 레이아웃입니다.', { timeout: 3000 });
    figma.ui.postMessage({ type: 'task-complete' });
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

  figma.ui.postMessage({ type: 'task-complete' });
  pendingAutoLayoutNode = null;
  preAutoLayoutSnapshot = null;
}

// Note: tryDirectNaming, collectAllNodes는 naming/ 모듈로 이동

// Note: handleNamingAgent, handleNamingResult, handleNamingBatchResult, handleNamingContextResult는 naming/ 모듈에서 import

/**
 * 전체 실행 (Agent 포함)
 */
async function handleRunAllAgent() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('선택된 요소가 없습니다.', { error: true });
    return;
  }

  // 파이프라인 시작 - UI에 단계 목록 전송
  const steps = ['래퍼 제거', '컴포넌트 브레이크', 'AI 네이밍', 'AI Auto Layout', '간격 표준화'];
  figma.ui.postMessage({ type: 'pipeline-start', steps });

  // 1. 래퍼 제거
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 0, status: 'active' });
  handleCleanupWrappers();
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 0, status: 'completed' });

  // 2. 컴포넌트 브레이크
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 1, status: 'active' });
  handleDetachComponents();
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 1, status: 'completed' });

  // 3. AI 네이밍
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 2, status: 'active' });
  await handleNamingAgent();
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 2, status: 'completed' });

  // 4. AI Auto Layout
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 3, status: 'active' });
  await handleAutoLayoutAgent();
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 3, status: 'completed' });

  // 5. 간격 표준화
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 4, status: 'active' });
  const spacingResult = standardizeSelectionSpacing();
  console.log('[Pipeline] Spacing:', spacingResult.message);
  figma.ui.postMessage({ type: 'pipeline-step', stepIndex: 4, status: 'completed' });

  // 완료
  figma.ui.postMessage({ type: 'pipeline-complete' });
  figma.notify('AI 파이프라인 완료', { timeout: 3000 });
}

