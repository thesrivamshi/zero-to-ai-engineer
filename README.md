# Zero to AI Engineer

A single-file, no-build interactive course that takes you from *never opened a terminal* to *fundamentally strong AI engineer* — built around one idea: **you learn by building one agent (your LLM Twin) that grows every level**, picking up Python, JSON, SQL, function/tool calling, APIs, MCP, and multi-agent systems exactly when the agent needs them — and that Twin explicitly culminates as a production-grade **full MCP-exposed multi-agent system** (MCP server exposing tools/list+call + supervisor orchestration with voice Twin + retriever + critic at core). Share progress with beautiful ready-to-paste MD/YAML/JSON/GitHub snippets (live from P/AGENT/gates).

**Live demo:** https://zero-to-ai-engineer.vercel.app

It is just `index.html` + a `data/` folder of plain `.js` files. No framework, no build step, no server. Pure static single-file — fork, edit ONLY CUSTOM.discordInvite (one line) once, host anywhere (Vercel/Netlify/etc with no build, output dir=. ). Open the file and it runs. Full community productization: prominent in-app "Share your Twin" flows (floating CTAs, modals), beautiful live MD/YAML/JSON/GitHub snippets (from P/AGENT/gates), easy CUSTOM placeholder + openDiscord + fork helper UI, accountability via shares. LLM Twin culminates explicitly as full MCP-exposed multi-agent system. Static reinforced.

## What's inside each lesson

- **Original lessons** at full conceptual depth, with scenario-based quizzes.
- **🧪 Hands-on labs** that run locally in your browser — a simulated terminal, real Python via Pyodide, a SQL shell, and live API labs.
- **📐 Visual** — an original hand-drawn SVG schematic for the concept.
- **🎬 Watch** — hand-picked YouTube videos that play **100% inside the app** with **zero external links or new tabs required** (never suggests opening anything externally for watching). Uses lazy click-to-load inline YouTube iframes (responsive 16:9, controls, playsinline, playlists via videoseries, full timestamp support). Titles and "why" notes are always kept visible above the player (and remain visible during in-app fullscreen). Prominent in-app fullscreen button using `requestFullscreen` directly on the `.yt-player` container (which wraps title + why notes + player). No primary external playback links at all (tiny secondary OK but never used/required for video playback). Polished CSS for a delightful in-app player (card-like `.yt-player` with hover lift, elegant overlay/playbtn, accent load states, prominent FS, subtle transitions). ALL videos (from `data/videos.js` merged with any inline `lesson.videos`) are rendered exclusively via `renderVideos` + `parseYouTube`/`buildYTEmbed`/`loadYouTubePlayer`/`fullscreenVideo` — no other playback paths exist anywhere in the app.
- **📖 Read deeper** — the exact pages in the three reference books, with a per-book reading-progress tracker.
- **🎤 Test yourself** — deeper reveal-answer study questions.
- **📝 Notes** (a global pad + per-lesson notes) and a **🍅 Pomodoro** focus timer.
- **ADHD micros / choice / feedback (expanded)**: 🔥 Progress streaks + ⚡ Twin Power, ⚡ 24+ daily Quick Challenges (2-5min wins + new MCP/multi/scaling/share/ritual/fork/config/feedback ones), interactive sims w/ choice paths, micro-modules/5-min quick wins (marked ⚡, incl L5 MCP + new fork/share config), **beautiful ready-to-paste share snippets (MD/YAML/JSON/Forum/GitHub w/ MORE image badges + live P/AGENT/gates + MCP/multi highlights + streaks + tools + qc count)**, per-lesson 👍/👎 choice + instant feedback, prominent floating "Share your Twin" flows + ⚡Share+Discord CTAs + modals + auto gate prompts for frictionless shares/accountability. Pure client-side static. More added.

Six levels: Foundations → Working with Models → Building Applications → Customizing Models → Shipping to Production → Inference at Scale, each ending in a project gate, with a running **LLM Twin** build threaded through — culminating explicitly in a full **MCP-exposed multi-agent system** (spine builds: L2 function calling -> L3 RAG+agents -> L3 multi-agent patterns -> L5 MCP exposure + FTI deploy -> L5 supervisor multi-agent with Twin core -> L6 scaling (cost, latency, affinity, batching, persistence); your voice-tuned Twin as core writer, wrapped as shareable MCP server exposing tools/list+call, orchestrated with supervisor + retriever + critic specialists; Stage 3 + L5 gate is the explicit culmination). Share snippets + marketing highlight the full culmination. **Share your Twin** flows are prominent productized community features: floating CTAs (🚀 + new ⚡Share+Discord), modals (MD/YAML/JSON/Forum snippets w/ image badges + MCP/multi highlights + streaks powered by live P/AGENT/gates), home banners, sidebar + auto-prompts. Easy CUSTOM.discordInvite + openDiscord helper. Perfect for Discord/forums accountability. Pure static.

## About the books (please buy them)

This course is a guided path through the ideas in three excellent books, and it is **copyright-clean by design**:

- **AI Engineering** — Chip Huyen
- **LLM Engineer's Handbook** — Paul Iusztin & Maxime Labonne
- **Inference Engineering**

This repository contains **no text or figures from those books**. The "Read deeper" boxes are *page-number pointers* only, and the diagrams and questions are **original** work created for this course. To get the full value, **buy the three books** and read the referenced pages — the course tells you exactly which ones.

## Run it locally

No install needed. Either:

```bash
# simplest — just open the file
open index.html        # macOS  (or double-click it)

# or serve it (recommended, so the in-browser Python/embeddings labs behave)
python3 -m http.server 8000
# then visit http://localhost:8000
```

That's the whole app. Most of it works with **no API key**. Only the handful of *live* labs (real model calls, real embeddings, live evals) need one — see below.

## The API key is optional

~90% of the course runs keyless. A key only powers the live labs. Open **🔑 API key** in the sidebar; it explains exactly what each call is for. It's **provider-flexible** — point it at:

- **OpenAI** (default): base URL `https://api.openai.com/v1`, model `gpt-4o-mini` (costs cents).
- **A local model, free**: Ollama (`http://localhost:11434/v1`) or LM Studio (`http://localhost:1234/v1`) — key can be any non-empty string.
- **Any OpenAI-compatible gateway** (e.g. OpenRouter).

Your key is stored only in your browser (localStorage) and sent only to the provider URL you set.

## Cloud sync, accounts & leaderboard (optional)

The course runs fully **offline-first** — all progress lives in `localStorage` and you never need an account. As a productization layer, there's now an **optional** Supabase backend you can sign into (**☁️ Account** in the sidebar):

- **Sync across devices** — your progress, Twin/agent state, and notes back up to your account and follow you anywhere.
- **Live Hall of Fame** — a real cohort leaderboard (ranked by Twin progress, then ⚡ Power), replacing the old placeholder.
- **Public Twin page** — a shareable `#twin/<your-handle>` profile generated from your live state.

Auth is **email + password** or a **passwordless magic link**. The frontend talks to Supabase directly via the JS client; the database is locked down with **Row-Level Security** (you can only read/write your own rows; only the leaderboard view and public Twin pages are world-readable). The publishable anon key shipped in the client is safe by design — it grants nothing beyond what RLS allows. There is **no server to run**: Supabase *is* the backend, and the frontend stays a static single file.

> Forking? See **Self-host the backend** in `CUSTOM.md` for the one migration + two config lines (`SB_URL`, `SB_ANON`) to point it at your own Supabase project — or just delete those two constants to run 100% client-side like before.

## Deploy your own (reinforced: static frontend, optional Supabase backend)

It's a **single-file static site** (index.html + data/*.js, zero build step). Any static host works — fork, edit CUSTOM, push. Two easy paths:

### Vercel (CLI)

```bash
npm i -g vercel
vercel            # preview deploy, follow the prompts
vercel --prod     # production
```

When asked, set **no build command** and **output directory = `.`** (it's already static — there's nothing to build).

### Vercel (dashboard)

1. Fork this repo.
2. In Vercel, **Add New → Project → Import** your fork.
3. Framework preset: **Other**. Build command: *(empty)*. Output directory: `./`.
4. Deploy.

### Any other host

GitHub Pages, Netlify, Cloudflare Pages, or `npx serve` all work — just serve the repo root as static files.

## Cohort Guide (for Discord/forums/groups)

**Structure: 6 weeks, one level + gate per week (or 2 weeks/level for deeper cohorts).** Fully productized for community: static single-file, one-line CUSTOM fork (discordInvite + shareHashtag/cohortTagline), **very prominent in-app "Share your Twin" flows** (large floating 🚀 "Share your Twin" CTA, repositioned cluster to avoid overlap, extra 💬 Discord, 📋 Fork, prominent home banner with border, sidebar button, auto-prompt after every gate complete, combined copy+Discord in modal), beautiful ready-to-paste MD/YAML/JSON snippets (enhanced with MORE image badges, MCP/multi-agent highlights, streaks, tools, CUSTOM hashtag/tagline). Powered by live P + AGENT + gates state. All hooks use easy CUSTOM. Everything tied to the full MCP multi-agent Twin culmination.

- **Pace**: 15–40 min/day. ADHD-friendly: 🍅 pomodoro fab, per-lesson notes, 3-5min marked micro-lessons + 5-min quick-win micro-modules (extracted from long sections), 24+ daily ⚡ Quick Challenges (2-5min wins incl. MCP/multi/scaling/share/fork/config/choice), interactive sims w/ choice paths for multi-agent scaling, Twin Power gamification, scenario quizzes, choice everywhere (quizzes + gate paths), instant per-lesson quick feedback + 👍/👎 signals for dopamine. Streaks 🔥 + Power update live on completes.
- **Accountability via shares (MANDATORY at gates)**: Every week (after gate or Wed/Fri), **post your Twin share snippet** using the prominent in-app 🚀 "Share your Twin" flows (large floating CTA, modal with combined copy+Discord, home banner). **Gates (esp L5) require full MD/YAML/JSON with MCP+Multi-Agent badges + "full MCP-exposed multi-agent system" + mcp_tools + streak + live P/AGENT state.** Auto-generates beautiful live Markdown/YAML/JSON from P + AGENT + gates (stages, badges incl. 🔌MCP 🤖Multi-Agent, streaks, evidence, MCP/multi highlights + shields.io image badges that render inline in Discord/GH/forums; now with extra badges, mcp_tools, hashtag).
  - Copy-paste MD → instant progress brag + badge flex (incl. streak + cohort) + 🔥 streak + structured data. YAML/JSON for gists/tracking/bots.
  - **Mandatory ritual**: "✅ Stage 3 full MCP-exposed multi-agent + Gate 5 + 14d streak 🔌🤖". Use short MD for daily, full for gate posts. Post to #progress + #hall-of-fame.
  - Encourage replies with concrete: "your MCP ask_my_twin + critic handoff helped me debug faithfulness".
  - Prominent flows: floating CTAs (always visible + dynamic "MCP Twin" text when ready), home share banner (thick accent border), sidebar, share modal w/ preview card + copy buttons + "Copy short + open Discord" + micro-feedback, auto gate-complete prompt. All use live state + tie explicitly to MCP multi-agent culmination. Expand QUICK_CHALLENGES + gate checklists require "post Twin snippet".
- **Fork your cohort copy once (even easier)**: Edit ONLY `CUSTOM.discordInvite` (top of <script> in index.html — THE one line; also shareHashtag/cohortTagline for branding) → EVERY share snippet, floating CTA, sidebar, openDiscord(), home banners, hooks update. Use prominent in-app Fork Helper UI (📋 buttons in Settings/Share/Home + dedicated modal with prefilled CUSTOM-aware cmds + extras). Reinforce: purely static (index.html + data/*.js), zero build, client-only. Deploy: Vercel/Netlify/etc output dir=. no build cmd. Perfect for private cohorts. See CUSTOM.md for full templates.
- **Concrete weekly structure + accountability via shares (6-week example, flexible for cohorts; all powered by prominent in-app flows + CUSTOM)**:
  - **Mon–Tue (Foundations + choice micros)**: Core lessons (15-30min) + quizzes (instant feedback) + 1-2 short labs. Pick 1 daily ⚡ Quick Challenge (new MCP/multi/scaling/share ones added e.g. "MCP handoff test", "5-min share ritual choice"). Use per-lesson 👍/👎 for instant dopamine. **Post short Twin MD snippet** via floating 🚀 or ⚡Share+Discord (builds 🔥 streak + visible accountability).
  - **Wed (Twin track day + community hook)**: Complete level's Twin stage + hands-on lab (L3 retriever Stage1; L4 voice Stage2; **L5: MCP server + full supervisor multi-agent Stage3 culmination**). Hit prominent 🚀 Share your Twin (paste full or forum MD). Post to #progress or Discord thread. Accountability check-in: "drop your live snippet".
  - **Thu (Review + micro choice)**: Remaining lessons + review checkpoint (spaced). Quick challenge + micro feedback. Optional videos. **Daily ritual**: any complete → tap floating share short → paste + cohort reply.
  - **Fri (Gate day — mandatory share + celebration)**: Finish gate checklist + evidence (live in P + saved). Verify capstone if present. **Mandatory**: use prominent 🚀 Share flow to post beautiful full MD/YAML/JSON (L5: must include MCP+🤖Multi-Agent badges, "full MCP-exposed multi-agent system", tools list from AGENT, streak, live JSON). Use "Copy short + open Discord" in modal. Celebrate; host uses "paste snippet" thread.
  - **Weekend (catchup / rest + gentle nudge)**: Optional deep work or rest. Post catch-up short share snippet if completing. Streaks + Power give soft accountability nudge without pressure.
  - **Weekly sync (1x, async or live)**: EVERY cohort member pastes latest live share snippet (from in-app) + 1 MCP/multi-agent/scaling insight or surprise. Use per-level prompts. Leader pins templates from CUSTOM.md.
- **ADHD micro accountability rituals (frictionless via CTAs)**: Complete lesson/QC/gate → floating 🚀 or extra ⚡Share+Discord (copies short from live P/AGENT/gates) → paste to Discord #progress. Auto gate prompt on L5 etc. Home banner + sidebar always show "Share your Twin". Streaks/badges update in snippets live. Use 👍 micro + quick wins for instant wins.
- **Daily accountability ritual (ADHD micro)**: Complete ANY lesson/challenge/gate → tap floating 🚀 Share Twin (short version) → paste to cohort Discord. Streaks + badges update live in snippet. Use 👍/👎 on lesson for instant self-signal. Quick wins = dopamine + visible progress.
- **Hosting/custom for cohort**: One CUSTOM edit + fork helper = branded everything. Static = trivial private Vercel etc.

**Concrete weekly accountability calendar (example for 6-week cohort, all using in-app 🚀 flows + live snippets from P/AGENT/gates)**:
Use the floating CTAs, home banner, sidebar, QC toasts, gate auto-prompts, and "Copy short + open Discord" for frictionless shares. Short MD daily (badges + streak), full MD/YAML/JSON at gates/weekly (MCP/multi highlights + tools). 

| Day | Focus | Must-share via in-app | Discussion tie-in |
|-----|-------|-----------------------|-------------------|
| Mon | Lx lessons + quizzes + 1 QC (choice) + 👍/👎 | Short MD snippet after 1 complete | "1 aha from micro" |
| Tue | Labs + remaining micros (5min wins) | Short share + streak bump | MCP/multi preview (e.g. "this retriever becomes L5 MCP tool") |
| Wed | Twin stage complete (L5 = full MCP server + supervisor multi-agent) | Full or forum MD via 🚀 (auto includes 🔌🤖 + tools) | "Supervisor handoff or MCP list/call win" |
| Thu | Review checkpoint + choice QC + sims | Quick short share ritual | Scaling note or Lx prompt reply |
| Fri | Gate + evidence (L5 mandatory capstone proving full MCP multi-agent) | **Mandatory** full MD + YAML/JSON + badges (L5 must say "full MCP-exposed multi-agent system" + mcp_tools) + "Copy short + Discord" | Post to #progress + #hall-of-fame; reply to 1 peer with MCP insight |
| Sat | Catchup / deep lab | Optional short if completing | Gentle nudge share |
| Sun (or sync) | Weekly sync | Paste latest live snippet (from app) + 1 MCP/multi-agent/scaling surprise | Leader uses per-level prompts below |

All accountability = visible shares of live state (stages, badges, mcp_tools, streak) build momentum. Streaks update in every snippet. Post-L5 = celebration of explicit culmination as full MCP-exposed multi-agent Twin.

### Per-level discussion prompts (reference MCP / multi-agent / scaling) + examples (use live snippets)
Use in threads/live. **Always paste auto-generated live snippet from the prominent in-app 🚀 "Share your Twin" flows** (floating CTAs, home banner, sidebar, modal — enhanced with image badges, MCP/multi-agent highlights, streaks, tools from live P/AGENT/gates state). Short MD daily; full MD + YAML/JSON at gates + auto prompt. Accountability = visible shares build cohort momentum + streaks.

**Level 1 (Foundations)**: What surprised you most about next-token prediction and why "plausibility ≠ truth"? How does that affect the agent spine you'll build all the way to a full MCP-exposed multi-agent Twin (L5 culmination)?
- Kickoff example: "Tokenizer + temp sim done. Aha: models are pattern completers not truth engines. Streak 🔥3. (Twin culminates L5 as full MCP multi-agent system w/ MCP tools + supervisor.) [paste short MD from 🚀]"
- Accountability share: post short MD after first 3 lessons + 1 QC (use floating ⚡Share+Discord).

**Level 2 (Working with Models)**: Prompting vs. evals — why does measurement beat vibes even for the smallest Twin? Post one concrete eval number from your L2 chatbot. How will evals protect your future MCP multi-agent system?
- Ex: "L2 eval 62%→81% after edge cases. Evals are the engineering. L5 supervisor will rely on these. Share: [paste full MD]"
- Mid-week ritual: share L2 progress snippet in #progress + 1 sentence on eval insight + MCP tie-in.

**Level 3 (Building Applications)**: RAG + agents. When does the supervisor pattern beat a single agent? Share L3 Twin Stage 1 (retriever) + retrieval fail fixed. How does this foundation become full MCP + multi-agent (supervisor + MCP tools at L5)?
- Ex: "Embeddings lab + qc3. Fixed chunk=120. Twin 33% 🧠 Stage1. L5 adds MCP exposure + supervisor orchestration (writer+retriever+critic). [snippet from in-app]"
- Post retriever gate share (use image badge MD + "L5 will make this MCP consumable").

**Level 4 (Customizing Models)**: Voice fine-tuning. How do you know the model "sounds like you"? Post L4 snippet + blind test/DPO. What happens to general capability when adding voice to future MCP multi-agent Twin?
- Ex: "4/5 picked voice Twin. DPO fixed formal tone. Stage2 ✅. Preps for MCP multi-agent at L5 (voice as writer specialist)."
- Accountability: reply to 2 peers' L4 shares with "your voice Twin + critic idea will be key in supervisor handoff...".

**Level 5 (Shipping + full MCP-exposed multi-agent — the explicit culmination)**: Your Twin is served + **MCP-exposed** (tools/list + tools/call for ask_my_twin etc) + inside supervisor multi-agent (voice Twin writer + retriever + critic). **Share full L5 snippet (MCP+Multi badges + stages + YAML/JSON + tools)** using 🚀 flow. **Mandatory share ritual at L5 gate**. Prompts: What tools exposed via MCP? How supervisor changed failure modes vs single agent? Real traces for cost/latency? How MCP makes Twin consumable by Claude/Cursor/other agents? Scaling notes for L6? Post snippet + "1 handoff that caught a fail".
- Template: "MCP tools: ask_my_twin, recall, list_writing exposed (list+call verified). Supervisor + critic caught 3 fails. 🔌MCP 🤖MultiAgent 100% ✅ full MCP-exposed multi-agent system. Live YAML/JSON from P/AGENT/gates attached. [paste full from modal]"
- Use L5 l5twin3 + MCP labs + gate Part D (now requires post snippet evidence). Post YAML for cohort tracking bots. **Mandatory: full beautiful share with image badges + MCP culmination text after L5 gate**.
- Example full cohort post: "✅ Stage 3 complete — my voice at the core of MCP multi-agent system! [paste full MD with 6 badges + MCP success + JSON] Supervisor handoff fixed hallucination. Cost trace: 0.003$/query. Your turn — share your MCP tools! #ZeroToAIEngineer"
- Extra L5 prompt: "Which MCP tool or supervisor pattern from your Twin would you expose to the cohort registry first?"

**Level 6 (Scale)**: At 100× volume, where does your Twin (full MCP multi-agent) break first? Share L6 + economics arithmetic + one MCP supervisor optimization. How does scale affect handoffs vs single?
- Ex: "KV+batch keeps p99<800ms @40rps. $X/mo at 1k rpd. MCP supervisor stable under scale; critic early-exit saved tokens. Full L6 share + config from in-app..."
- Bonus: After L5 gate+share, celebrate the productized MCP multi-agent Twin. Use all floating CTAs (🚀 + ⚡) /snippets. "Post-L5 celebration share" ritual: everyone pastes L5 culmination snippet (MD/YAML) + "1 thing I learned building the full system" + L6 scaling note.

**Extra cohort rituals using new share enhancements**: Use QC22 (fork choice), QC23 (MCP config JSON/YAML export), QC24 (choice+feedback loop) + new GitHub MD format in shares. Every share auto-pulls live state. Leaders: pin one full example MD/YAML per gate in Discord using in-app generated (with image badges). Accountability scales with visible "full MCP-exposed multi-agent" badges at L5.

**Bonus rituals & accountability using shares** (frictionless via prominent flows + new extras):
- Gate complete (esp L5) → auto modal prompt + floating 🚀 always visible → paste full beautiful MD/YAML/JSON.
- Daily ADHD micro: any complete/ QC → tap floating 🚀 Share or ⚡Share+Discord (copies short live from P/AGENT/gates) → paste to Discord. Streaks + badges update live.
- Wed/Fri cohort check: "Paste your latest Twin share snippet (MD for badges or forum MD)".
- Weekly sync: EVERYONE posts latest snippet + "MCP/multi-agent/scaling ref or surprise".
- Post-L5 celebration + L6: use all CTAs to share culmination + scale notes.
- Streaks + badges + "FULL MCP MULTI-AGENT" in every snippet provide visible public accountability + dopamine.
- Example: "Week 5 MCP Twin shares — drop your 🔌🤖 snippet below (use the in-app 🚀 for live badges + MCP tools). Reply with one tool or handoff..."
- Use 👍/👎 micro + new QC that say "then hit 🚀 or ⚡ share". All tied to full MCP multi-agent Twin.

## How to run a cohort

See full details in the **Cohort Guide** above and [CUSTOM.md](./CUSTOM.md).

**One-line fork for your Discord cohort (pure static, zero build):**
1. `git clone https://github.com/thesrivamshi/zero-to-ai-engineer.git` (or your fork)
2. Edit **only** the `discordInvite` (and optionally `shareHashtag`, `cohortTagline`) in the `CUSTOM` object at top of `<script>` in `index.html`.
3. Serve: `python3 -m http.server 8000` (or `npx serve .`)
4. Deploy: Vercel/Netlify/GH Pages/Cloudflare with **no build command**, **output dir = `.`**

- One CUSTOM edit → instantly brands: all floating CTAs (🚀 Share your Twin + ⚡Share+Discord), Share modal (live MD/YAML/JSON/Forum with image badges + MCP 🤖Multi-Agent + streaks from P/AGENT/gates), sidebar, home banners, openDiscord(), fork helper, auto prompts.
- Prominent in-app Fork Helper UI (📋 buttons everywhere + modal) gives prefilled CUSTOM-aware commands.
- Accountability ritual: after every lesson/QC/gate (esp L5), use 🚀 or ⚡ to copy live snippet → paste in #progress. Streaks, Twin Power, badges update live.
- 6-week rhythm (or flexible): Mon-Wed lessons+quizzes+micros (instant feedback), Wed Twin stage+share, Thu review, Fri Gate+mandatory full share celebration.
- All tied to the explicit L5 culmination: full MCP-exposed multi-agent Twin.

## By the end you will have

- A complete, running **LLM Twin** that knows your writing, speaks in your voice, and is deployed as a **full MCP-exposed multi-agent system** (Stage 3 + gate): your voice Twin as core writer specialist inside a supervisor-orchestrated system (with retriever + critic), with tools exposed via standard MCP (tools/list + tools/call) so any client (Claude, Cursor, other agents) can consume it. **Full working MCP server + supervisor MA Twin + portfolio of live shares.** (Explicitly updated in stages, gates, snippets, marketing, L5 labs.)
- Hands-on mastery: Python, terminals, JSON/SQL for memory, function calling, RAG, evals, LoRA/QLoRA fine-tuning (Colab notebooks), FastAPI/Docker serving, MCP server by hand + SDK, supervisor multi-agent patterns by hand + frameworks, inference scaling (KV cache, batching, quantization, speculative decoding, cost math, parallelism).
- Original diagrams, 250+ study questions, 140+ hand-picked in-app videos (zero external tabs), per-lesson book page references covering all chapters of the 3 core books.
- ADHD-optimized: streaks 🔥, Twin Power XP, 25+ daily 2-5min Quick Challenges with choice+instant feedback (incl fork/custom/MCP config export + "post Twin snippet" gate ritual), per-lesson 👍/👎 micro-wins, pomodoro, notes, 3-12min lessons + marked 5min micros, choice paths in sims for MCP/multi/scale.
- Community productized: beautiful ready-to-paste share snippets (MD/YAML/JSON/Forum/GitHub with MORE shields.io image badges, live P/AGENT/gates state, MCP/multi tools, streaks, QCs) generated from progress + Twin; prominent CTAs (floating 🚀 + ⚡Share+Discord + fork), auto gate prompts; easy CUSTOM one-line for cohort Discord/forking. Fork helper UI everywhere. **Mandatory share rituals at every gate.**
- Portfolio evidence: 6 gates with saved checklists + live verification (L5 gate perfectly requires full MCP server + multi-agent supervisor evidence + posted share snippet; L6 capstone requires deployed + 25+ eval + defense).
- The confidence of an AI engineer: you can build, ship, scale, and explain end-to-end agent systems from first principles.

**Everything is cohesive, single-file static (index.html + data/*.js), forkable in minutes, 100% client-side.**

### Concrete Cohort Launch Instructions (5-min setup for leaders)
1. Fork repo (GitHub). Edit **only** `CUSTOM.discordInvite` (top `<script>` in `index.html` — one line; optional: `shareHashtag`, `cohortTagline` for branding in ALL shares/CTAs/snippets).
2. (Optional) Customize Discord: use in-app `showDiscordStructure()` (via settings or home "💬 Discord setup", or floating CTAs) — copy suggested channels (#welcome, #progress, #hall-of-fame, #weekly-sync, #rituals). Pin the onboarding + share ritual text from CUSTOM.md.
3. Host: Vercel (import fork, "Other" preset, **empty build cmd**, output dir `.`) or Netlify/GH Pages/Cloudflare/Pages/serve — pure static, no build ever. Share the live URL in welcome.
4. Launch ritual (first sync): Members open app → onboarding modal fires (MCP Twin intro + quick win prompt) → complete 1 lesson + ⚡ QC → tap 🚀 Share Twin (floating) or ⚡Share+Discord → paste live short MD (auto has badges + "full MCP-exposed multi-agent" for L5) into #progress.
5. Weekly: Leader pins templates. Every Fri post-gate: mandatory full MD/YAML from in-app + "1 MCP/multi-agent insight". Use Hall of Fame placeholder (🏆 in home/settings) to celebrate L5 culmination shares.
6. Fork helper UI everywhere (📋) + settings has "Copy full fork guide" + Discord ex + Hall. One edit = all in-app CTAs, modals, banners, auto-prompts branded. Add your examples to Hall by forking.
7. Onboard prompt + per-lesson share CTAs + QC toasts + gate auto + floating always visible = low friction for short attention spans.
8. Track: Export/import progress JSON for members; JSON shares for bot scraping if wanted.
Run tests before launch: `cd /Users/leo/zero-to-ai-engineer && node tests/run.js`.

### Expanded Discussion Prompts for Cohort Syncs (use with live in-app snippets)
**Always** have members paste auto-generated live snippet (MD short for daily; full+badges for gates) from 🚀 "Share your Twin" (floating, home banner, sidebar, modal — now with 7+ formats incl twitter/linkedin/weekly + MCP culmination text).
- **Kickoff (L1)**: "What surprised you about next-token + hallucination? How does this shape building a trustworthy full MCP multi-agent Twin at L5?" Example post: paste short + "Tokenizer sim done. Pattern completer, not truth engine. Streak 2. #ZeroToAIEngineer"
- **Mid (L3 RAG/agents)**: "When does supervisor beat single agent for your Twin? How does Stage 1 retriever become consumable via MCP at L5?" Paste full MD + "Fixed chunking; now ready for MCP tools exposure."
- **L4/L5 focus (voice + MCP culmination)**: "How does voice + MCP exposure change the Twin? What tools will you expose? How does critic handoff prevent blast radius?" **Mandatory L5**: post full MD/YAML/JSON with "✅ FULL MCP-EXPOSED MULTI-AGENT SYSTEM" + badges + live config.
- **L6**: "Where does your MCP multi-agent Twin break at 100x? One KV/batch/critic optimization?" Post weekly report template.
- **Rituals**: "Paste your latest from 🚀 (short or weekly). Reply with 1 MCP tool or scale win you learned." Use Hall of Fame for post-L5 celebration shares.
Concrete launch + these prompts + all new in-app CTAs/Hall/onboard/Discord ex = ready for cohort.

## By the end you will have


See [CUSTOM.md](./CUSTOM.md) for templates.

## Develop / run the tests

The app ships with a jsdom test suite (data integrity, every view renders, exercise logic, reading/diagram/question/video coverage, copyright safety on diagrams, etc.).

```bash
cd tests
npm install      # installs jsdom
cd ..
node tests/run.js
```

Adding content? The data lives in `data/level{1..6}.js`, `data/glossary.js`, `data/reads.js` (book pages), `data/videos.js`, `data/diagrams.js` (inline SVG), and `data/questions.js`. Videos render 100% inside the app via lazy inline YouTube iframes only — see `renderVideos` + `parseYouTube`/`buildYTEmbed`/`loadYouTubePlayer`/`fullscreenVideo` in index.html (click-to-load overlays, responsive 16:9, controls, playsinline, playlists via videoseries, timestamps, prominent in-app fullscreen using requestFullscreen on the .yt-player container; titles + why notes kept visible at all times; no primary external playback links). Do not touch books or quizzes. Keep the tests green.

## License

MIT — see [LICENSE](LICENSE). The code and the original course content (lessons, diagrams, questions) are MIT-licensed. The three reference books are **not** included and remain the property of their authors and publishers.
