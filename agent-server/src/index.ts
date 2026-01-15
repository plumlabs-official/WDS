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
import type { NamingRequest, AutoLayoutRequest, ContextAwareNamingRequest } from './types';

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

// Start server - bind to 0.0.0.0 for IPv4 support
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════╗
║       Figma Agent Server                       ║
║       Running on http://localhost:${PORT}         ║
╠════════════════════════════════════════════════╣
║  Endpoints:                                    ║
║  - GET  /health              Health check      ║
║  - POST /agents/naming       Naming Agent      ║
║  - POST /agents/autolayout   AutoLayout Agent  ║
║  - POST /agents/naming/batch Batch naming      ║
║  - POST /agents/naming/context Context naming  ║
╚════════════════════════════════════════════════╝
  `);
});
