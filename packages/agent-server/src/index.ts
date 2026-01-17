/**
 * Figma Agent Server
 *
 * Multi-agent server for Figma Design System Automator
 * - Naming Agent: 컴포넌트 이름 추론
 * - AutoLayout Agent: 레이아웃 설정 추론
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeNaming, analyzeNamingWithContext } from './agents/naming';
import { analyzeAutoLayout } from './agents/autolayout';
import { validateCleanup } from './agents/cleanup-validator';
import {
  getAllPatterns,
  getPatternById,
  getRecentPatterns,
  getFrequentPatterns,
  upsertPattern,
  deletePattern,
  recordPatternUsage,
  renamePattern,
  getHistory,
  resetPatterns,
} from './patterns';
import { findSimilarPatterns } from './patterns';
import { CreatePatternRequestSchema, MatchPatternRequestSchema } from '@wellwe/common';
import type { NamingRequest, AutoLayoutRequest, ContextAwareNamingRequest, CleanupValidationRequest } from './types';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware - Figma plugin UI runs in sandbox iframe with null origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '50mb' })); // 스크린샷 전송을 위해 크기 제한 늘림

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Naming Agent 엔드포인트
 * POST /agents/naming
 */
app.post('/agents/naming', async (req, res) => {
  try {
    const request: NamingRequest = req.body;
    console.log(`[Naming] Analyzing node: ${request.nodeId}`);

    const result = await analyzeNaming(request);

    if (result.success) {
      console.log(`[Naming] Success: ${result.data?.suggestedName}`);
    } else {
      console.log(`[Naming] Failed: ${result.error}`);
    }

    res.json(result);
  } catch (error) {
    console.error('[Naming] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * AutoLayout Agent 엔드포인트
 * POST /agents/autolayout
 */
app.post('/agents/autolayout', async (req, res) => {
  try {
    const request: AutoLayoutRequest = req.body;
    console.log(`[AutoLayout] Analyzing node: ${request.nodeId}`);

    const result = await analyzeAutoLayout(request);

    if (result.success) {
      console.log(`[AutoLayout] Success: ${result.data?.direction}, gap=${result.data?.gap}`);
    } else {
      console.log(`[AutoLayout] Failed: ${result.error}`);
    }

    res.json(result);
  } catch (error) {
    console.error('[AutoLayout] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Batch Naming 엔드포인트 (여러 노드 한번에 처리)
 * POST /agents/naming/batch
 */
app.post('/agents/naming/batch', async (req, res) => {
  try {
    const requests: NamingRequest[] = req.body.nodes;
    console.log(`[Naming Batch] Processing ${requests.length} nodes`);

    const results = await Promise.all(
      requests.map((request) => analyzeNaming(request))
    );

    const successCount = results.filter((r) => r.success).length;
    console.log(`[Naming Batch] Completed: ${successCount}/${requests.length} success`);

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('[Naming Batch] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Context-aware Naming 엔드포인트 (전체 스크린 기반)
 * POST /agents/naming/context
 */
app.post('/agents/naming/context', async (req, res) => {
  try {
    const request: ContextAwareNamingRequest = req.body;
    console.log(`[Context Naming] Analyzing ${request.nodes.length} nodes with screen context (${request.screenWidth}x${request.screenHeight})`);

    const result = await analyzeNamingWithContext(request);

    if (result.success) {
      console.log(`[Context Naming] Success: ${result.data?.results.length} names suggested`);
    } else {
      console.log(`[Context Naming] Failed: ${result.error}`);
    }

    res.json(result);
  } catch (error) {
    console.error('[Context Naming] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Cleanup Validator 엔드포인트
 * POST /agents/cleanup/validate
 */
app.post('/agents/cleanup/validate', async (req, res) => {
  try {
    const request: CleanupValidationRequest = req.body;
    console.log(`[Cleanup Validator] Comparing screenshots for: ${request.nodeName}`);

    const result = await validateCleanup(request);

    if (result.success) {
      console.log(`[Cleanup Validator] isIdentical: ${result.data?.isIdentical}`);
    } else {
      console.log(`[Cleanup Validator] Failed: ${result.error}`);
    }

    res.json(result);
  } catch (error) {
    console.error('[Cleanup Validator] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// Pattern API 엔드포인트
// ============================================

/**
 * 패턴 목록 조회
 * GET /patterns
 * Query params:
 *   - sort: 'recent' | 'frequent' (기본: recent)
 *   - limit: number (기본: 20)
 */
app.get('/patterns', (req, res) => {
  try {
    const sort = (req.query.sort as string) || 'recent';
    const limit = parseInt(req.query.limit as string) || 20;

    let patterns;
    if (sort === 'frequent') {
      patterns = getFrequentPatterns(limit);
    } else {
      patterns = getRecentPatterns(limit);
    }

    console.log(`[Patterns] List: ${patterns.length} patterns (sort: ${sort})`);
    res.json({ success: true, data: patterns });
  } catch (error) {
    console.error('[Patterns] List error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 패턴 단건 조회
 * GET /patterns/:id
 */
app.get('/patterns/:id', (req, res) => {
  try {
    const { id } = req.params;
    const pattern = getPatternById(id);

    if (!pattern) {
      res.status(404).json({ success: false, error: 'Pattern not found' });
      return;
    }

    console.log(`[Patterns] Get: "${pattern.name}"`);
    res.json({ success: true, data: pattern });
  } catch (error) {
    console.error('[Patterns] Get error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 패턴 생성/업데이트 (Upsert)
 * POST /patterns
 */
app.post('/patterns', (req, res) => {
  try {
    const validated = CreatePatternRequestSchema.safeParse(req.body);

    if (!validated.success) {
      console.error('[Patterns] Validation error:', validated.error);
      res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: validated.error.errors,
      });
      return;
    }

    const pattern = upsertPattern(validated.data);
    console.log(`[Patterns] Upsert: "${pattern.name}" (id: ${pattern.id})`);
    res.json({ success: true, data: pattern });
  } catch (error) {
    console.error('[Patterns] Upsert error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 패턴 삭제
 * DELETE /patterns/:id
 */
app.delete('/patterns/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deletePattern(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Pattern not found' });
      return;
    }

    console.log(`[Patterns] Deleted: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Patterns] Delete error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 패턴 DB 초기화
 * POST /patterns/reset
 */
app.post('/patterns/reset', (req, res) => {
  try {
    resetPatterns();
    console.log('[Patterns] DB Reset');
    res.json({ success: true, message: 'Pattern DB has been reset' });
  } catch (error) {
    console.error('[Patterns] Reset error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 패턴 사용 기록
 * POST /patterns/:id/use
 */
app.post('/patterns/:id/use', (req, res) => {
  try {
    const { id } = req.params;
    const pattern = recordPatternUsage(id);

    if (!pattern) {
      res.status(404).json({ success: false, error: 'Pattern not found' });
      return;
    }

    console.log(`[Patterns] Usage recorded: "${pattern.name}" (count: ${pattern.usageCount})`);
    res.json({ success: true, data: pattern });
  } catch (error) {
    console.error('[Patterns] Usage error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 패턴 이름 변경
 * PATCH /patterns/:id
 */
app.patch('/patterns/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }

    const pattern = renamePattern(id, name);

    if (!pattern) {
      res.status(404).json({ success: false, error: 'Pattern not found' });
      return;
    }

    console.log(`[Patterns] Renamed: ${id} → "${name}"`);
    res.json({ success: true, data: pattern });
  } catch (error) {
    console.error('[Patterns] Rename error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 유사 패턴 매칭
 * POST /patterns/match
 */
app.post('/patterns/match', (req, res) => {
  try {
    const validated = MatchPatternRequestSchema.safeParse(req.body);

    if (!validated.success) {
      console.error('[Patterns] Match validation error:', validated.error);
      res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: validated.error.errors,
      });
      return;
    }

    const { structure, limit, minScore } = validated.data;
    const result = findSimilarPatterns(structure, { limit, minScore });

    console.log(`[Patterns] Match: ${result.candidates.length} candidates found`);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Patterns] Match error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 패턴 히스토리 조회
 * GET /patterns/history
 */
app.get('/patterns/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = getHistory(limit);

    console.log(`[Patterns] History: ${history.length} entries`);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('[Patterns] History error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server - bind to 0.0.0.0 for IPv4 support
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════╗
║       Figma Agent Server                       ║
║       Running on http://localhost:${PORT}         ║
╠════════════════════════════════════════════════╣
║  Endpoints:                                    ║
║  - GET  /health                Health check    ║
║  - POST /agents/naming         Naming Agent    ║
║  - POST /agents/autolayout     AutoLayout      ║
║  - POST /agents/naming/batch   Batch naming    ║
║  - POST /agents/naming/context Context naming  ║
║  - POST /agents/cleanup/validate Cleanup AI    ║
║  - GET  /patterns              List patterns   ║
║  - POST /patterns              Create pattern  ║
║  - POST /patterns/match        Match patterns  ║
║  - GET  /patterns/history      View history    ║
╚════════════════════════════════════════════════╝
  `);
});
