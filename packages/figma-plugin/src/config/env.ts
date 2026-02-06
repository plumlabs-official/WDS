/**
 * 환경 설정
 *
 * 빌드 시 esbuild의 define 옵션으로 대체 가능:
 * --define:__AGENT_SERVER_URL__='"https://production-server.com"'
 */

// @ts-ignore - esbuild define으로 빌드 시 대체됨
const DEFINED_URL = typeof __AGENT_SERVER_URL__ !== 'undefined'
  ? __AGENT_SERVER_URL__
  : null;

export const AGENT_SERVER_URL = DEFINED_URL || 'http://localhost:3001';
