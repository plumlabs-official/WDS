/**
 * Naming Module
 *
 * AI/Direct Naming 기능 통합 export
 */

// Direct naming
export {
  VALID_SEMANTIC_TYPES,
  hasValidSemanticName,
  tryDirectNaming,
  collectAllNodes,
} from './direct';

// Handlers
export {
  handleNamingAgent,
  handleNamingResult,
  handleNamingBatchResult,
  handleNamingContextResult,
  // Types
  NamingResultMessage,
  NamingBatchResultMessage,
  NamingContextResultMessage,
  // State accessors (if needed externally)
  getPendingNamingNode,
  setPendingNamingNode,
  getPendingNamingNodes,
  setPendingNamingNodes,
  clearPendingNamingNodes,
} from './handler';
