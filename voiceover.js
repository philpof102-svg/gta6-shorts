'use strict';
/**
 * gta6-shorts — voiceover generator. Wires the LLM (Claude) step into the pipeline so it runs fully automated:
 * per-Short prompt → generate → a slop-gated voiceover script. `generate` is INJECTED (Claude in prod, a stub in
 * test) → deterministic + testable. In prod, pass a fn wrapping `anthropic.messages.create` (or the repo's claudeText).
 * `node voiceover.js` self-tests with a stub. WE never move funds; this only writes text.
 */
let scoreHook = null; try { scoreHook = require('../slopscore/slopscore.js').scoreCopy; } catch { /* optional */ }

function voiceoverPrompt(short, topic) {
  return [
    `Write a ~25-second high-energy YouTube-Shorts narrator voiceover for this ${topic || 'GTA 6'} Short.`,
    `Hook (first 3s): "${short.hook}"`,
    `Beats: ${short.script.map((b) => b.beat + ' — ' + b.line).join(' | ')}`,
    `Rules: a retention beat every 5-7s; concrete + specific; NO clichés (unlock/elevate/seamless/game-changer), no "it is not X it is Y". Return ONLY the voiceover text, no preamble.`,
  ].join('\n');
}

function makeVoiceover({ generate } = {}) {
  if (typeof generate !== 'function') throw new TypeError('makeVoiceover: an injected `generate(prompt)` fn is required');
  return async function writeVoiceover(short, opts = {}) {
    let text = '';
    try { text = String(await generate(voiceoverPrompt(short, opts.topic)) || '').trim(); }
    catch (e) { return { hook: short.hook, voiceover: '', error: e && e.message, slop: null }; }
    const gate = scoreHook ? scoreHook(short.hook + '. ' + text.slice(0, 140)) : null; // gate hook + opening
    return { hook: short.hook, voiceover: text, slop: gate ? gate.verdict : null, slopScore: gate ? gate.score : null };
  };
}

async function writeAll(shorts, { generate, topic } = {}) {
  const w = makeVoiceover({ generate });
  return Promise.all((shorts || []).map((s) => w(s, { topic })));
}

module.exports = { makeVoiceover, writeAll, voiceoverPrompt };

// ---- SELF-TEST (the checker) ---------------------------------------------
if (require.main === module) {
  const { buildShortsPlan } = require('./shorts.js');
  const stub = async () => 'GTA 6 just showed Vice City at night and the reflections are real-time. Here is the detail nobody caught. That is a first for the series. It changes how immersive the world feels. Follow for the daily breakdown, which detail did you miss?';
  (async () => {
    const plan = buildShortsPlan({ count: 3 });
    const vos = await writeAll(plan.shorts, { generate: stub, topic: 'GTA 6' });
    const p0 = voiceoverPrompt(plan.shorts[0], 'GTA 6');
    const checks = [
      ['a voiceover per Short', vos.length === 3 && vos.every((v) => v.voiceover.length > 20)],
      ['each carries its hook', vos.every((v, i) => v.hook === plan.shorts[i].hook)],
      ['slopscore gate runs on hook+opening (or absent gracefully)', !scoreHook || vos.every((v) => v.slop)],
      ['voiceoverPrompt includes the hook + a NO-slop rule', p0.includes(plan.shorts[0].hook) && /NO clich/i.test(p0)],
      ['makeVoiceover REQUIRES an injected generate fn (no hidden network/keys)', (() => { try { makeVoiceover({}); return false; } catch { return true; } })()],
      ['generate error is caught, never throws mid-batch', (await makeVoiceover({ generate: async () => { throw new Error('x'); } })(plan.shorts[0])).error === 'x'],
      ['NO fund-moving executor in the surface', !Object.keys(module.exports).some((k) => typeof module.exports[k] === 'function' && /^(sign|send|swap|deploy|transfer|withdraw)/i.test(k))],
    ];
    console.log('voiceover:', JSON.stringify({ n: vos.length, slop0: vos[0].slop, len0: vos[0].voiceover.length }));
    let pass = 0; for (const [n, ok] of checks) { console.log(ok ? 'PASS' : 'FAIL', '·', n); if (ok) pass++; }
    console.log(`\n${pass}/${checks.length} checks passed`);
    process.exit(pass === checks.length ? 0 : 1);
  })();
}
