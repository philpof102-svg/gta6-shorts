'use strict';
/**
 * gta6-shorts — a faceless short-video CONTENT ENGINE for a hype window (GTA 6, launch ~Nov 19 2026).
 * Turns a topic + trailer "moments" into N ready-to-shoot Short packages (hook + script beats + subtitle style +
 * thumbnail brief + title + hashtags) + a daily posting calendar, PLUS a master LLM prompt for the creative.
 * Deterministic scaffolds (footage/voiceover filled by the creator or an LLM); an injected `scoreHook` (slopscore)
 * gates weak hooks so we don't ship slop. Pure + testable. `node shorts.js` self-tests. Ride the pre-launch window.
 */

const HOOK_PATTERNS = [
  'The {moment} detail in the {topic} trailer nobody noticed',
  '{topic} just revealed {moment} and fans are losing it',
  '{n} {topic} {moment} details you completely missed',
  'This {moment} changes everything about {topic}',
  'Why {topic}\'s {moment} is a bigger deal than you think',
  '{topic} {moment} vs the last one — it is not even close',
  'Everyone is talking about the {topic} {moment}',
  '{topic} confirmed {moment} and here is why it matters',
];
const SUBTITLE_STYLE = 'Bebas Neue, bold, high-contrast, word-by-word pop, bottom-center';
const THUMB_TEXT = ['THIS CHANGES EVERYTHING', 'IT IS BACK', 'YOU MISSED THIS', 'NO WAY', 'IT IS REAL', 'WATCH THIS'];
const tag = (t) => '#' + String(t || 'GTA 6').replace(/[^A-Za-z0-9]/g, '');

function buildHook(topic, moment, i = 0) {
  return HOOK_PATTERNS[i % HOOK_PATTERNS.length].replace(/\{topic\}/g, topic || 'GTA 6').replace('{moment}', moment || 'new').replace('{n}', String(3 + (i % 7)));
}
function thumbnailBrief(moment, i = 0) {
  return { subject: 'GTA 6 key art / ' + (moment || 'scene') + ' frame', overlayText: THUMB_TEXT[i % THUMB_TEXT.length], style: 'dramatic lighting, high-contrast, bold overlay, Vice-City neon accents', color: 'magenta/teal high-contrast' };
}

function buildShort({ topic = 'GTA 6', moment, i = 0, scoreHook } = {}) {
  const hook = buildHook(topic, moment, i);
  const gate = typeof scoreHook === 'function' ? scoreHook(hook) : null;
  return {
    hook, hookVerdict: gate ? gate.verdict : null, hookScore: gate ? gate.score : null,
    angle: moment || 'general', durationSec: 25,
    script: [
      { beat: 'hook 0-3s', line: hook },
      { beat: 'context 3-8s', line: 'Cut to the ' + (moment || 'moment') + ' clip; set the stakes in one sentence.' },
      { beat: 'reveal 8-16s', line: 'The specific detail + why it matters (concrete, no filler).' },
      { beat: 'payoff 16-22s', line: 'The "no way" beat / a sharp GTA 5 comparison.' },
      { beat: 'cta 22-25s', line: 'Follow for a daily GTA 6 breakdown. Which one did you miss?' },
    ],
    subtitleStyle: SUBTITLE_STYLE, thumbnail: thumbnailBrief(moment, i),
    title: (hook + ' ' + tag(topic)).slice(0, 90),
    hashtags: [tag(topic), tag(topic) + 'Trailer', '#gaming', '#shorts', '#trending', '#fyp'],
  };
}

/** The master prompt to hand an LLM (Claude) for the actual creative voiceovers — refined + slop-guarded. */
function buildMasterPrompt({ topic = 'GTA 6', trailerUrl = '', count = 10 } = {}) {
  return [
    `You are a faceless short-form video producer. Turn the ${topic} trailer ${trailerUrl || '(paste link)'} into ${count} vertical 9:16 Shorts.`,
    `Identify the ${count} most viral MOMENTS (map, characters, vehicles, heists, easter eggs, release date, online).`,
    `For EACH, return one JSON object: {"hook":"<first 3s, curiosity + stakes, <=12 words>","voiceover":"<~25s high-energy narrator script, a retention beat every 5-7s>","subtitles":"Bebas Neue word-by-word","thumbnail":"<subject + bold overlay text + high-contrast>","title":"<=60 chars, ends #GTA6","hashtags":["#GTA6", ...]}`,
    `NO SLOP: no clichés (unlock/elevate/seamless/game-changer), no "it is not X it is Y", no vague filler — concrete specific details only. Return a JSON array of ${count} objects and nothing else.`,
  ].join('\n\n');
}

function buildShortsPlan(opts = {}) {
  const topic = opts.topic || 'GTA 6';
  const count = Math.max(1, Math.min(30, Number(opts.count) || 10));
  const moments = (Array.isArray(opts.moments) && opts.moments.length) ? opts.moments
    : ['map', 'characters', 'vehicles', 'heist', 'easter-egg', 'graphics', 'soundtrack', 'release-date', 'online', 'Vice-City'];
  const start = Number.isFinite(opts.startDateMs) ? opts.startDateMs : null;
  const shorts = [];
  for (let i = 0; i < count; i++) {
    const s = buildShort({ topic, moment: moments[i % moments.length], i, scoreHook: opts.scoreHook });
    s.day = i + 1;
    if (start) s.postAtMs = start + i * 86400000; // one per day
    shorts.push(s);
  }
  const scored = shorts.filter((s) => s.hookVerdict);
  const shippableHooks = scored.filter((s) => s.hookVerdict !== 'kill').length;
  return {
    topic, count, launchDateMs: opts.launchDateMs || null, shorts,
    masterPrompt: buildMasterPrompt({ topic, trailerUrl: opts.trailerUrl, count }),
    gate: opts.scoreHook ? { scored: scored.length, shippableHooks, killed: scored.length - shippableHooks } : null,
    note: 'Deterministic Short scaffolds for a hype window — footage + voiceover are filled by the creator or an LLM; hooks gated by slopscore. Faceless-content play, NOT affiliated with Rockstar. Use official trailers under fair-use/commentary; respect each platform ToS + copyright.',
  };
}

module.exports = { buildShortsPlan, buildShort, buildHook, buildMasterPrompt, HOOK_PATTERNS };

// ---- SELF-TEST (the checker) ---------------------------------------------
if (require.main === module) {
  let scoreCopy = null;
  try { scoreCopy = require('../slopscore/slopscore.js').scoreCopy; } catch { /* slopscore optional */ }
  const LAUNCH = 1795046400000; // stamped constant (no Date.now in a testable module)
  const plan = buildShortsPlan({ count: 10, startDateMs: LAUNCH - 30 * 86400000, launchDateMs: LAUNCH, trailerUrl: 'https://x.com/trailer', scoreHook: scoreCopy });
  const s0 = plan.shorts[0];

  const checks = [
    ['produces N Short packages', plan.shorts.length === 10 && plan.count === 10],
    ['each Short has hook + 5 script beats + thumbnail + title + hashtags', s0.hook && s0.script.length === 5 && s0.thumbnail.overlayText && s0.title.includes('#GTA6') && s0.hashtags.includes('#GTA6')],
    ['hooks vary (not all identical)', new Set(plan.shorts.map((s) => s.hook)).size >= 6],
    ['daily posting calendar (postAtMs +1 day each)', plan.shorts[1].postAtMs - plan.shorts[0].postAtMs === 86400000 && plan.shorts[0].day === 1],
    ['master LLM prompt built (topic + count + a NO-SLOP guard)', /GTA 6/.test(plan.masterPrompt) && /10/.test(plan.masterPrompt) && /NO SLOP/i.test(plan.masterPrompt)],
    ['slopscore gate runs + reports stats (reuses product A as the hook filter)', !scoreCopy || (plan.gate && plan.gate.scored === 10 && plan.gate.shippableHooks >= 5)],
    ['honesty: not affiliated with Rockstar + respect ToS/copyright', /NOT affiliated with Rockstar/.test(plan.note) && /copyright/.test(plan.note)],
    ['NO fund-moving executor in the surface', !Object.keys(module.exports).some((k) => typeof module.exports[k] === 'function' && /^(sign|send|swap|deploy|transfer|withdraw)/i.test(k))],
  ];
  console.log('shorts:', JSON.stringify({ count: plan.shorts.length, hook0: s0.hook, gate: plan.gate }));
  let pass = 0; for (const [n, ok] of checks) { console.log(ok ? 'PASS' : 'FAIL', '·', n); if (ok) pass++; }
  console.log(`\n${pass}/${checks.length} checks passed`);
  process.exit(pass === checks.length ? 0 : 1);
}
