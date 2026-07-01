# gta6-shorts — faceless Short content engine (product "A", GTA 6 hype play)

Phil's pick for A: ride the **GTA 6 launch (~Nov 19 2026)** hype window with faceless YouTube/TikTok Shorts, per the
[[AI Money Playbooks]] articles (@torax_fi Claude+Higgsfield, @Atenov_D n8n pipeline). A *projet à part* for near-term cash.

## Honest framing (anti-hype)
This is a **commodity content play** — no moat, crowded after those viral posts, off Phil's Base thesis, and the "$25k/mo"
numbers are marketing. The edge is **speed + volume + not-slop** in a dated window. It funds runway; it is not a durable
business. Also: use official trailers under **fair-use/commentary**, respect each platform's ToS + copyright, not affiliated
with Rockstar. → [[Key Learnings]].

## What the engine does
`shorts.js` (core, self-tested) turns a topic + trailer moments into N Short packages: **hook · 5 script beats · subtitle
style · thumbnail brief · title · hashtags · a daily posting calendar** + a **master LLM prompt** for the creative
voiceovers. The hooks are **gated by slopscore** (product A-anti-slop, reused as the quality filter — nothing slop ships).

## Pipeline (how Phil runs it)
1. `shorts.js` → the plan + the master prompt (deterministic scaffolds + the LLM prompt).
2. Feed the master prompt to Claude → the voiceover scripts (slopscore filters weak hooks).
3. A video tool (Higgsfield / Kling + ElevenLabs + Creatomate) renders the 9:16 clips.
4. Post daily through the pre-launch window; monetize (AdSense + digital products + Discord).

## Build status (2026-07-01)
`shorts.js` core done + self-tested. **NEXT:** an MCP/CLI so Phil runs it in one command · a niche-swap (any hype topic) ·
wire the real LLM (Claude) for the voiceovers · a thumbnail-prompt batch. Working name.
