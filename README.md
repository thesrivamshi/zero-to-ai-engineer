# Zero to AI Engineer

A single-file, no-build interactive course that takes you from *never opened a terminal* to *fundamentally strong AI engineer* — built around one idea: **you learn by building one agent that grows every level**, picking up Python, JSON, SQL, function/tool calling, APIs, MCP, and multi-agent systems exactly when the agent needs them.

**Live demo:** https://zero-to-ai-engineer.vercel.app

It is just `index.html` + a `data/` folder of plain `.js` files. No framework, no build step, no server. Open the file and it runs.

## What's inside each lesson

- **Original lessons** at full conceptual depth, with scenario-based quizzes.
- **🧪 Hands-on labs** that run locally in your browser — a simulated terminal, real Python via Pyodide, a SQL shell, and live API labs.
- **📐 Visual** — an original hand-drawn SVG schematic for the concept.
- **🎬 Watch** — a hand-picked YouTube video.
- **📖 Read deeper** — the exact pages in the three reference books, with a per-book reading-progress tracker.
- **🎤 Test yourself** — deeper reveal-answer study questions.
- **📝 Notes** (a global pad + per-lesson notes) and a **🍅 Pomodoro** focus timer.

Six levels: Foundations → Working with Models → Building Applications → Customizing Models → Shipping to Production → Inference at Scale, each ending in a project gate, with a running "LLM Twin" build threaded through.

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

Your key is stored only in your browser (localStorage) and sent only to the provider URL you set. There is no backend.

## Deploy your own

It's a static site, so any static host works. Two easy paths:

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

## Develop / run the tests

The app ships with a jsdom test suite (data integrity, every view renders, exercise logic, reading/diagram/question/video coverage, copyright safety on diagrams, etc.).

```bash
cd tests
npm install      # installs jsdom
cd ..
node tests/run.js
```

Adding content? The data lives in `data/level{1..6}.js`, `data/glossary.js`, `data/reads.js` (book pages), `data/videos.js`, `data/diagrams.js` (inline SVG), and `data/questions.js`. Keep the tests green.

## License

MIT — see [LICENSE](LICENSE). The code and the original course content (lessons, diagrams, questions) are MIT-licensed. The three reference books are **not** included and remain the property of their authors and publishers.
