/**
 * 네이밍 자동화 모듈
 *
 * 역할:
 * - 프레임 구조/내용 분석하여 시맨틱 이름 추론
 * - 컨벤션: Component/Variant/Size
 */

import { colors, componentSize } from '../../config/tokens';

// 컴포넌트 타입 정의
type ComponentType =
  | 'Button'
  | 'Input'
  | 'Avatar'
  | 'Icon'
  | 'Card'
  | 'ListItem'
  | 'Tab'
  | 'Toggle'
  | 'Checkbox'
  | 'Badge'
  | 'BottomSheet'
  | 'Modal'
  | 'Header'
  | 'Container'
  | 'Frame';

// 사이즈 타입
type SizeType = 'XS' | 'SM' | 'MD' | 'LG' | 'XL' | 'Full';

// Variant 타입
type VariantType = 'Primary' | 'Secondary' | 'Tertiary' | 'Outline' | 'Ghost' | 'Default';

/**
 * 프레임이 버튼인지 판단
 */
function isButton(node: FrameNode): boolean {
  // 조건: 텍스트 포함, 특정 높이 범위, 배경색 있음
  const hasText = node.children.some(c => c.type === 'TEXT');
  const height = node.height;
  const buttonHeights = Object.values(componentSize.button.height);
  const isButtonHeight = buttonHeights.some(h => Math.abs(height - h) <= 4);

  // 배경색 확인
  const fills = node.fills;
  const hasFill = Array.isArray(fills) && fills.length > 0 &&
                  fills.some(f => f.type === 'SOLID' && f.visible !== false);

  // 둥근 모서리
  const hasRoundedCorners = node.cornerRadius !== undefined &&
                            (typeof node.cornerRadius === 'number' ? node.cornerRadius > 0 : true);

  return hasText && isButtonHeight && (hasFill || hasRoundedCorners);
}

/**
 * 프레임이 입력 필드인지 판단
 */
function isInput(node: FrameNode): boolean {
  const height = node.height;
  const inputHeights = Object.values(componentSize.input.height);
  const isInputHeight = inputHeights.some(h => Math.abs(height - h) <= 4);

  // placeholder나 텍스트 포함 여부
  const hasText = node.children.some(c => c.type === 'TEXT');

  // 테두리 확인
  const hasStroke = node.strokes.length > 0;

  // 너비가 넓음
  const isWide = node.width > 100;

  const hasCornerRadius = typeof node.cornerRadius === 'number' && node.cornerRadius > 0;
  return isInputHeight && hasText && isWide && (hasStroke || hasCornerRadius);
}

/**
 * 프레임이 아바타인지 판단
 */
function isAvatar(node: FrameNode): boolean {
  // 정사각형 또는 원형
  const isSquare = Math.abs(node.width - node.height) <= 2;

  // 아바타 사이즈 매칭
  const avatarSizes = Object.values(componentSize.avatar);
  const matchesSize = avatarSizes.some(s => Math.abs(node.width - s) <= 2);

  // 원형 (cornerRadius가 50% 이상)
  const isCircle = typeof node.cornerRadius === 'number' &&
                   node.cornerRadius >= node.width / 2 - 1;

  // 이미지 포함 여부
  const hasImage = node.children.some(c => {
    if (c.type !== 'RECTANGLE') return false;
    const rectFills = (c as RectangleNode).fills;
    return Array.isArray(rectFills) && rectFills.some((f: Paint) => f.type === 'IMAGE');
  });

  return isSquare && (matchesSize || isCircle) && (hasImage || isCircle);
}

/**
 * 프레임이 아이콘인지 판단
 */
function isIcon(node: FrameNode): boolean {
  // 정사각형
  const isSquare = Math.abs(node.width - node.height) <= 2;

  // 아이콘 사이즈 매칭
  const iconSizes = Object.values(componentSize.icon);
  const matchesSize = iconSizes.some(s => Math.abs(node.width - s) <= 2);

  // 벡터 포함
  const hasVector = node.children.some(c =>
    c.type === 'VECTOR' || c.type === 'BOOLEAN_OPERATION' || c.type === 'LINE'
  );

  // 이름에 'icon' 포함
  const nameHasIcon = node.name.toLowerCase().includes('icon');

  return isSquare && matchesSize && (hasVector || nameHasIcon);
}

/**
 * 프레임이 토글인지 판단
 */
function isToggle(node: FrameNode): boolean {
  const width = node.width;
  const height = node.height;

  // 토글 사이즈 체크
  const matchesToggle = Math.abs(width - componentSize.toggle.width) <= 4 ||
                        Math.abs(height - componentSize.toggle.height) <= 4;

  // 원형 자식 요소 (토글 노브)
  const hasCircleChild = node.children.some(c => {
    if (c.type === 'ELLIPSE') return true;
    if (c.type === 'FRAME') {
      const frameRadius = (c as FrameNode).cornerRadius;
      return typeof frameRadius === 'number' && frameRadius >= (c as FrameNode).width / 2 - 1;
    }
    return false;
  });

  return matchesToggle && hasCircleChild;
}

/**
 * 프레임이 체크박스인지 판단
 */
function isCheckbox(node: FrameNode): boolean {
  const isSquare = Math.abs(node.width - node.height) <= 2;
  const checkboxSizes = Object.values(componentSize.checkbox);
  const matchesSize = checkboxSizes.some(s => Math.abs(node.width - s) <= 2);

  // 체크 아이콘 포함 여부
  const hasCheckmark = node.children.some(c =>
    c.name.toLowerCase().includes('check') ||
    c.type === 'VECTOR' ||
    c.type === 'BOOLEAN_OPERATION'
  );

  return isSquare && matchesSize && hasCheckmark;
}

/**
 * 프레임이 카드인지 판단
 */
function isCard(node: FrameNode): boolean {
  // 여러 자식 요소
  const hasMultipleChildren = node.children.length >= 2;

  // 배경색 또는 테두리
  const fills = node.fills;
  const hasFill = Array.isArray(fills) && fills.length > 0;
  const hasStroke = node.strokes.length > 0;

  // 그림자
  const hasShadow = node.effects.some(e => e.type === 'DROP_SHADOW');

  // 둥근 모서리
  const hasRoundedCorners = typeof node.cornerRadius === 'number' && node.cornerRadius > 0;

  // 적당한 크기
  const isReasonableSize = node.width > 100 && node.height > 50;

  return hasMultipleChildren && isReasonableSize &&
         (hasFill || hasStroke || hasShadow) && hasRoundedCorners;
}

/**
 * 프레임이 리스트 아이템인지 판단
 */
function isListItem(node: FrameNode): boolean {
  // 가로로 긴 형태
  const isHorizontal = node.width > node.height * 2;

  // Auto Layout이 horizontal
  const isHorizontalLayout = node.layoutMode === 'HORIZONTAL';

  // 적당한 높이
  const reasonableHeight = node.height >= 40 && node.height <= 100;

  return isHorizontal && reasonableHeight && (isHorizontalLayout || node.children.length >= 2);
}

/**
 * 프레임이 탭인지 판단
 */
function isTab(node: FrameNode): boolean {
  const height = node.height;
  const tabHeights = [componentSize.tab.subTab, componentSize.tab.segmentControl];
  const matchesHeight = tabHeights.some(h => Math.abs(height - h) <= 4);

  // 텍스트 포함
  const hasText = node.children.some(c => c.type === 'TEXT');

  return matchesHeight && hasText;
}

/**
 * 컴포넌트 타입 감지
 */
export function detectComponentType(node: FrameNode): ComponentType {
  // 우선순위 순으로 체크
  if (isIcon(node)) return 'Icon';
  if (isAvatar(node)) return 'Avatar';
  if (isCheckbox(node)) return 'Checkbox';
  if (isToggle(node)) return 'Toggle';
  if (isButton(node)) return 'Button';
  if (isInput(node)) return 'Input';
  if (isTab(node)) return 'Tab';
  if (isListItem(node)) return 'ListItem';
  if (isCard(node)) return 'Card';

  // 자식이 많고 큰 프레임은 Container
  if (node.children.length > 3 && node.width > 200 && node.height > 200) {
    return 'Container';
  }

  return 'Frame';
}

/**
 * 배경색 기반 Variant 감지
 */
export function detectVariant(node: FrameNode): VariantType {
  const fills = node.fills;

  if (!Array.isArray(fills) || fills.length === 0) {
    return 'Ghost';
  }

  const solidFill = fills.find(f => f.type === 'SOLID' && f.visible !== false) as SolidPaint | undefined;

  if (!solidFill) {
    // 테두리만 있는 경우
    if (node.strokes.length > 0) {
      return 'Outline';
    }
    return 'Ghost';
  }

  const fillColor = rgbToHex(solidFill.color);

  // Primary 색상 체크
  if (isColorSimilar(fillColor, colors.primary.main)) {
    return 'Primary';
  }

  // Secondary (회색 계열)
  if (isColorSimilar(fillColor, '#f3f3f3') || isColorSimilar(fillColor, '#e6e6e6')) {
    return 'Secondary';
  }

  // 흰색
  if (isColorSimilar(fillColor, '#ffffff')) {
    return 'Default';
  }

  return 'Default';
}

/**
 * 사이즈 감지
 */
export function detectSize(node: FrameNode, componentType: ComponentType): SizeType {
  const height = node.height;
  const width = node.width;

  switch (componentType) {
    case 'Button':
      if (height >= 52) return 'LG';
      if (height >= 44) return 'MD';
      return 'SM';

    case 'Avatar':
      if (width >= 100) return 'XL';
      if (width >= 56) return 'LG';
      if (width >= 44) return 'MD';
      if (width >= 38) return 'SM';
      return 'XS';

    case 'Icon':
      if (width >= 28) return 'XL';
      if (width >= 24) return 'LG';
      if (width >= 20) return 'MD';
      if (width >= 16) return 'SM';
      return 'XS';

    case 'Input':
      if (height >= 48) return 'LG';
      return 'MD';

    default:
      if (width >= 343) return 'Full';
      if (height >= 100 || width >= 200) return 'LG';
      if (height >= 50 || width >= 100) return 'MD';
      return 'SM';
  }
}

/**
 * RGB를 Hex로 변환
 */
function rgbToHex(color: RGB): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 두 색상이 유사한지 비교
 */
function isColorSimilar(color1: string, color2: string, threshold = 30): boolean {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.slice(0, 2), 16);
  const g1 = parseInt(hex1.slice(2, 4), 16);
  const b1 = parseInt(hex1.slice(4, 6), 16);

  const r2 = parseInt(hex2.slice(0, 2), 16);
  const g2 = parseInt(hex2.slice(2, 4), 16);
  const b2 = parseInt(hex2.slice(4, 6), 16);

  const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  return diff <= threshold;
}

/**
 * 프레임에 시맨틱 이름 생성
 */
export function generateSemanticName(node: FrameNode): string {
  const componentType = detectComponentType(node);

  // Container나 Frame은 기존 이름 유지 또는 간단한 이름
  if (componentType === 'Container' || componentType === 'Frame') {
    // 기존 이름이 의미 있으면 유지
    if (node.name && !node.name.startsWith('Frame') && !node.name.match(/^\d+$/)) {
      return node.name;
    }
    return componentType;
  }

  const variant = detectVariant(node);
  const size = detectSize(node, componentType);

  // Variant가 Default면 생략
  if (variant === 'Default') {
    return `${componentType}/${size}`;
  }

  return `${componentType}/${variant}/${size}`;
}

/**
 * 선택된 프레임들의 이름 변경
 */
export function renameSelectionFrames(): {
  success: boolean;
  message: string;
  details?: {
    renamedCount: number;
    changes: { oldName: string; newName: string }[];
  };
} {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return {
      success: false,
      message: '선택된 요소가 없습니다.',
    };
  }

  const changes: { oldName: string; newName: string }[] = [];

  function traverse(node: SceneNode) {
    if (node.type === 'FRAME') {
      const oldName = node.name;
      const newName = generateSemanticName(node);

      if (oldName !== newName) {
        node.name = newName;
        changes.push({ oldName, newName });
      }

      // 자식도 처리
      for (const child of node.children) {
        traverse(child);
      }
    } else if ('children' in node) {
      for (const child of (node as ChildrenMixin).children) {
        traverse(child);
      }
    }
  }

  for (const node of selection) {
    traverse(node);
  }

  if (changes.length === 0) {
    return {
      success: true,
      message: '변경할 이름이 없습니다.',
      details: { renamedCount: 0, changes: [] },
    };
  }

  return {
    success: true,
    message: `${changes.length}개 프레임의 이름이 변경되었습니다.`,
    details: {
      renamedCount: changes.length,
      changes,
    },
  };
}

/**
 * 이름 변경 미리보기
 */
export function previewRenames(node: SceneNode): {
  count: number;
  previews: { id: string; currentName: string; suggestedName: string }[];
} {
  const previews: { id: string; currentName: string; suggestedName: string }[] = [];

  function traverse(n: SceneNode) {
    if (n.type === 'FRAME') {
      const currentName = n.name;
      const suggestedName = generateSemanticName(n);

      if (currentName !== suggestedName) {
        previews.push({
          id: n.id,
          currentName,
          suggestedName,
        });
      }

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

  return { count: previews.length, previews };
}
