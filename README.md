# gta6-shorts — faceless Short content engine (GTA 6 hype play)

Turn a trending topic (GTA 6, launch ~Nov 19 2026) into ready-to-shoot vertical Shorts: **hooks + 5 script beats +
thumbnail briefs + a daily posting calendar + a master LLM prompt**. Hooks are gated by **slopscore** so you never ship slop.

## Run
```bash
node shorts.js      # self-test (8/8)
npm run mcp         # stdio MCP: plan_shorts + get_master_prompt
```
MCP install (Claude Desktop / Cursor):
```json
{ "mcpServers": { "gta6-shorts": { "command": "npx", "args": ["-y", "gta6-shorts", "gta6-shorts-mcp"] } } }
```

## Pipeline
1. `plan_shorts` → the plan + a master LLM prompt.
2. Feed the master prompt to Claude → slop-guarded voiceover scripts (slopscore kills weak hooks).
3. A video tool (Higgsfield / Kling + ElevenLabs + Creatomate) → the 9:16 clips.
4. Post daily through the pre-launch window; monetize (AdSense + digital products + Discord).

## Honest
A commodity content play in a dated window — no moat, crowded, off the Base thesis. Use official trailers under
**fair-use / commentary**, respect each platform's ToS + copyright; **not affiliated with Rockstar**. See `CONCEPT.md`.
