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
{q:"Your feature summarizes all support tickets once a day for a morning report. Real-time API or batch job?",o:["Real-time API — always be ready","Batch job — no one needs instant answers; nightly processing is cheaper and simpler","Neither — manual processing"],a:1,e:"Matching the architecture to the actual latency need is free money. Batch jobs skip the always-on serving costs entirely."}]},
{id:"l5a5",t:"Planning a system from requirements",min:5,src:"LEH ch.1 §LLM Twin",body:`
<p>Before pipelines and Dockerfiles comes the part beginners skip and seniors obsess over: <strong>deciding what to build from requirements.</strong> The <em>LLM Engineer's Handbook</em> plans its flagship — the LLM Twin — exactly this way, and the discipline transfers to anything.</p>
<h2>From "I want an AI twin" to a system</h2>
<p>A vague wish ("an AI that writes like me") becomes a buildable system by answering concrete questions:</p>
<ul>
<li><strong>What does it do, exactly?</strong> Inputs, outputs, the one job it must nail. (Twin: given a prompt, produce a response in my voice, grounded in my writing.)</li>
<li><strong>What are the quality bars?</strong> The usefulness threshold from Level 1 — measurable targets for quality, latency, cost <em>before</em> building.</li>
<li><strong>Where does data come from, and how does it stay fresh?</strong> (Twin: my writing → feature pipeline.)</li>
<li><strong>What are the components and how do they connect?</strong> This is where the [[fti|FTI]] architecture earns its keep: feature pipeline (data ready), training pipeline (model ready), inference pipeline (serve requests) — three independent pieces communicating through shared stores, not a tangled monolith.</li></ul>
<h2>Why design first</h2>
<p>The payoff of FTI's separation: each pipeline can be built, tested, scaled, and replaced on its own. You can re-run data prep without touching serving; swap the model without rebuilding ingestion; scale the inference path for traffic without scaling training. A monolithic "one script does everything" system can't do any of that — and every change risks breaking everything else.</p>
<div class="callout tip"><div class="ct">The Twin, designed</div>Your Twin already maps cleanly onto FTI: Stage 1 built the <em>feature pipeline</em> (your writing → vector store), Stage 2 the <em>training pipeline</em> (your data → fine-tuned voice), and Stage 3 (this level) builds the <em>inference pipeline</em> (retrieve + generate + serve). You designed an FTI system without naming it; now you have the name and the reason.</div>`,
quiz:[
{q:"What's the main benefit of splitting a system into Feature / Training / Inference pipelines?",o:["It uses fewer servers","Each pipeline can be built, tested, scaled, and replaced independently — you can change one without breaking the others","It's required by FastAPI"],a:1,e:"FTI's separation of concerns is what makes a system maintainable: re-run data prep without touching serving, swap models without rebuilding ingestion, scale serving for traffic alone. A monolith couples all of that together."},
{q:"What should you nail down BEFORE building, per the requirements-first discipline?",o:["The exact GPU model","The job, the measurable quality/latency/cost bars, the data sources, and how components connect","The marketing copy"],a:1,e:"Requirements first: what it does, the usefulness thresholds (Level 1), where data comes from, and the component design. Building before answering these is how demos that can't become products get made."}]},
{id:"l5a6",t:"Deployment types: real-time, async, and batch",min:5,src:"LEH ch.10 §Deployment",body:`
<p>"Deploy the model" isn't one thing — there are three serving modes, and picking the right one is a cost-and-latency decision that beginners get wrong by defaulting everything to real-time.</p>
<table>
<tr><th>Mode</th><th>When</th><th>Optimizes</th></tr>
<tr><td><strong>[[real-time inference|Real-time]]</strong></td><td>User waits for the answer (chat, search)</td><td>Latency</td></tr>
<tr><td><strong>[[async inference|Async]]</strong></td><td>Too slow for instant, but no fixed schedule (a long document analysis, a generated report)</td><td>Throughput, UX under slowness</td></tr>
<tr><td><strong>[[batch inference|Batch]]</strong></td><td>Many inputs, nobody waiting (tag a million docs, nightly summaries)</td><td>Cost &amp; throughput</td></tr>
</table>
<ul>
<li><strong>Real-time</strong> — the synchronous request/response your FastAPI service does. Stream it (Level 3) so it feels fast. Most expensive per request because you keep capacity ready.</li>
<li><strong>Async</strong> — accept the request, return a ticket, do the work in the background, deliver later (callback, queue, or the client polls). Right when work takes 30s–minutes and blocking a connection is rude.</li>
<li><strong>Batch</strong> — collect inputs and process them together offline when convenient. Dramatically cheaper: no always-on serving, full hardware utilization. Many providers offer a discounted <em>batch API</em> for exactly this.</li></ul>
<h2>Deployment criteria</h2>
<p>Choose by weighing the three numbers from your requirements: <strong>latency</strong> (how fast must one answer come?), <strong>throughput</strong> (how many per second?), and <strong>cost</strong> (budget per request). A feature that "feels instant but is actually generated overnight" (proactive, from Level 1) is secretly batch — and batch can be 10× cheaper.</p>
<div class="callout warn"><div class="ct">The default-to-real-time tax</div>The most common deployment waste: serving everything in real-time because it's the obvious mode. A nightly report doesn't need a hot endpoint; a bulk-tagging job doesn't either. Ask "does a human wait for this <em>right now</em>?" If no, async or batch slashes the bill. Matching mode to need is free money.</div>`,
quiz:[
{q:"A job generates personalized weekly summaries for all users, emailed Monday morning. Best deployment mode?",o:["Real-time API kept always-on","Batch — process them all offline over the weekend; nobody waits, and it's far cheaper","Async with per-request callbacks"],a:1,e:"No human waits in real time, and there's a natural window. Batch maximizes utilization and skips always-on serving cost — often ~10× cheaper than a hot endpoint."},
{q:"When is async (vs real-time) the right call?",o:["Whenever traffic is high","When the work takes too long to block a user on (tens of seconds to minutes) but doesn't fit a fixed batch schedule — accept now, deliver later","Only for batch jobs"],a:1,e:"Async fits slow-but-on-demand jobs: return a ticket, work in the background, deliver via callback/queue/polling. Blocking a real-time connection for minutes is a bad experience."}]},
{id:"l5a7",t:"Autoscaling, cold starts, and serving economics",min:5,src:"LEH ch.10 §Deployment",body:`
<p>Traffic isn't constant — it spikes at 9am, dies at 3am. <strong>[[autoscaling]]</strong> matches running instances to demand: add capacity under load, remove it when idle, so you neither fall over at peak nor pay for idle machines at night.</p>
<h2>The knobs</h2>
<ul>
<li><strong>Scale on the right signal</strong> — for LLM apps, in-flight requests or queue depth usually beats CPU%, because the bottleneck is waiting on the model, not local compute.</li>
<li><strong>Min and max instances</strong> — max caps your spend (and protects downstream APIs from your own stampede); min keeps a few warm for latency.</li>
<li><strong>[[scale-to-zero|Scale-to-zero]]</strong> — drop to zero instances when fully idle, so a side project or spiky service costs nothing at rest. The serverless platforms from the Docker lesson do this by default.</li></ul>
<h2>The cold-start tax</h2>
<p>Scale-to-zero's catch: when a request arrives and nothing's running, the platform must <strong>[[cold start|cold-start]]</strong> an instance — pull the image, boot, load state — and the unlucky user waits seconds. The trade-off: <em>min instances = 0</em> saves the most money but risks slow first requests; <em>min instances ≥ 1</em> keeps one warm for snappy latency but always costs something. You pick based on whether occasional cold-start latency is acceptable for your use case (fine for an internal tool, bad for a paid chatbot).</p>
<div class="callout"><div class="ct">This is a preview of the hard version</div>Autoscaling CPU-bound web services is well-trodden. Autoscaling <em>GPU</em> model servers — where instances are expensive, scarce, and slow to start — is much harder, and it's a centerpiece of Level 6. The concepts (scale on the right signal, min/max, cold starts) are the same; the stakes and the dollar figures are far higher when each instance is a GPU.</div>`,
quiz:[
{q:"Why is scale-to-zero attractive but not free of downside?",o:["It never has downsides","It drops idle cost to zero, but the next request hits a cold start (image pull + boot + load), adding seconds of latency","It makes the model less accurate"],a:1,e:"Zero instances = zero idle cost, but starting one on demand takes time. Min-instances ≥ 1 trades a little always-on cost for no cold-start latency — a per-use-case judgment."},
{q:"For an LLM serving app, what's usually the best autoscaling signal?",o:["CPU utilization","In-flight requests or queue depth — the bottleneck is waiting on the model, not local CPU","Disk space"],a:1,e:"LLM endpoints spend most time awaiting model responses, so CPU% barely moves while the service is actually saturated. Concurrency/queue depth reflects real load."}]},
{id:"l5a8",t:"🧪 Lab: CORS and verifying your live service",min:10,lab:true,src:"LEH ch.10 §Deployment",deploy:{
goal:"Deploy your FastAPI RAG service to a free serverless platform, enable CORS so a browser can call it, and paste your live base URL below. The checker will GET {url}/health (expects {\"status\":\"ok\"}) and POST {url}/ask with a test question (expects JSON with a non-empty answer and a sources field).",
askQuestion:"What is this service about?"},
body:`
<p>Your API runs on localhost. Now make it real — on the public internet, callable from a browser. Two things stand between you and a live service: deployment, and a security rule called CORS that trips up everyone the first time.</p>
<h2>Deploy the container</h2>
<p>Push your Dockerized FastAPI app (from the Docker lesson) to a free serverless platform — <strong>Render</strong>, <strong>Fly.io</strong>, or <strong>Google Cloud Run</strong> all work and have free tiers. Connect your GitHub repo (the git lessons pay off again), set your <code>OPENAI_API_KEY</code> as an environment variable in the platform's dashboard (never in the image!), and deploy. You'll get a public URL like <code>https://your-app.onrender.com</code>.</p>
<h2>The CORS wall — a real concept, taught as one</h2>
<p>Try to call your API from a web page and the browser blocks it: <em>"No 'Access-Control-Allow-Origin' header."</em> This is <strong>[[cors]]</strong> — a browser security rule that forbids a page on one domain from reading responses from a different domain unless the server <em>explicitly allows it</em>. It exists to stop malicious sites from quietly calling other sites with your cookies. Your API must opt in:</p>
<pre><code class="frag">from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # for learning; lock to your real domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)</code></pre>
<p>That middleware adds the headers the browser demands. <code>allow_origins=["*"]</code> permits any site (fine for this lab); in production you'd list only your own front-end's domain.</p>
<h2>Verify it's live</h2>
<p>Paste your base URL below. This page will hit <code>GET /health</code> and <code>POST /ask</code> on your real, deployed service and show the raw responses — the same checks a monitor would run. A green result means your AI service is genuinely live on the internet, CORS and all.</p>
<div class="callout warn"><div class="ct">If the check fails</div>Free tiers <strong>sleep</strong> when idle — open your URL in a browser tab first to wake it, then retry. Other usual suspects: CORS middleware missing (the browser blocks the read), the env-var API key not set on the platform, or <code>/health</code> not returning exactly <code>{"status":"ok"}</code>. Each failure message points at one of these.</div>`,
quiz:[
{q:"Your deployed API works in its auto-docs page but a browser app gets 'No Access-Control-Allow-Origin header.' What's missing?",o:["The API key","CORS configuration — the server must send headers explicitly allowing the browser's origin to read the response","A bigger instance"],a:1,e:"CORS is a browser rule: cross-origin responses are blocked unless the server opts in with Access-Control-Allow-Origin. Adding CORS middleware sends those headers. (Server-to-server calls aren't affected — only browsers enforce CORS.)"},
{q:"Your free-tier service passes /health when you just used it but fails when checked cold. Most likely cause?",o:["The code is broken","Scale-to-zero cold start — the idle instance was asleep; wake it (open the URL) and the first request is slow or times out","CORS is misconfigured"],a:1,e:"Free serverless tiers scale to zero. The first request after idle pays the cold-start tax and can time out a checker. Warm it first — exactly the cold-start trade-off from the autoscaling lesson, live."}]},
{id:"l5a9",t:"The end-to-end AI architecture, as layers",min:6,src:"AIE ch.10 §Architecture",body:`
<p>Step back and see the whole production system. A mature AI application isn't a model with a prompt — it's the model wrapped in <strong>layers</strong>, each added to solve a real problem. AI Engineering lays them out as a reference architecture you build up incrementally.</p>
<ol>
<li><strong>The model call</strong> — where everyone starts: prompt in, completion out.</li>
<li><strong>Context construction</strong> — RAG retrieval, memory, tools: give the model what it needs (Level 3).</li>
<li><strong>[[guardrails]]</strong> — input/output safety, moderation, PII, faithfulness (Level 3). The safety sandwich.</li>
<li><strong>Model routing &amp; [[api gateway|gateway]]</strong> — a single entry point that routes each request to the right model (cheap model for easy queries, strong for hard — a [[model cascade|cascade]]), and centralizes auth, rate limiting, and logging.</li>
<li><strong>Caching</strong> — exact-match and semantic caches return stored answers for repeat/similar queries; [[prefix caching|prompt caching]] discounts re-sent prefixes. Big cost and latency wins (Level 3's lesson, now a system layer).</li>
<li><strong>[[observability]]</strong> — logging, tracing, metrics across all of it, so you can see and debug what's happening (next chapter).</li>
<li><strong>Feedback</strong> — capturing signals to improve the system over time (next lesson).</li></ol>
<p>The key insight: <strong>you don't build all this on day one.</strong> You start with the model call and add layers as problems appear — bad answers → context + guardrails; high cost → routing + caching; can't debug → observability; not improving → feedback. Each layer is a response to a measured need, not architecture for its own sake.</p>
<div class="callout tip"><div class="ct">A map of the whole course</div>Look at the layers: context (L3), guardrails (L3), routing/cascades (L1 + here), caching (L3 + here), observability and feedback (this level), the model itself (L1, L4). The course has been assembling this diagram piece by piece. Production AI engineering is knowing which layer a given problem belongs to — and adding only the layers your evidence demands.</div>`,
quiz:[
{q:"What's the recommended way to build the end-to-end architecture?",o:["Implement every layer upfront for completeness","Start with the model call and add each layer (context, guardrails, routing, caching, observability, feedback) as a measured problem appears","Buy an all-in-one platform"],a:1,e:"Layers are responses to real needs: bad answers → context+guardrails, high cost → routing+caching, can't debug → observability. Adding them speculatively is complexity nobody measured."},
{q:"A model-routing gateway in front of your app mainly lets you do what?",o:["Train models faster","Route each request to the right model (cheap for easy, strong for hard — a cascade) and centralize auth, rate limiting, and logging","Eliminate the need for guardrails"],a:1,e:"A gateway is one controlled entry point: it enables cost-saving model cascades and centralizes cross-cutting concerns so every service doesn't reimplement them."}]}
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
{q:"What's a canary rollout?",o:["A yellow-themed dashboard","Shipping a change to a small traffic slice first and comparing metrics against the rest before ramping up","Testing on canary birds"],a:1,e:"Limited blast radius + a live control group. Offline evals catch what you thought to test; canaries catch what you didn't."}]},
{id:"l5b5",t:"Registries, artifacts, and the road from DevOps to LLMOps",min:5,src:"LEH ch.11 §MLOps/LLMOps",body:`
<p>The safe-change workflow assumed you can answer "exactly which prompt, model, and dataset produced this?" That answer comes from treating your ML outputs as tracked <strong>[[artifact|artifacts]]</strong>, and it's the heart of what LLMOps adds to ordinary software ops.</p>
<h2>The lineage of the discipline</h2>
<ul>
<li><strong>DevOps</strong> — automate testing and shipping of <em>code</em>. (CI/CD, the previous lesson.)</li>
<li><strong>MLOps</strong> — DevOps plus the new things ML adds: data and models are also versioned, tested, and deployed. Code alone no longer determines behavior — data and weights do too.</li>
<li><strong>LLMOps</strong> — MLOps plus what foundation models add: prompts, retrieval configs, and evals become first-class versioned artifacts, and evaluation runs continuously because behavior is open-ended.</li></ul>
<p>Each layer adds artifacts that define behavior. Forget to version any of them and reproducibility breaks.</p>
<h2>The registry</h2>
<p>A <strong>[[model registry]]</strong> is the catalog of your trained models/adapters and their versions — each entry tagged with how it was made (dataset version, training config), its eval scores, and its stage (staging/production). It's what lets you say "promote model v7 to production," "roll back to v6," or "v8 scored worse, don't ship" — by name, with evidence. The same idea extends to prompt registries and dataset versions.</p>
<p><strong>Artifact lineage</strong> ties it together: this answer came from prompt v4 + model v7 + index built from dataset v3. When something breaks in production, lineage lets you trace backward to the exact ingredients and reproduce or revert. Without it, debugging a regression is archaeology.</p>
<div class="callout"><div class="ct">Why this is the boring-but-decisive part</div>Registries and lineage aren't glamorous, but they're what separate "we shipped a model" from "we can operate models." They make rollbacks instant, regressions traceable, and audits possible. The teams that move fast in production aren't reckless — they're the ones who can undo any change in seconds because every artifact is versioned and named.</div>`,
quiz:[
{q:"What does LLMOps add on top of MLOps?",o:["Nothing — they're identical","Prompts, retrieval configs, and evals become first-class versioned artifacts, and evaluation runs continuously because behavior is open-ended","It removes the need to version data"],a:1,e:"DevOps versions code; MLOps adds data and models; LLMOps adds the foundation-model artifacts (prompts, configs, evals) and continuous evaluation. Each layer adds behavior-defining things to track."},
{q:"What does a model registry with artifact lineage let you do when a production regression appears?",o:["Prevent all bugs automatically","Trace the bad output back to its exact ingredients (prompt/model/dataset versions) and instantly roll back to a known-good version","Retrain the model faster"],a:1,e:"Lineage + versioned artifacts make regressions traceable and rollbacks instant. Without them, you're guessing which of many unversioned changes broke things — debugging as archaeology."}]}
]},
{title:"Feedback & cost",lessons:[
{id:"l5c1",t:"User feedback and the data flywheel",min:6,src:"AIE ch.10 §User Feedback",body:`
<p>A deployed system that doesn't learn from use is a system slowly going stale. The final architectural layer — and the one that compounds — is <strong>capturing user feedback</strong> and feeding it back into improvement. Done well, it becomes a <strong>[[data flywheel]]</strong>: usage generates data that improves the product, which attracts more usage, which generates more data.</p>
<h2>Two kinds of signal</h2>
<ul>
<li><strong>[[explicit feedback]]</strong> — what users deliberately tell you: thumbs up/down, star ratings, a "regenerate" click, an edited/corrected answer. High-quality and unambiguous, but <em>sparse</em> — most people never click the thumb.</li>
<li><strong>[[implicit feedback]]</strong> — what behavior reveals: did they copy the answer? retry the question? abandon the session? click the cited source? accept the suggested code? Noisy and indirect, but <em>abundant</em> — every interaction emits some. The richest feedback systems lean heavily on implicit signals.</li></ul>
<h2>Designing for it</h2>
<p>Feedback doesn't capture itself — you design for it. Make explicit feedback effortless (a one-click thumb beside every answer), instrument implicit signals (log copies, retries, follow-ups, source clicks), and — crucially — <strong>close the loop</strong>: route negative feedback into your eval set as new test cases (the growing-test-set idea from Level 2), into your fine-tuning data (corrected answers are gold SFT/preference data — Level 4), and into your retrieval (what did it fail to find?).</p>
<div class="callout tip"><div class="ct">The flywheel is the moat</div>Recall Level 1's defensibility lesson: with shared models, your durable advantage is data. A feedback loop is how you build it — every user interaction makes your evals sharper, your fine-tunes better, your retrieval more complete. Competitors can copy your prompt; they can't copy a year of your users' feedback. The flywheel is where a product compounds past what a clone can match.</div>`,
quiz:[
{q:"Why do mature feedback systems rely heavily on implicit signals, not just thumbs up/down?",o:["Implicit signals are more accurate","Explicit feedback is high-quality but sparse (few users click); implicit signals (copies, retries, abandonment) are noisy but abundant — every interaction emits some","Thumbs ratings are illegal"],a:1,e:"Most users never rate. Behavioral signals come from everyone and every interaction, so despite the noise they give far more coverage — the backbone of a real feedback system."},
{q:"What does 'closing the loop' on negative feedback mean?",o:["Apologizing to the user","Routing failures back into your eval set (new test cases), fine-tuning data (corrections), and retrieval — so the system measurably improves from real use","Deleting the bad responses"],a:1,e:"Feedback only compounds if it feeds improvement: bugs become permanent test cases, corrections become training data, retrieval gaps get filled. That loop is the data flywheel in action."}]},
{id:"l5c2",t:"Cost engineering at the system level",min:6,src:"AIE ch.9 §Inference Optimization (app-level)",body:`
<p>You met cost levers in Level 3. At production scale they become a discipline of their own — because at a million requests a day, a fraction of a cent each is the difference between a viable product and a money pit. The app-level toolkit, in rough order of impact:</p>
<ul>
<li><strong>[[model cascade|Model cascades]]</strong> — don't send every request to the frontier model. Route by difficulty: a cheap/small model handles the easy majority, escalating to the strong model only when needed (a classifier or the cheap model's own confidence decides). Often cuts cost several-fold with negligible quality loss — the single biggest lever.</li>
<li><strong>Caching tiers</strong> — exact-match cache for repeated queries (free answer, zero model call); <em>semantic</em> cache returns a stored answer for a sufficiently-similar query; provider <strong>[[prefix caching|prompt caching]]</strong> discounts re-sent static prefixes (your long system prompt + few-shot block). Structure prompts static-first to maximize the cacheable portion.</li>
<li><strong>Prompt budgets</strong> — every token is billed on every call, forever. Audit fat system prompts, trim redundant few-shot examples, cap context sent to retrieval. A 2,000-token system prompt across a million calls is two billion billed tokens a day.</li>
<li><strong>Batch APIs</strong> — for non-real-time work, providers offer steep discounts (often ~50%) to run requests in their batch queue. Pair with the batch deployment mode from earlier.</li>
<li><strong>Right-size outputs</strong> — output tokens cost more than input; cap <code>max_tokens</code> and ask for concision. Verbose answers are a silent tax.</li></ul>
<div class="callout"><div class="ct">Unit economics, not the monthly bill</div>The professional frame is <strong>cost per request</strong> (and per resolved task), not the total invoice. Cost per request × volume = bill, but only cost-per-request tells you whether the product is economically viable as it scales, and which lever to pull. "It's expensive" is a feeling; "$0.011 per request, 70% of it the frontier-model call we could cascade" is an engineering plan. Measure per-request cost the way you measure latency.</div>`,
quiz:[
{q:"What's typically the single biggest app-level cost lever for an LLM product?",o:["Switching cloud providers","Model cascades — routing the easy majority of requests to a cheap model and escalating to the frontier model only when needed","Turning off logging"],a:1,e:"Most requests don't need the most expensive model. A cascade serves the easy ones cheaply and reserves the frontier model for hard cases — frequently several-fold cheaper at negligible quality cost."},
{q:"Why frame cost as 'per request' rather than the monthly total?",o:["The monthly bill doesn't matter","Per-request cost tells you whether the product scales economically and which lever to pull; total bill alone hides that and the volume that drives it","Providers only report per-request"],a:1,e:"Unit economics (cost per request/task) reveal viability at scale and pinpoint the expensive component to optimize. The total is just per-request × volume — actionable insight lives in the per-request number."}]}
]},
{title:"Twin Track — Stage 3",lessons:[
{id:"l5twin3",t:"🧪 Twin Stage 3: serve your twin",min:14,lab:true,src:"LEH ch.9 §RAG Inference · ch.10–11",body:`
<p>The finale of the running build. You have your writing retrievable (Stage 1) and a model tuned to your voice (Stage 2). Stage 3 combines them into a deployed, monitored service — the <strong>inference pipeline</strong> of your [[fti|FTI]] system, live on the internet. This is your Twin, fully assembled.</p>
<h2>Step 1 — Assemble the inference pipeline</h2>
<p>Wire together everything from this course into one request flow (the RAG inference pipeline from Level 3, using your tuned model):</p>
<ol>
<li>Take a prompt → optionally rewrite it (Level 3) →</li>
<li>Retrieve relevant chunks from your Stage-1 vector store →</li>
<li>Generate the answer with your Stage-2 voice model (or base + a strong voice prompt if you used the managed path), grounded in the retrieved chunks →</li>
<li>Apply a light guardrail (faithfulness/format) and return answer + sources.</li></ol>
<h2>Step 2 — Serve it</h2>
<p>Wrap that in your FastAPI <code>/ask</code> + <code>/health</code> service (the deploy lab), Dockerize it, enable CORS, deploy to a free serverless platform. You can verify it with the deploy lab's checker — same contract.</p>
<h2>Step 3 — Instrument and evaluate end-to-end</h2>
<ul>
<li><strong>Trace every call</strong> — log the question, retrieved chunks, final answer, latency, and cost (the observability lesson). One JSONL line per request.</li>
<li><strong>End-to-end eval</strong> — run a handful of questions you know your writing answers; score retrieval (did the right passages come up?) and voice/faithfulness (does it sound like you AND stay grounded?). Record cost per request and p95 latency from your traces.</li></ul>
<div class="callout"><div class="ct">What you built</div>A personal AI that knows your writing and speaks in your voice, designed as an FTI system, deployed behind your own API, traced and evaluated — built end to end with your own hands and your own data. That is the LLM Engineer's Handbook's flagship project, genuinely completed. Few people who "know about AI" have shipped this. You have.</div>`,
quiz:[
{q:"Twin Stage 3 is which pipeline of the FTI architecture?",o:["The feature pipeline","The inference pipeline — assembling retrieval + your tuned model into a served, request-time flow","The training pipeline"],a:1,e:"Stage 1 was the feature pipeline (data → store), Stage 2 the training pipeline (data → model), and Stage 3 is the inference pipeline: retrieve + generate + serve, deployed and monitored."},
{q:"Why trace every request (question, chunks, answer, latency, cost) in the served Twin?",o:["To slow it down","Observability: it's how you debug bad answers, compute p95 latency and cost per request, and feed failures back into evals — operating the system, not just running it","Logging is legally required"],a:1,e:"Traces turn a black box into an operable service: diagnose retrieval-vs-generation failures, measure real latency/cost, and grow your eval set from production — the whole production discipline of this level, applied to your Twin."}]}
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
