/**
 * 컴포넌트화 모듈
 *
 * 역할:
 * - 2회 이상 반복 사용되는 요소 자동 감지
 * - Component로 변환 및 네이밍 적용
 */

// Note: Rule-based naming 함수들이 삭제됨. 간단한 폴백 로직 사용.
function getSimpleComponentName(node: FrameNode): string {
  // 이미 시맨틱 이름이 있으면 사용
  if (node.name.includes('/')) {
    return node.name;
  }
  // 그렇지 않으면 Component/Frame 형식으로 반환
  return `Component/${node.name}`;
}

/**
 * 프레임의 구조적 시그니처 생성
 * 유사한 프레임을 그룹화하기 위한 해시
 */
function generateStructureSignature(node: FrameNode): string {
  const parts: string[] = [];

  // 기본 속성
  parts.push(`w:${Math.round(node.width)}`);
  parts.push(`h:${Math.round(node.height)}`);
  parts.push(`layout:${node.layoutMode}`);

  // cornerRadius
  if (typeof node.cornerRadius === 'number') {
    parts.push(`radius:${node.cornerRadius}`);
  }

  // 자식 구조
  const childTypes = node.children.map(c => c.type).sort().join(',');
  parts.push(`children:${childTypes}`);

  // 자식 개수
  parts.push(`count:${node.children.length}`);

  // fills 타입
  if (Array.isArray(node.fills)) {
    const fillTypes = node.fills
      .filter(f => f.visible !== false)
      .map(f => f.type)
      .join(',');
    parts.push(`fills:${fillTypes}`);
  }

  return parts.join('|');
}

/**
 * 더 상세한 유사도 비교
 */
function areFramesSimilar(a: FrameNode, b: FrameNode, tolerance = 5): boolean {
  // 크기 비교 (tolerance 허용)
  if (Math.abs(a.width - b.width) > tolerance) return false;
  if (Math.abs(a.height - b.height) > tolerance) return false;

  // layoutMode 비교
  if (a.layoutMode !== b.layoutMode) return false;

  // 자식 개수 비교
  if (a.children.length !== b.children.length) return false;

  // 자식 타입 비교
  const aChildTypes = a.children.map(c => c.type).sort().join(',');
  const bChildTypes = b.children.map(c => c.type).sort().join(',');
  if (aChildTypes !== bChildTypes) return false;

  // cornerRadius 비교
  const aRadius = typeof a.cornerRadius === 'number' ? a.cornerRadius : 0;
  const bRadius = typeof b.cornerRadius === 'number' ? b.cornerRadius : 0;
  if (Math.abs(aRadius - bRadius) > tolerance) return false;

  return true;
}

/**
 * 프레임들을 유사한 그룹으로 분류
 */
function groupSimilarFrames(frames: FrameNode[]): Map<string, FrameNode[]> {
  const groups = new Map<string, FrameNode[]>();

  for (const frame of frames) {
    const signature = generateStructureSignature(frame);
    const existing = groups.get(signature);

    if (existing) {
      // 첫 번째 프레임과 실제로 유사한지 추가 검증
      if (areFramesSimilar(existing[0], frame)) {
        existing.push(frame);
      } else {
        // 새로운 그룹 생성 (시그니처에 id 추가)
        groups.set(`${signature}:${frame.id}`, [frame]);
      }
    } else {
      groups.set(signature, [frame]);
    }
  }

  return groups;
}

/**
 * 모든 프레임 수집 (재귀)
 */
function collectAllFrames(node: SceneNode): FrameNode[] {
  const frames: FrameNode[] = [];

  function traverse(n: SceneNode) {
    if (n.type === 'FRAME') {
      frames.push(n);
      for (const child of n.children) {
        traverse(child);
      }
    } else if ('children' in n) {
      for (const child of (n as ChildrenMixin).children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return frames;
}

/**
 * 컴포넌트화 후보 탐지
 */
export function detectComponentCandidates(
  node: SceneNode,
  minOccurrences = 2
): {
  candidates: {
    signature: string;
    componentType: string;
    suggestedName: string;
    frames: FrameNode[];
    count: number;
  }[];
  totalFrames: number;
} {
  const allFrames = collectAllFrames(node);
  const groups = groupSimilarFrames(allFrames);

  const candidates: {
    signature: string;
    componentType: string;
    suggestedName: string;
    frames: FrameNode[];
    count: number;
  }[] = [];

  for (const [signature, frames] of groups) {
    if (frames.length >= minOccurrences) {
      // 대표 프레임으로 이름 결정
      const representative = frames[0];
      const suggestedName = getSimpleComponentName(representative);

      candidates.push({
        signature,
        componentType: 'Component', // 간단히 Component로 통일
        suggestedName,
        frames,
        count: frames.length,
      });
    }
  }

  // 반복 횟수로 정렬 (많은 순)
  candidates.sort((a, b) => b.count - a.count);

  return {
    candidates,
    totalFrames: allFrames.length,
  };
}

/**
 * 프레임을 컴포넌트로 변환
 */
export function convertToComponent(frame: FrameNode, name: string): ComponentNode {
  // 기존 위치 저장
  const parent = frame.parent;
  const index = parent && 'children' in parent
    ? parent.children.indexOf(frame)
    : 0;

  // 컴포넌트 생성
  const component = figma.createComponent();

  // 속성 복사
  component.resize(frame.width, frame.height);
  component.x = frame.x;
  component.y = frame.y;
  component.name = name;

  // 레이아웃 속성 복사
  if (frame.layoutMode !== 'NONE') {
    component.layoutMode = frame.layoutMode;
    component.primaryAxisSizingMode = frame.primaryAxisSizingMode;
    component.counterAxisSizingMode = frame.counterAxisSizingMode;
    component.primaryAxisAlignItems = frame.primaryAxisAlignItems;
    component.counterAxisAlignItems = frame.counterAxisAlignItems;
    component.itemSpacing = frame.itemSpacing;
    component.paddingTop = frame.paddingTop;
    component.paddingRight = frame.paddingRight;
    component.paddingBottom = frame.paddingBottom;
    component.paddingLeft = frame.paddingLeft;
  }

  // 스타일 복사
  component.fills = frame.fills;
  component.strokes = frame.strokes;
  component.strokeWeight = frame.strokeWeight;
  component.strokeAlign = frame.strokeAlign;
  component.effects = frame.effects;

  if (typeof frame.cornerRadius === 'number') {
    component.cornerRadius = frame.cornerRadius;
  } else {
    component.topLeftRadius = frame.topLeftRadius;
    component.topRightRadius = frame.topRightRadius;
    component.bottomLeftRadius = frame.bottomLeftRadius;
    component.bottomRightRadius = frame.bottomRightRadius;
  }

  component.clipsContent = frame.clipsContent;

  // 자식 이동
  const children = frame.children.slice();
  for (const child of children) {
    component.appendChild(child);
  }

  // 원본 프레임을 인스턴스로 교체
  if (parent && 'insertChild' in parent) {
    parent.insertChild(index, component);
  }

  // 원본 삭제
  frame.remove();

  return component;
}

/**
 * 선택된 요소에서 컴포넌트 후보를 찾아 변환
 */
export function componentizeSelection(options: {
  minOccurrences?: number;
  autoConvert?: boolean;
} = {}): {
  success: boolean;
  message: string;
  details?: {
    candidatesFound: number;
    componentsCreated: number;
    instancesCreated: number;
    candidates: {
      name: string;
      count: number;
    }[];
  };
} {
  const { minOccurrences = 2, autoConvert = false } = options;

  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return {
      success: false,
      message: '선택된 요소가 없습니다.',
    };
  }

  // 모든 선택 노드에서 후보 수집
  let allCandidates: {
    signature: string;
    componentType: string;
    suggestedName: string;
    frames: FrameNode[];
    count: number;
  }[] = [];

  for (const node of selection) {
    const result = detectComponentCandidates(node, minOccurrences);
    allCandidates = allCandidates.concat(result.candidates);
  }

  if (allCandidates.length === 0) {
    return {
      success: true,
      message: `${minOccurrences}회 이상 반복되는 요소가 없습니다.`,
      details: {
        candidatesFound: 0,
        componentsCreated: 0,
        instancesCreated: 0,
        candidates: [],
      },
    };
  }

  // 자동 변환 모드
  if (autoConvert) {
    let componentsCreated = 0;
    let instancesCreated = 0;
    const convertedCandidates: { name: string; count: number }[] = [];

    for (const candidate of allCandidates) {
      // 첫 번째 프레임을 컴포넌트로 변환
      const mainFrame = candidate.frames[0];
      const component = convertToComponent(mainFrame, candidate.suggestedName);
      componentsCreated++;

      // 나머지 프레임을 인스턴스로 교체
      for (let i = 1; i < candidate.frames.length; i++) {
        const frame = candidate.frames[i];
        const parent = frame.parent;
        const index = parent && 'children' in parent
          ? parent.children.indexOf(frame)
          : 0;

        // 인스턴스 생성
        const instance = component.createInstance();
        instance.x = frame.x;
        instance.y = frame.y;

        // 삽입 및 원본 삭제
        if (parent && 'insertChild' in parent) {
          parent.insertChild(index, instance);
        }
        frame.remove();
        instancesCreated++;
      }

      convertedCandidates.push({
        name: candidate.suggestedName,
        count: candidate.count,
      });
    }

    return {
      success: true,
      message: `${componentsCreated}개 컴포넌트 생성, ${instancesCreated}개 인스턴스로 교체됨`,
      details: {
        candidatesFound: allCandidates.length,
        componentsCreated,
        instancesCreated,
        candidates: convertedCandidates,
      },
    };
  }

  // 미리보기 모드 (변환 없음)
  return {
    success: true,
    message: `${allCandidates.length}개의 컴포넌트 후보를 찾았습니다.`,
    details: {
      candidatesFound: allCandidates.length,
      componentsCreated: 0,
      instancesCreated: 0,
      candidates: allCandidates.map(c => ({
        name: c.suggestedName,
        count: c.count,
      })),
    },
  };
}

/**
 * 컴포넌트 후보 리포트 생성
 */
export function generateComponentReport(node: SceneNode): string {
  const result = detectComponentCandidates(node);

  if (result.candidates.length === 0) {
    return '반복되는 요소가 없습니다.';
  }

  const lines: string[] = [
    '=== 컴포넌트 후보 리포트 ===',
    `총 프레임 수: ${result.totalFrames}`,
    `후보 그룹 수: ${result.candidates.length}`,
    '',
  ];

  for (const candidate of result.candidates) {
    lines.push(`[${candidate.suggestedName}] - ${candidate.count}회 반복`);
    lines.push(`  타입: ${candidate.componentType}`);
    lines.push(`  대표 크기: ${candidate.frames[0].width} x ${candidate.frames[0].height}`);
    lines.push('');
  }

  return lines.join('\n');
}
