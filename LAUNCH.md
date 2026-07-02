# gta6-shorts — launch checklist (Phil's runbook)

Everything code-side is done + tested. This is the human runbook to turn the pipeline into posted content + the GTM.
Ordered by leverage. Honest: a commodity play in a dated window — no moat, so speed matters.

## 0. Publish the tool (optional, for the article CTA)
- [ ] `gh repo create philpof102-svg/gta6-shorts --public --source=. --push` (Phil — public repo = a publish action).
- [ ] Optional: `npm publish` (name `gta6-shorts`) so `npx gta6-shorts` works for others. Needs npm login.

## 1. Generate the first batch (5 min)
- [ ] `node pipeline.js --topic "GTA 6" --count 10 --out ./batch`
- [ ] Open `batch/master-prompt.txt`, paste into Claude with a real trailer link → get 10 voiceover scripts.
- [ ] Skim the script cards; anything with a `kill`/`revise` hook flag, regenerate that one.

## 2. Produce (per clip)
- [ ] Video: Higgsfield / Kling from the clip's angle + thumbnail brief.
- [ ] Voice + ambient: ElevenLabs from the voiceover script.
- [ ] Assemble 9:16 in Creatomate (Bebas Neue word-by-word subs, per the card's subtitle style).

## 3. Post (daily, follow `batch/calendar.csv`)
- [ ] One Short/day through the pre-launch window (the calendar dates each one).
- [ ] Same clip → YouTube Shorts + TikTok + Reels. Title + hashtags are on each card.
- [ ] Pin a channel trailer; keep a consistent handle/avatar.

## 4. Monetize (honest, no promises)
- [ ] Gumroad link in bio for a digital product (mod guide / build guide) — works before monetization is on.
- [ ] Discord ($5-10/mo) for early GTA6 update alerts.
- [ ] AdSense once eligible (gaming RPMs are public, single-to-low-double-digit $/1k views; your mileage varies).

## 5. GTM (the pipeline is the product)
- [ ] Publish `article-x.html` as an X article / blog (build-in-public angle: "one command → 10 shorts").
- [ ] Package the kit for sale (Gumroad / a Claude skill / the MCP) — the reusable pipeline is the sellable asset.
- [ ] Niche-swap `--topic` for the next hype moment to keep the engine earning past GTA6.

## Guardrails
Official trailers under fair-use / commentary only. Respect each platform's ToS + copyright. Not affiliated with Rockstar;
GTA / Grand Theft Auto are trademarks of their owners. Don't fabricate earnings in the marketing — real numbers only.
