#!/usr/bin/env node
/**
 * gta6-shorts MCP server (stdio) — generate faceless Short packages + a master LLM prompt for a hype window.
 * Local (no network). Hooks are gated by slopscore if the sibling package is present.
 *   { "mcpServers": { "gta6-shorts": { "command": "npx", "args": ["-y", "gta6-shorts", "gta6-shorts-mcp"] } } }
 */
const { buildShortsPlan, buildMasterPrompt } = require('./shorts.js');
let scoreHook = null;
try { scoreHook = require('../slopscore/slopscore.js').scoreCopy; } catch { /* slopscore optional */ }
const SERVER_NAME = 'gta6-shorts';
const SERVER_VERSION = require('./package.json').version;

const TOOLS = [
  {
    name: 'plan_shorts',
    description: 'Generate N faceless Short packages (hook + 5 script beats + thumbnail brief + title + hashtags) + a daily posting calendar for a hype topic (default GTA 6). Hooks are gated by slopscore (weak/slop hooks flagged). Returns the plan + a master LLM prompt for the voiceovers.',
    inputSchema: { type: 'object', properties: { topic: { type: 'string', description: 'default "GTA 6"' }, count: { type: 'integer', description: '1-30, default 10' }, moments: { type: 'array', items: { type: 'string' }, description: 'optional trailer moments/angles' }, trailerUrl: { type: 'string' } } },
  },
  {
    name: 'get_master_prompt',
    description: 'Just the master LLM prompt (paste into Claude) that turns a trailer into N slop-guarded Short voiceover scripts.',
    inputSchema: { type: 'object', properties: { topic: { type: 'string' }, count: { type: 'integer' }, trailerUrl: { type: 'string' } } },
  },
];

function execTool(name, a) {
  if (name === 'plan_shorts') return buildShortsPlan({ topic: a.topic, count: a.count, moments: a.moments, trailerUrl: a.trailerUrl, scoreHook });
  if (name === 'get_master_prompt') return { masterPrompt: buildMasterPrompt({ topic: a.topic, count: a.count, trailerUrl: a.trailerUrl }) };
  throw new Error('unknown tool: ' + name);
}

function send(msg) { process.stdout.write(JSON.stringify(msg) + '\n'); }
async function handle(req) {
  const { id, method, params } = req;
  try {
    if (method === 'initialize') return { jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: SERVER_NAME, version: SERVER_VERSION } } };
    if (method === 'tools/list') return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
    if (method === 'tools/call') { const result = execTool(params.name, params.arguments || {}); return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } }; }
    if (method === 'notifications/initialized') return null;
    return { jsonrpc: '2.0', id, error: { code: -32601, message: 'method not found: ' + method } };
  } catch (e) { return { jsonrpc: '2.0', id, error: { code: -32000, message: e.message } }; }
}
let buffer = '';
process.stdin.on('data', async (chunk) => {
  buffer += chunk.toString('utf8');
  let idx;
  while ((idx = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    let req; try { req = JSON.parse(line); } catch { continue; }
    const resp = await handle(req);
    if (resp) send(resp);
  }
});
process.stderr.write(`[gta6-shorts MCP] ready, ${TOOLS.length} tools${scoreHook ? ' (slopscore gate active)' : ''}\n`);
