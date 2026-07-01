'use strict';
/**
 * gta6-shorts — the SELLABLE pipeline runner. "The pipeline IS the product" (the faceless-content thesis).
 * One command turns a topic + trailer into a complete, ready-to-shoot content BATCH on disk:
 *   - shorts/NN-angle.md  — a script card per Short (hook, 5 beats, subtitles, thumbnail brief, title, hashtags)
 *   - master-prompt.txt   — paste into Claude to get slop-guarded voiceover scripts
 *   - calendar.csv        — the daily posting schedule
 *   - plan.json           — the full machine-readable plan
 *   - README.md           — how the buyer runs the batch
 *
 *   node pipeline.js --topic "GTA 6" --count 10 --out ./out       # real run (writes files)
 *   node pipeline.js                                              # self-test (dry-run)
 */
const fs = require('fs');
const path = require('path');
const { buildShortsPlan } = require('./shorts.js');
let scoreHook = null; try { scoreHook = require('../slopscore/slopscore.js').scoreCopy; } catch { /* optional */ }

const slug = (s) => String(s || 'short').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad2 = (n) => String(n).padStart(2, '0');

function shortToMarkdown(s) {
  const gate = s.hookVerdict ? ` · hook: ${s.hookVerdict} (${s.hookScore})` : '';
  return [
    `# Short ${s.day}: ${s.hook}`,
    ``,
    `**Angle:** ${s.angle} · **Duration:** ${s.durationSec}s${gate}${s.postAtMs ? ` · **Post:** ${new Date(s.postAtMs).toISOString().slice(0, 10)}` : ''}`,
    ``,
    `## Script`,
    ...s.script.map((b) => `- **${b.beat}** — ${b.line}`),
    ``,
    `## Subtitles`,
    s.subtitleStyle,
    ``,
    `## Thumbnail`,
    `- Subject: ${s.thumbnail.subject}`,
    `- Overlay text: **${s.thumbnail.overlayText}**`,
    `- Style: ${s.thumbnail.style} · ${s.thumbnail.color}`,
    ``,
    `## Publish`,
    `- Title: ${s.title}`,
    `- Hashtags: ${s.hashtags.join(' ')}`,
    ``,
  ].join('\n');
}

function calendarCsv(plan) {
  const rows = ['day,post_date,hook,title'];
  for (const s of plan.shorts) {
    const date = s.postAtMs ? new Date(s.postAtMs).toISOString().slice(0, 10) : '';
    rows.push(`${s.day},${date},"${s.hook.replace(/"/g, "'")}","${s.title.replace(/"/g, "'")}"`);
  }
  return rows.join('\n');
}

function batchReadme(plan) {
  const g = plan.gate;
  return [
    `# ${plan.topic} — Shorts content batch (${plan.count} videos)`,
    ``,
    `Ready-to-shoot faceless Shorts. ${g ? `Hook quality gate: ${g.shippableHooks}/${g.scored} shippable, ${g.killed} flagged.` : ''}`,
    ``,
    `## How to use`,
    `1. Open \`master-prompt.txt\`, paste it into Claude with your trailer link → get the voiceover scripts.`,
    `2. Feed each script + the thumbnail brief (in \`shorts/\`) to your video tool (Higgsfield / Kling + ElevenLabs + Creatomate).`,
    `3. Follow \`calendar.csv\` — post one per day through the hype window.`,
    ``,
    plan.note,
  ].join('\n');
}

function buildArtifacts(opts = {}) {
  const plan = buildShortsPlan({ topic: opts.topic, trailerUrl: opts.trailerUrl, count: opts.count, moments: opts.moments, startDateMs: opts.startDateMs, launchDateMs: opts.launchDateMs, scoreHook });
  const files = {};
  files['plan.json'] = JSON.stringify(plan, null, 2);
  files['master-prompt.txt'] = plan.masterPrompt;
  files['calendar.csv'] = calendarCsv(plan);
  files['README.md'] = batchReadme(plan);
  plan.shorts.forEach((s) => { files[`shorts/${pad2(s.day)}-${slug(s.angle)}.md`] = shortToMarkdown(s); });
  return { plan, files };
}

function runPipeline(opts = {}) {
  const { plan, files } = buildArtifacts(opts);
  if (opts.dryRun) return { plan, fileCount: Object.keys(files).length, files: Object.keys(files) };
  const outDir = opts.outDir || './out';
  for (const [rel, content] of Object.entries(files)) {
    const p = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  return { plan, outDir, written: Object.keys(files).length };
}

module.exports = { runPipeline, buildArtifacts };

// ---- CLI + SELF-TEST -----------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  const flag = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
  if (args.includes('--out')) {
    const r = runPipeline({ topic: flag('topic', 'GTA 6'), trailerUrl: flag('trailer', ''), count: Number(flag('count', 10)), outDir: flag('out', './out'), startDateMs: Date.now() });
    console.log(`✓ wrote ${r.written} files to ${r.outDir} (${r.plan.count} Shorts for "${r.plan.topic}")`);
  } else {
    const LAUNCH = 1795046400000;
    const r = runPipeline({ topic: 'GTA 6', count: 10, startDateMs: LAUNCH - 30 * 86400000, launchDateMs: LAUNCH, trailerUrl: 'https://x.com/trailer', dryRun: true });
    const checks = [
      ['dry-run builds the full artifact set (>= count + 4)', r.fileCount >= 14],
      ['includes master-prompt.txt + calendar.csv + plan.json + README.md', ['master-prompt.txt', 'calendar.csv', 'plan.json', 'README.md'].every((f) => r.files.includes(f))],
      ['one script card per Short (shorts/NN-*.md)', r.files.filter((f) => f.startsWith('shorts/') && f.endsWith('.md')).length === 10],
      ['a script card renders hook + 5 beats + thumbnail + hashtags', (() => { const md = buildArtifacts({ topic: 'GTA 6', count: 1 }).files['shorts/01-map.md']; return /# Short 1:/.test(md) && /## Script/.test(md) && /## Thumbnail/.test(md) && /Hashtags:/.test(md); })()],
      ['calendar.csv has a header + a dated row per Short', r.plan.shorts[0].postAtMs && buildArtifacts({ topic: 'GTA 6', count: 3, startDateMs: LAUNCH }).files['calendar.csv'].split('\n').length === 4],
      ['slopscore gate runs across the batch (or is absent gracefully)', !scoreHook || (r.plan.gate && r.plan.gate.scored === 10)],
      ['honest note carried into the batch README', /not affiliated with rockstar/i.test(r.plan.note)],
      ['NO fund-moving executor in the surface', !Object.keys(module.exports).some((k) => typeof module.exports[k] === 'function' && /^(sign|send|swap|deploy|transfer|withdraw)/i.test(k))],
    ];
    console.log('pipeline dry-run:', JSON.stringify({ files: r.fileCount, gate: r.plan.gate }));
    let pass = 0; for (const [n, ok] of checks) { console.log(ok ? 'PASS' : 'FAIL', '·', n); if (ok) pass++; }
    console.log(`\n${pass}/${checks.length} checks passed`);
    process.exit(pass === checks.length ? 0 : 1);
  }
}
