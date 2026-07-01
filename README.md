# gta6-shorts — the faceless Shorts pipeline (a sellable content engine)

**One command turns a trending topic into a ready-to-shoot batch of vertical Shorts.** Built for the GTA 6 launch
(~Nov 19 2026) hype window, niche-swappable to any topic. *The pipeline IS the product.*

## What you get (per run)
```bash
node pipeline.js --topic "GTA 6" --count 10 --out ./batch
```
writes a complete content batch:
- `shorts/NN-*.md` — a script card per Short: hook + 5 script beats + subtitle style + thumbnail brief + title + hashtags
- `master-prompt.txt` — paste into Claude → slop-guarded voiceover scripts
- `calendar.csv` — the daily posting schedule
- `plan.json` — the full machine-readable plan · `README.md` — how to use the batch

Every hook is gated by **slopscore** so weak / AI-slop hooks are flagged before you shoot.

## Run / test
```bash
node shorts.js          # engine self-test (8/8)
node pipeline.js        # pipeline self-test (8/8)
npm run mcp             # stdio MCP: plan_shorts + get_master_prompt
```
MCP install: `{ "mcpServers": { "gta6-shorts": { "command": "npx", "args": ["-y","gta6-shorts","gta6-shorts-mcp"] } } }`

## The full pipeline (what a buyer runs)
1. `pipeline.js` → the batch (scripts + master prompt + calendar).
2. Master prompt → Claude → the voiceover scripts (slop-filtered).
3. Video tool (Higgsfield / Kling + ElevenLabs + Creatomate) → the 9:16 clips.
4. Post daily through the window; monetize (AdSense + digital products + Discord).

## Sell it (the model)
The reusable pipeline is the sellable asset — the faceless-content thesis: *"the pipeline is the value, not the prompts."*
Package it as a kit (Gumroad / a Claude skill / an MCP) or run the channels yourself. Swap `--topic` for any hype moment.

## Honest
A commodity content play in a dated window — no durable moat. Use official trailers under fair-use / commentary; respect
each platform's ToS + copyright; **not affiliated with Rockstar**. See `CONCEPT.md`.
