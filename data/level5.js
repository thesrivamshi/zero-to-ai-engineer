window.COURSE_LEVELS = window.COURSE_LEVELS || [];
window.COURSE_LEVELS.push({
title:"Shipping to Production",
sub:"From script to system: pipelines, deployment, LLMOps, monitoring, and cost engineering. Where projects become products.",
chapters:[
{title:"Architecture",lessons:[
{id:"l5a1",t:"From script to system: the FTI architecture",min:5,body:`
<p>Your Level 3 RAG project is two scripts you run by hand. A production system is the same logic, restructured so it runs itself, survives failures, and can be operated by a team. The cleanest mental model — the backbone of the <em>LLM Engineer's Handbook</em> — is <strong>FTI: Feature, Training, Inference pipelines</strong>, three independent systems meeting at shared storage:</p>
<ul>
<li><strong>[[feature pipeline|Feature pipeline]]</strong> — raw data in → model-ready data out. For RAG: collect → clean → chunk → embed → write to the [[vector database]]. Runs on a schedule (nightly) or on triggers (document changed).</li>
<li><strong>Training pipeline</strong> — dataset in → evaluated model out, registered in a [[model registry]] with version, eval scores, and training config. (Skipped entirely if you're not fine-tuning — FTI degrades gracefully.)</li>
<li><strong>Inference pipeline</strong> — user request in → answer out, reading the vector DB and serving the registered model. This is the only part users touch, and the only part with real-time latency requirements.</li></ul>
<p>Why the separation earns its keep:</p>
<ul>
<li><strong>Independent schedules and hardware</strong> — indexing runs nightly on cheap CPUs; inference runs 24/7; training runs occasionally on GPUs</li>
<li><strong>Independent failure</strong> — a broken scraper in the feature pipeline doesn't take down user-facing chat; it serves yesterday's index while you fix it</li>
<li><strong>Clear interfaces</strong> — pipelines communicate only via storage (vector DB, registry), so each can be developed, tested, and scaled by different people</li></ul>
<div class="callout"><div class="ct">Spot it in your own project</div>Your <code>index_docs.py</code> IS a feature pipeline; your <code>ask_docs.py</code> IS an inference pipeline. You already built FTI — production is making each leg automated, monitored, and restartable.</div>`,
quiz:[
{q:"In FTI, your document scraper breaks at 3am. What happens to users?",o:["The chatbot goes down","Nothing immediately — inference serves the existing index while the feature pipeline gets fixed","All answers become wrong"],a:1,e:"Pipeline separation contains failures. Stale-but-working beats down — and the interfaces-via-storage design is what makes that possible."},
{q:"Which pipeline is the only one with hard real-time latency requirements?",o:["Feature pipeline","Training pipeline","Inference pipeline"],a:2,e:"Users wait on inference. Feature and training pipelines run in the background on their own schedules — and on cheaper hardware."}]},
{id:"l5a2",t:"Orchestration: who runs the pipelines?",min:4,body:`
<p>"Runs nightly" — but who runs it when you're asleep, retries it when the network blips, and tells you when it breaks? An [[orchestrator]]: Airflow, Prefect, Dagster, ZenML (the Handbook's choice, ML-native). Whatever the brand, the contract is the same:</p>
<ul>
<li><strong>Scheduling</strong> — cron-like triggers and event triggers</li>
<li><strong>Dependency order</strong> — chunk only after collect succeeds; embed only after chunk</li>
<li><strong>Retries with backoff</strong> — transient failures (rate limits! flaky networks!) self-heal</li>
<li><strong>Observability</strong> — every run logged: what ran, on what inputs, how long, what failed</li>
<li><strong>Artifact lineage</strong> — which raw files produced which chunks produced which index — so when something's wrong you can trace it backwards</li></ul>
<p>The code change is mostly decoration — your functions become annotated steps:</p>
<pre><code>@step
def collect_docs(...) -> list[Doc]: ...
@step
def chunk_and_embed(docs: list[Doc]) -> None: ...

@pipeline(schedule="0 2 * * *")     # 2am nightly
def feature_pipeline():
    chunk_and_embed(collect_docs())</code></pre>
<div class="callout tip"><div class="ct">The deeper habit: idempotency</div>Design steps so running them twice is safe (e.g. upsert chunks by document-ID rather than blindly appending). Idempotent steps turn "it crashed midway" from a data-corruption incident into a non-event: just re-run. This single design habit prevents a whole genre of 2am disasters.</div>`,
quiz:[
{q:"Your nightly embedding step hits an API rate limit at 2:14am. With a proper orchestrator, what happens?",o:["The pipeline is dead until morning","Automatic retry with backoff; if retries exhaust, alert + the failure is logged with full context","The vector DB gets corrupted"],a:1,e:"Retries-with-backoff handle transient failures invisibly; alerting covers persistent ones. That's the difference between a pipeline and a script with a cron job."},
{q:"Why design pipeline steps to be idempotent (safe to run twice)?",o:["It makes them faster","Crashes mid-run become harmless — re-running can't duplicate or corrupt data","Orchestrators refuse non-idempotent steps"],a:1,e:"Things WILL crash midway. Idempotency (upserts by stable IDs, not blind appends) makes recovery 'just re-run it' instead of forensic cleanup."}]},
{id:"l5a3",t:"🧪 Lab: Your model behind a web API",min:10,lab:true,body:`
<p>Every AI product hides the same shape behind its UI: an HTTP service. Let's wrap your RAG logic in one. The tool: <strong>FastAPI</strong>, Python's standard.</p>
<pre><code>pip install fastapi uvicorn</code></pre>
<p>Create <code>app.py</code> (adapting your Level 3 query logic into the function):</p>
<pre><code>from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    sources: list[str]

@app.post("/ask")
def ask(req: AskRequest) -> AskResponse:
    # your Level 3 logic: embed question → retrieve → generate
    answer, sources = rag_answer(req.question)
    return AskResponse(answer=answer, sources=sources)</code></pre>
<pre><code>uvicorn app:app --reload</code></pre>
<p>Now visit <code>http://localhost:8000/docs</code> — FastAPI auto-generated interactive documentation; click "Try it out" and ask your documents a question <em>through a real API</em>. Any website, mobile app, or other service could now call this.</p>
<p>Notice what Pydantic models buy you: requests are validated (garbage in → clean 422 error, not a crash) and the response shape is a contract other engineers can build against. Add two production touches:</p>
<ul>
<li>A <code>GET /health</code> endpoint returning <code>{"status":"ok"}</code> — load balancers and monitors ping this to know your service is alive</li>
<li>A try/except around the LLM call returning a clean 503 "model unavailable" instead of a raw stack trace</li></ul>`,
quiz:[
{q:"What's the role of the /health endpoint?",o:["Reporting model accuracy","A cheap liveness signal for load balancers, autoscalers, and monitors","User authentication"],a:1,e:"Infrastructure constantly asks 'are you alive?' — routing traffic away and restarting instances based on the answer. Every production service has one."},
{q:"Why define request/response shapes with Pydantic models?",o:["Decoration","Automatic validation (bad input → clean error, not a crash) and a typed contract that the docs and client code build on","Smaller payloads"],a:1,e:"Validated boundaries are how services stay robust: malformed input is rejected at the door, and the schema doubles as living documentation."}]},
{id:"l5a4",t:"Docker and deployment options",min:5,body:`
<p>"Works on my machine" dies here. [[docker|Docker]] packages your app + Python version + every dependency into an <strong>image</strong> that runs identically on any machine. The recipe is a <code>Dockerfile</code>:</p>
<pre><code>FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]</code></pre>
<p><code>docker build</code> → image; <code>docker run</code> → a container (running instance). Same image on your laptop, a teammate's machine, and the cloud. Secrets ([[api key|API keys]]!) are injected as environment variables at run time — never baked into the image.</p>
<p>Where containers go to work — the menu, simple → powerful:</p>
<ul>
<li><strong>Serverless containers</strong> (Cloud Run, Fly.io, Render): give them the image; they run, scale, and bill per use. The sweet spot for most LLM-app backends — your project gate's deployment target.</li>
<li><strong>VMs</strong>: a rented machine you manage. Full control, all the maintenance.</li>
<li><strong>Kubernetes</strong>: industrial-strength container fleets. Powerful, complex — for when you have a platform team, not a first product.</li>
<li><strong>GPU serving platforms</strong> (Modal, RunPod, Baseten…): for when you host model <em>weights</em> yourself — that story is Level 6's.</li></ul>
<div class="callout"><div class="ct">Two deployment-shaped decisions for LLM apps</div><strong>Batch vs real-time:</strong> if answers aren't needed instantly (nightly report summaries, bulk document tagging), batch processing is dramatically cheaper and simpler — many "AI features" secretly should be batch jobs. <strong>Streaming:</strong> if it IS real-time chat, your API should stream (Level 3's lesson) end-to-end, container and all.</div>`,
quiz:[
{q:"What problem does Docker solve?",o:["It makes Python faster","Environment drift — the app ships WITH its exact dependencies, running identically everywhere","It replaces the need for APIs"],a:1,e:"The container carries its whole world. 'Works on my machine' becomes 'works in the image' — which works everywhere images run."},
{q:"Your feature summarizes all support tickets once a day for a morning report. Real-time API or batch job?",o:["Real-time API — always be ready","Batch job — no one needs instant answers; nightly processing is cheaper and simpler","Neither — manual processing"],a:1,e:"Matching the architecture to the actual latency need is free money. Batch jobs skip the always-on serving costs entirely."}]}
]},
{title:"LLMOps",lessons:[
{id:"l5b1",t:"Observability: flying with instruments",min:5,body:`
<p>Day one in production, your visibility drops to zero: did that user get a good answer? Why is this conversation going badly? What did that request cost? [[observability|Observability]] is the instrument panel, and for LLM systems it has a special requirement: <strong>trace every request end-to-end.</strong></p>
<p>Per request, log: the user input → retrieved chunks (with scores) → the exact final prompt → model + parameters → raw response → guardrail verdicts → token counts and cost → total and per-stage latency → user feedback if any. Purpose-built tools (LangSmith, Langfuse, Phoenix, W&B Weave) make these traces browsable; a structured log line per stage gets a small team surprisingly far.</p>
<p>The dashboard that matters:</p>
<ul>
<li><strong>Operational</strong> — request rate, error rate, latency percentiles (p50/p95/p99 — more in Level 6), cost per request, token usage trends</li>
<li><strong>Quality</strong> — thumbs up/down rates, refusal rate, faithfulness-check failures, "not in my documents" rate</li>
<li><strong>Drift</strong> — what users actually ask (topics shift!), retrieval score distributions (sliding = index getting stale?)</li></ul>
<div class="callout tip"><div class="ct">The flywheel hiding in your logs</div>Traces aren't just for debugging. Bad-answer traces become eval test cases (remember: scar tissue). Good answers become few-shot or fine-tuning examples. Thumbs-up/down become DPO preference pairs (Level 4!). Mature teams' biggest data asset is their own production traces — design the logging for reuse from day one.</div>`,
quiz:[
{q:"A user reports a wrong answer from yesterday. With proper tracing, what can you do?",o:["Apologize — the moment is lost","Pull the trace: see exactly what was retrieved, what prompt was built, what the model returned — and pinpoint which stage failed","Re-ask the model and hope"],a:1,e:"The trace turns 'mystery' into 'diagnosis' — the Level 3 retrieval-vs-generation debugging move, now possible for every production request, forever."},
{q:"How do production traces feed system improvement?",o:["They don't — logs are for compliance","Failures → new eval cases; good outputs → few-shot/fine-tuning data; user feedback → DPO pairs","They automatically retrain the model"],a:1,e:"The data flywheel: production experience becomes test sets and training data. Teams that design logging for reuse compound; teams that don't stay flat."}]},
{id:"l5b2",t:"Monitoring quality and catching drift",min:5,body:`
<p>Classical software fails loudly — exceptions, 500s, alarms. LLM systems fail <em>silently</em>: the API returns 200 OK and the answer is subtly worse. Quality monitoring exists to make silent failure loud. The layers:</p>
<ul>
<li><strong>User feedback</strong> — thumbs up/down (sparse and biased, but real); implicit signals scale better: did the user rephrase the same question (failure smell), abandon the session, escalate to human support?</li>
<li><strong>Online evaluation</strong> — run your [[llm-as-judge]] checks (faithfulness, tone, completeness) on a sample of live traffic — e.g. 5% — and chart the scores over time. A declining line is an alarm no one has to notice manually.</li>
<li><strong>Canary evals on dependencies</strong> — when your provider updates a model (or you change one), run the full eval suite before and after. "The model got quietly worse for our use case" is a real, recurring industry event.</li>
<li><strong>Drift detection</strong> — production input distributions shift: new topics, new languages, new abuse patterns. Compare this week's question topics/embedding distribution against your eval set's — when reality drifts away from what you test, your test scores stop meaning anything.</li></ul>
<div class="callout fail"><div class="ct">Real-world failure</div>A team's support bot ran for months at "fine" while its document base aged: new products launched, policies changed, the index was never refreshed. No errors. No alarms. Just a rising rate of users silently escalating to human agents — discovered in a quarterly review, after the damage. A staleness metric (index age vs. document updates) and an escalation-rate chart would have caught it in week one.</div>`,
quiz:[
{q:"Why is 'the API returns 200 OK' insufficient as health monitoring for LLM systems?",o:["Status codes are unreliable","Quality failures are silent — wrong/degraded answers ship with perfect status codes; you must measure answer quality itself","200 means the model is correct"],a:1,e:"LLM failure mode #1 is confident, well-formatted, wrong output (Level 1!). Operational metrics can't see it. Sampled judge evals and feedback signals can."},
{q:"Your provider silently upgrades the model behind your API. What protects you?",o:["Nothing — providers know best","Running your eval suite against the new version — your test set is your defense against quiet regressions on YOUR task","Reading the changelog"],a:1,e:"Generic improvements can still regress your specific behaviors (formats, edge cases, tone). The eval suite you've built at every level is exactly this insurance."}]},
{id:"l5b3",t:"Cost engineering: the unit-economics mindset",min:5,sim:"costcalc",body:`
<p>LLM features have a property traditional software doesn't: <strong>every single use costs real money.</strong> A feature that delights users while costing $0.40/request against $0.10/request of value is a machine that converts growth into losses. The discipline:</p>
<p><strong>Know your number.</strong> Cost per request = (input tokens × input price) + (output tokens × output price), summed over every model call in the pipeline — including embeddings, judges, and guardrail calls everyone forgets. Track it per feature in your traces. (Calculator above: note how input tokens dominate in RAG apps.)</p>
<p><strong>Then pull the levers, biggest first:</strong></p>
<ol>
<li><strong>[[model cascade|Cascade]]</strong> — a cheap model handles easy requests; hard ones (detected by a router, confidence score, or the cheap model's own "I'm unsure") escalate to the expensive one. Typical: 70–90% of traffic handled at ~1/20th the price.</li>
<li><strong>Caching</strong> — exact-match for repeated questions, prompt-prefix caching for your static system prompt (Level 3), semantic caching (similar-enough question → same answer) where stakes allow</li>
<li><strong>Prompt diet</strong> — audit your biggest prompts; trim instructions, cap retrieved chunks, summarize history. Every input token is billed on every call forever.</li>
<li><strong>[[distillation|Distill]]</strong> — your Level 4 skill: fine-tune a small model on the big model's outputs for your highest-volume narrow task</li>
<li><strong>Batch the batchable</strong> — providers discount async batch processing ~50%; nightly jobs shouldn't pay real-time prices</li></ol>
<div class="callout"><div class="ct">Per-request thinking</div>Before shipping any AI feature, an engineer should be able to fill in: "This costs ~$__ per use, delivers ~$__ of value per use, and at projected volume that's $__/month." Three blanks, no vibes. That sentence is the difference between a feature and a liability.</div>`,
quiz:[
{q:"What's a model cascade?",o:["Running models in a decorative sequence","Cheap model serves easy requests; a router/confidence signal escalates hard ones to the expensive model — most traffic gets handled cheap","Many models voting on each answer"],a:1,e:"Matching model cost to request difficulty is the single biggest cost lever in production LLM systems — often 5-10× savings at negligible quality loss."},
{q:"Which cost is most often FORGOTTEN when pricing an LLM feature?",o:["The main model's output tokens","Auxiliary calls: embeddings, query rewriting, LLM judges, guardrail checks — the supporting cast around the headline call","Cloud storage"],a:1,e:"A 'single' RAG answer might involve five model calls. Per-request cost means ALL of them — which is why tracing logs cost per stage."}]},
{id:"l5b4",t:"Versioning, rollouts, and the safe-change workflow",min:4,body:`
<p>In production, the question isn't "can I improve it?" — it's "can I improve it <em>without breaking what works</em>?" The safe-change workflow, assembled from pieces you already have:</p>
<ol>
<li><strong>Version everything that affects behavior</strong> — prompts (in git, not in someone's head!), model IDs (pin exact versions, never "latest"), retrieval configs, guardrail rules, datasets. A production answer should be reproducible from versions alone.</li>
<li><strong>Offline eval first</strong> — every change runs the eval suite before touching users. Score drops → it doesn't ship. (Your CI for AI behavior.)</li>
<li><strong>Canary rollout</strong> — ship to 5% of traffic; compare dashboards (quality scores, feedback, latency, cost) against the 95% control. Healthy → ramp. Not → instant rollback, which is trivial <em>because everything is versioned</em>.</li>
<li><strong>A/B for the big calls</strong> — model swaps or major prompt rewrites deserve a real experiment with user-level metrics, not just judge scores.</li></ol>
<p>This is [[llmops|LLMOps]] in one sentence: <em>classical DevOps discipline, extended to the new behavior-defining artifacts — prompts, models, datasets, and evals.</em></p>
<div class="callout warn"><div class="ct">The "latest" trap</div>Pointing at a provider's <code>latest</code> model alias means your system's behavior can change overnight without any action by you — and your carefully tuned prompts were tuned for the OLD model. Pin exact versions; upgrade deliberately, through the eval suite, like any other change.</div>`,
quiz:[
{q:"Why pin exact model versions instead of using 'latest'?",o:["Latest costs more","So behavior only changes when YOU change it — deliberately, eval-gated — not when the provider ships an update overnight","Old models are always better"],a:1,e:"Prompts and configs are tuned against a specific model's behavior. Unpinned versions mean untested changes in production — the opposite of the safe-change workflow."},
{q:"What's a canary rollout?",o:["A yellow-themed dashboard","Shipping a change to a small traffic slice first and comparing metrics against the rest before ramping up","Testing on canary birds"],a:1,e:"Limited blast radius + a live control group. Offline evals catch what you thought to test; canaries catch what you didn't."}]}
]}
],
project:{id:"l5gate",t:"Project Gate 5 — Deploy your RAG system as a real service",
body:`
<p>Take your Level 3 project and give it the full production treatment. At the end, a URL on the internet answers questions about your documents — with logging, monitoring hooks, and an eval gate. This is a portfolio piece.</p>
<h2>Part A — Service-ify</h2>
<ul>
<li>Wrap your RAG logic in FastAPI: <code>POST /ask</code> (question in; answer + sources + request cost out) and <code>GET /health</code></li>
<li>Per-request structured logging: timestamp, question, retrieved sources + scores, token counts, computed cost, latency. Write to a JSONL file — that's a real trace log.</li>
<li>Clean error handling: model API failure → 503 with a friendly message, not a stack trace</li></ul>
<h2>Part B — Containerize & deploy</h2>
<ul>
<li>Write the Dockerfile; build and run locally; confirm <code>localhost:8000/docs</code> works from inside the container</li>
<li>Deploy to a serverless container platform (Cloud Run, Fly.io, and Render all have free/cheap tiers — pick one, follow its quickstart, inject your API key as an environment variable, never in the image)</li>
<li>Ask your deployed URL a question from your phone. Savor this moment.</li></ul>
<h2>Part C — Operate it</h2>
<ul>
<li>Point your Level 3 eval script at the deployed endpoint — your eval suite now tests the REAL system end-to-end. Record the score.</li>
<li>Compute from your logs: average cost per request and p95 latency over at least 20 requests</li>
<li>Write a one-page runbook: how to redeploy, how to roll back, where logs live, what you'd monitor first if quality complaints arrived, and your cost-per-request number</li></ul>
<h2>Stretch</h2>
<p>Add a nightly re-indexing job (orchestrated or simple scheduled script) so document changes flow to production automatically — completing your FTI architecture.</p>`,
checklist:[
"My RAG system runs as a FastAPI service with /ask and /health endpoints",
"Every request is logged with sources, token counts, cost, and latency (JSONL traces)",
"It's containerized with Docker and runs identically in the container",
"It's deployed to a public URL on a serverless container platform, key injected via environment",
"My eval suite runs against the DEPLOYED endpoint, and I recorded the score",
"I measured avg cost/request and p95 latency from real logs, and wrote the runbook"
]}
});
