# CUSTOM — Fork, Brand, and Extend (Zero to AI Engineer)

This course is deliberately a **single static file** (`index.html` + plain `data/*.js`). No frameworks, no build, no server. Forking, customizing for a cohort, and hosting are intentionally trivial.

## One-line fork recipe
```bash
git clone https://github.com/thesrivamshi/zero-to-ai-engineer.git
cd zero-to-ai-engineer
# edit the CUSTOM object and data/ files (see below)
python3 -m http.server 8000   # or npx serve .
# deploy: Vercel/Netlify/Pages → framework=None, build cmd empty, output dir=.
```

## The CUSTOM object (in index.html, near top of <script>)
```js
const CUSTOM = {
  discordInvite: 'https://discord.gg/YOUR_COHORT_HERE', // ← THE ONLY LINE most forks change (easy-to-customize Discord placeholder; powers ALL community hooks, floating "Share your Twin" CTAs (🚀 + ⚡Share+Discord), openDiscord helper, beautiful MD/YAML/JSON/Forum snippets w/ badges + streaks + MCP/Multi, sidebar, banners, fork helper)
  communityName: 'Zero to AI Engineer Cohort',
  githubRepo: 'https://github.com/thesrivamshi/zero-to-ai-engineer', // point to your fork
  forkNote: 'Static single-file app — just fork, edit index.html + data/*.js, push to any static host. 100% client-side, P + AGENT localStorage only. No build ever.'
};
```
- Change `discordInvite` once → all "Share your Twin", sidebar, settings, and snippets update automatically.
- `openDiscord()` helper is exposed globally for any future buttons or labs.

## Easy customization points (ADHD-friendly micro-edits)
- **Community**: Only the discordInvite above. One-line change powers floating CTAs, Share snippets, sidebar, openDiscord(), home banners, auto-prompts.
- **Content micro-modules / 5-min quick wins**: Add tiny lessons inside `data/levelX.js` chapters (they already have `min:5` etc.). Example new quick win:
  ```js
  {id:"l3quick1", t:"5-min win: one-line faithfulness check", min:5, body:`<p>Prompt the model: "Answer ONLY from the chunks below. If nothing matches say 'I don't know from these docs'."</p>` , quiz:[...] }
  ```
- **Twin progress / badges / shares**: All live from `P` (browser progress) + gates + lightweight live AGENT state (for twin config snippets). `buildShareSnippets()` (and showShareCTA) auto-generates beautiful ready-to-paste MD (shields.io image badges), short MD, Forum/GitHub MD, YAML, JSON using live P/AGENT/gates. Explicitly culminates as full MCP-exposed multi-agent system. Badges incl. 🔌MCP 🤖Multi-Agent + streaks + live config. Prominent in-app "Share your Twin" flows + floating CTAs (🚀 Share Twin, ⚡Share+Discord, Discord, Fork) + auto gate prompts + sidebar/home banners. One CUSTOM.discordInvite powers all. Perfect community productization.
- **Fork helper UI**: Prominent in Settings, Share modal, home banners. "📋 Fork helper" buttons + dedicated showForkHelper() flow generate CUSTOM-aware clone/edit/serve/deploy cmds (pre-fills your discordInvite). Add more in share/home if desired. Static reinforced everywhere.
- **Static reinforcement**: Everywhere we call out "single-file, no build, client-only".
- **ADHD additions**: Short `min:3`–`min:5` lessons, choice in quizzes, instant quiz/exercise feedback, pomodoro fab, per-lesson notes.

## Sharing Twin (uses live P + gates) — even prettier + MCP + multi-agent + community hooks
- Prominent in-app "Share your Twin" flows: large floating 🚀 "Share your Twin" CTA (dynamic text when L5 MCP complete), extra floating ⚡Share+Discord (low-friction 5s ritual), 💬 Discord, 📋 Fork CTAs, prominent home dashed banner (thick border + extra copy short button), sidebar share button, auto-prompt after every gate complete (esp L5).
- Produces beautiful ready-to-paste MD/YAML/JSON + **Forum/GitHub MD** snippets (enhanced with image badges, live from P/AGENT/gates):
  - Full Markdown (Discord/forums/GitHub-ready w/ shields.io colorful badges for progress/gates/streak/MCP/Multi-Agent/Power/Cohort)
  - Short MD (fast daily posts)
  - Forum flavored MD (threads, issues — MCP focus + prompt for discussion)
  - YAML (gists/configs/bots) — includes mcp_exposed, multi_agent_orchestrated, live_config_from_P
  - JSON (tracking/bots/structured) — culminates_as + live_state + share_variants
- Automatically reflects live: Twin Stages 1/2/3 (Retriever / Voice / **full MCP-exposed multi-agent system**), all gates, badges (🔌MCP 🤖Multi-Agent etc), streak, evidence, MCP tools, agentState, quick wins from P. Ties directly to L5 culmination.
- Community hooks: easy CUSTOM.discordInvite placeholder (one-line) + openDiscord() global helper (window.openDiscord exposed). All CTAs/snippets use it. Add shareHashtag/cohortTagline for branding.
- Accountability: post snippets after gates/lessons; use combined "copy short + open Discord" buttons.

### Example community share snippets (copy-paste ready templates)
**Beautiful MD example (with badges, MCP culmination):**
```
## 🚀 My LLM Twin Progress — Zero to AI Engineer

![Twin Progress](https://img.shields.io/badge/Twin-100%25-brightgreen) ![Gates](https://img.shields.io/badge/Gates-6/6-yellow) ![Streak](https://img.shields.io/badge/Streak-12--day-orange) ![MCP](https://img.shields.io/badge/MCP-Exposed-success) ![Multi-Agent](https://img.shields.io/badge/Multi--Agent-Supervisor-blue)

**100% of Twin complete** (3/3 stages) · 6 gates shipped · 🔥 12-day streak

**Badges:** 🧠 Retriever 🎤 Voice 🚀 Deployed 🔌 MCP 🤖 Multi-Agent 🛠️ Builder 📈 Engineer 🏆 Scale Master

**✅ MCP + Multi-Agent Culmination:** Your Twin is now a full **MCP-exposed multi-agent system** (supervisor + voice Twin writer + retriever + critic). Tools discoverable via MCP.

...
Join: https://discord.gg/...
```

**Beautiful MCP+Multi+Scaling Twin share example (L5 gate + L6 scale notes; ready for #hall-of-fame):**
```
## 🚀 FULL MCP-EXPOSED MULTI-AGENT LLM TWIN — Zero to AI Engineer

![Twin Progress](https://img.shields.io/badge/Twin-100%25-brightgreen) ![MCP](https://img.shields.io/badge/MCP-10k%2Bservers-success) ![Multi-Agent](https://img.shields.io/badge/Supervisor%2BCritic-blue) ![Scale](https://img.shields.io/badge/L6-KV%2BBatch-green) ![Streak](https://img.shields.io/badge/Streak-14--day-orange)

**100% (3/3) 🧠🎤🔌🤖** · 6 gates · 14d 🔥 · MCP tools: ask_my_twin, recall_memories, list_writing, handoff

**Stage 3 CULMINATION:** Served MCP server (tools/list+call) + supervisor MA (voice Twin core + retriever + critic). LangGraph checkpointers + MCP gateway for scale. L6: 0.55× cost via cache at 40rps.

**Live YAML/JSON + P/AGENT state attached.** Posted per mandatory gate ritual.
Join: https://discord.gg/... #ZeroToAIEngineer
```

**Short version for quick cohort updates:**
```
**My LLM Twin** — 100% (3/3) 🧠 Retriever 🎤 Voice 🔌MCP 🤖MultiAgent 🔥12d
✅ Stage 1 · ✅ Stage 2 · ✅ Stage 3 — MCP + Multi-Agent
Join: https://discord.gg/...
```

Use these in Discord threads or your cohort README. The in-app Share button generates your live version.

## Making the LLM Twin culminate in a full MCP-exposed multi-agent system (explicit)
- The running LLM Twin **explicitly culminates at L5** as a full **MCP-exposed multi-agent system** (Stage 3: served + MCP tools/list+call exposed + supervisor orchestration with voice Twin writer + retriever + critic specialists).
- Updated in: stages (getTwinStatus), l5twin3 lesson + l5gate (Part D checklist requires MCP server + multi-agent supervisor), gates, share snippets (badges + text + yaml/json), QUICK_CHALLENGES (MCP/multi focused), floating CTAs (dynamic "FULL MCP Twin"), marketing (home, sidebar, README, CUSTOM.md, index.html), updateAgent on L5 gate.
- All references use "full MCP-exposed multi-agent system". MCP makes your Twin consumable by Claude/Cursor/agents. Marketing everywhere calls it the explicit end-state.

## Hosting & forking is even easier (reinforced everywhere) — CUSTOM + prominent fork helper UI + static nature
- GitHub Pages, Vercel (output dir `.`, build cmd empty), Netlify, Cloudflare, `python -m http.server` / npx serve. **Pure static single-file** (index.html + data/*.js only).
- 100% client-side. Progress + Twin state = localStorage (P + AGENT + gates). No backend.
- For private cohort: fork → private repo → edit ONLY CUSTOM.discordInvite (one line + optional hashtag) → deploy (no build cmd, output dir=.).
- **Prominent in-app fork helpers**: 📋 Fork floating CTA + buttons throughout (Settings/Share/Home) + enhanced showForkHelper() modal (prefilled CUSTOM-aware cmds, extras, copy-all, + preview share snippets). All flows (shares, CTAs, openDiscord) auto update from one edit.
- Static reinforced in every banner, fork UI, share footers, modals, README, CUSTOM.md: "fork, ONE edit, push. No build. Pure static." Perfect for Discord cohorts / ADHD 2-min cohort setup.

## Cohort accountability via shares
See expanded README "Cohort Guide" section for concrete weekly structure (Mon-Fri rhythm + weekends), accountability via "post your Twin snippet" rituals (using live MD/YAML/JSON from P/AGENT/gates), per-level discussion prompts (MCP/multi-agent/scaling refs). Share flows + floating CTAs make it frictionless. Auto-prompt after gates.

## More ADHD-friendly (expanded micro-modules / 5-min quick wins / choice / instant feedback)
- 3–12 min lessons + many marked micro (min:5).
- Instant feedback on every quiz + lab + sim (choice paths e.g. multi-agent scaling).
- Micro wins + per-lesson 👍/👎 choice buttons (dopamine + streak bumps).
- **Progress Streaks** 🔥 + **Twin Power** ⚡ XP (live in sidebar/home/shares).
- **Quick Challenges** ⚡ — 24+ daily 2–5 min wins (many MCP/multi-agent/scaling/community/share focused, e.g. "MCP + multi-agent micro: handoff test", "Share ritual choice", "Cohort accountability 2-min", new "fork choice customize share", "MCP config export JSON/YAML", "choice+instant feedback loop"). Floating ⚡Share+Discord + showQuickChallenge buttons everywhere. Per-lesson 👍/👎 + QC toasts auto-offer share.
- Add yours: edit QUICK_CHALLENGES in index.html (or add quick lessons in data/levelX.js). Extra for L5 full MCP multi-agent culmination + sharing + fork. All pure client-side. Fork freely.

## Community Templates & Examples (for Discord / forks / accountability)
Use these with the in-app 🚀 Share your Twin (now with enhanced image badges, MCP/multi-agent, streaks). All generated from live P + AGENT + gates. One CUSTOM.discordInvite edit brands them all + floating CTAs + modals.

### 1. Example CUSTOM setup for your Discord cohort (easy forking)
```js
const CUSTOM = {
  discordInvite: 'https://discord.gg/YOUR_COHORT_INVITE',
  communityName: 'My AI Engineer Cohort',
  githubRepo: 'https://github.com/you/your-fork',
  forkNote: 'Pure static single-file (index.html + data/*.js) — fork, ONE CUSTOM.discordInvite edit, push. No build, output dir=..',
  shareHashtag: '#MyCohortTwins',
  cohortTagline: 'Our full MCP-exposed multi-agent LLM Twins',
  discordChannel: '#twin-progress'
};
```
- Change the invite + optional hashtag/tagline once → every share snippet, modal, home banner, sidebar, fab CTAs, fork helper reflect it instantly. No rebuild.
- For private cohort: private fork + private Vercel (output dir `.`, no build).

### 2. Beautiful full MD / GitHub MD / YAML share templates (with image badges — copy-paste ready, enhanced for MCP culmination + live P/AGENT/gates + new QCs + githubMd variant)
Use in-app 🚀 (now 8+ formats incl. short, forum, GitHub, twitter, weekly, JSON, YAML). GitHub MD variant optimized for discussions/issues (includes live config + culmination text).
```
## 🚀 My LLM Twin Progress — Zero to AI Engineer

![Twin Progress](https://img.shields.io/badge/Twin-100%25-brightgreen) ![Gates](https://img.shields.io/badge/Gates-6/6-yellow) ![Streak](https://img.shields.io/badge/Streak-14--day-orange) ![MCP](https://img.shields.io/badge/MCP-Exposed-success) ![Multi-Agent](https://img.shields.io/badge/Multi--Agent-Supervisor-blue) ![Cohort](https://img.shields.io/badge/MyCohort-active-blueviolet)

**100% of Twin complete** (3/3 stages) · 6 gates shipped · 🔥 14-day streak

**Badges:** 🧠 Retriever 🎤 Voice 🚀 Deployed 🔌 MCP 🤖 Multi-Agent 🛠️ Builder 📈 Engineer 🏆 Scale Master

### Twin Stages
- ✅ Stage 1 — Retriever Twin (RAG over your writing)
- ✅ Stage 2 — Voice Twin (fine-tuned on your corpus)
- ✅ Stage 3 — full MCP-exposed multi-agent system (served + MCP tools/list+call + supervisor)

**✅ FULL MCP-EXPOSED MULTI-AGENT TWIN CULMINATION (Stage 3):** Your Twin is now a production-grade MCP-exposed multi-agent system (your voice Twin as core writer + retriever + critic; supervisor orchestration). MCP tools/list + tools/call exposed. Tools: ask_my_twin, recall_memories, list_writing, supervisor_handoff.

**Live Twin Config:** ```json { "mcpExposed": true, "multiAgentOrchestrated": true, ... } ```

Join: https://discord.gg/YOUR... #MyCohortTwins
Fork: https://github.com/...

*Live from browser P/AGENT/gates — pure static single-file course*
```
Paste MD → badges render as colorful images in Discord. Perfect for #progress channel.

### 3. Short MD for daily accountability / quick wins (used by in-app short copy)
```
**My LLM Twin** — 100% (3/3) 🧠 Retriever 🎤 Voice 🔌MCP 🤖MultiAgent ✅ 🔥14d
✅ Stage 1 · ✅ Stage 2 · ✅ Stage 3 — MCP + Multi-Agent
MCP tools: ask_my_twin, recall... #MyCohortTwins · Join: https://discord.gg/...
```
Use after every lesson / QC for streaks + visible progress.

### 4. YAML example (for gists, tracking bots, cohort README)
```yaml
twin:
  progress: 100
  streak_days: 14
  mcp_exposed: true
  multi_agent_orchestrated: true
  mcp_tools: ["ask_my_twin", "recall_memories", ...]
  stages:
    3_mcp_multiagent: true
  community: https://discord.gg/...
  hashtag: #MyCohortTwins
  static_fork: true
  # Twin culminates as full MCP server + supervisor multi-agent
```

### 5. JSON (for bots, structured cohort progress, forks)
```json
{
  "twin": { "progress_pct": 100, "mcp_exposed": true, "multi_agent": true, "culminates_as": "full MCP-exposed multi-agent system...", "streak_days": 14 },
  "links": { "discord": "..." },
  "fork_ready": { "static": true, "edit_one_line": "CUSTOM.discordInvite" }
}
```

### 6. Example Discord post ritual (accountability using shares)
"🚀 Gate 5 done — full MCP multi-agent Twin live!
[ paste full MD or short ]
MCP tools verified via list+call. Supervisor caught 2 faithfulness fails.
${hashtag} Streak 14d 🔥 What tool are you exposing next? Reply with your snippet!"

### 7. Fork + Discord customization tips
- Edit only CUSTOM object (top of `<script>` in index.html).
- Floating CTAs (🚀 Share Twin prominent at bottom), home dashed banner, sidebar, modal, auto-gate prompts all update.
- Deploy: `vercel` (no build, output `.`); GitHub Pages/Netlify same.
- For your fork: update githubRepo too for correct links in snippets.

All productized around the full MCP multi-agent Twin culmination (L5 Stage 3 + gate). Use shares as the core community loop.

**Final launch polish added (ADHD + community):** 24+ 5-min micros/QCs (incl qc22 fork choice, qc23 MCP JSON/YAML export from live, qc24 choice+feedback), MORE badge visuals (QCs count) + instant feedback CTAs everywhere, extra share templates (twitter/linkedin/weeklyReport + GitHub MD variant for forums/issues), onboarding modal (MCP Twin), Hall of Fame placeholders (with share CTAs), Discord structure examples modal, more in-app share CTAs (lesson, QC toasts + share, gate, hall, fork, sidebar). All reinforce Twin as culminating full MCP-exposed multi-agent system. Enhanced snippets always use live P/AGENT/gates. Tests green (5644+). Use absolute paths in forks. Pure static reinforced.

## Self-host the backend (optional cloud sync / accounts / leaderboard)

The app is offline-first and runs with **no backend**. The optional cloud layer (☁️ Account, live Hall of Fame, public `#twin/<slug>` pages) is powered by **Supabase as the backend** — Postgres + Auth + Row-Level Security, no server code. To point a fork at your own project:

1. **Create a Supabase project** (free tier is fine).
2. **Run the schema migration** — four tables (`profiles`, `progress`, `notes`, `twin_profiles`), a public `leaderboard` view, RLS policies (own-rows-only; leaderboard + public twins world-readable), and an `on_auth_user_created` trigger that auto-creates a profile/progress/twin row per signup. The full SQL is the `init_course_backend` migration applied to the reference project; copy it from your Supabase migration history or the project's SQL editor.
3. **Set two constants** near the top of the `<script>` in `index.html`:
   ```js
   const SB_URL  = 'https://YOUR_PROJECT_REF.supabase.co';
   const SB_ANON = 'YOUR_PUBLISHABLE_ANON_KEY'; // safe to ship — RLS guards everything
   ```
4. **Auth**: email+password and magic-link work out of the box. For real cohorts, add custom SMTP in the Supabase dashboard (the built-in email sender is rate-limited for testing only). Add Google/GitHub OAuth there too if desired.

To run **100% client-side** like the original (no accounts), just delete those two constants — every cloud feature degrades gracefully to localStorage-only.

MIT license — fork freely.
