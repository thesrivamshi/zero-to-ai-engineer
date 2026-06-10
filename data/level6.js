window.COURSE_LEVELS = window.COURSE_LEVELS || [];
window.COURSE_LEVELS.push({
title:"Expert: Inference at Scale",
sub:"What happens inside the datacenter: GPUs, KV caches, batching, quantization, speculative decoding, and the economics of serving models. The expert tier.",
chapters:[
{title:"Inference mechanics",lessons:[
{id:"l6a1",t:"Prefill and decode: the two-phase secret",min:5,body:`
<p>Everything in inference engineering follows from one structural fact: serving an LLM request has <strong>two phases with opposite personalities</strong>.</p>
<p><strong>[[prefill|Prefill]]</strong> — processing your prompt. All prompt tokens are known upfront, so the GPU processes them <em>in parallel</em>, in one big pass. This saturates the GPU's compute units: prefill is <strong>compute-bound</strong>. Its duration grows with prompt length — and it ends when the first output token appears.</p>
<p><strong>[[decode|Decode]]</strong> — generating the answer. Tokens come one at a time (each depends on the last — the Level 1 loop!), and here's the killer: for every single token, the GPU must read <em>all the model weights</em> from memory, to do a comparatively tiny amount of math. The compute units sit mostly idle, waiting on memory. Decode is <strong>[[memory bandwidth]]-bound</strong>.</p>
<p>This split maps exactly onto the two user-facing latency metrics:</p>
<ul>
<li><strong>[[ttft|TTFT]]</strong> (time to first token) ≈ queueing + prefill. Long prompt (your 30k-token RAG context!) → slow TTFT.</li>
<li><strong>[[tpot|TPOT]]</strong> (time per output token) ≈ decode speed — the streaming rate users watch.</li></ul>
<p>One request, two bottlenecks, two metrics — and as you'll see, two completely different optimization toolkits. When an engineer says "we're memory-bound", this is what they mean.</p>
<div class="callout"><div class="ct">Back-of-envelope power</div>A 7B model in FP16 ≈ 14 GB of weights. A GPU with ~1 TB/s memory bandwidth can read those weights at most ~70×/second → theoretical max ~70 tokens/sec for a single user, <em>no matter how much compute the GPU has</em>. One division, and you've bounded reality — this is the ops:byte reasoning that runs all of inference engineering.</div>`,
quiz:[
{q:"Why is decode memory-bandwidth-bound?",o:["Decoding uses more compute than prefill","Each generated token requires reading ALL model weights from memory for relatively little math — the GPU waits on memory, not compute","The KV cache slows it down"],a:1,e:"Sequential generation = full weight read per token. Arithmetic is cheap; moving 14+ GB per token is not. This is THE central fact of LLM serving."},
{q:"Your RAG app has terrible TTFT but fine streaming speed. Where's the problem?",o:["Decode phase — buy faster GPUs","Prefill phase — your prompts (retrieved context!) are huge; trim them, cache prefixes, or parallelize prefill","The tokenizer"],a:1,e:"TTFT ≈ prefill, and prefill scales with prompt length. The fix is on the prompt/context side — which you, the application engineer, control. (Level 3's prompt diet, vindicated.)"}]},
{id:"l6a2",t:"The KV cache: memory eats the GPU",min:5,sim:"kvcache",body:`
<p>During decode, each new token's [[attention]] must look at all previous tokens. Recomputing those from scratch per token would be quadratic madness — so engines store every token's attention keys and values: the <strong>[[kv cache|KV cache]]</strong>. (Drag the slider above to see what it saves.)</p>
<p>The price: that cache lives in GPU memory, and it is <em>enormous</em>. For a 7B-class model, roughly ~0.5 MB per token — so a single 32k-token conversation holds ~16 GB of cache. <strong>One long conversation can occupy as much GPU memory as the entire model.</strong> And every concurrent user has their own.</p>
<p>This transforms the serving problem: GPU memory = weights (fixed) + KV caches (grows with users × context). The cache, not compute, usually decides how many users fit on a GPU — and managing it is half the job of an [[inference engine]]:</p>
<ul>
<li><strong>PagedAttention</strong> (vLLM's signature idea): allocate cache in small fixed-size pages, like an operating system manages RAM — eliminating the fragmentation that wasted 60–80% of memory in naive engines, and multiplying how many concurrent users fit</li>
<li><strong>[[prefix caching|Prefix caching]]</strong>: requests sharing an identical prefix (the same system prompt across all your users!) share one cached copy — both memory and prefill compute saved. This is the engine-side mechanism behind Level 3's "static parts first" advice.</li>
<li><strong>Cache eviction/offloading</strong>: idle conversations' caches move to CPU RAM or disk, reloading on the next message — trading a little latency for a lot of capacity</li></ul>`,
quiz:[
{q:"Why does a long conversation threaten GPU capacity even though the model fits comfortably?",o:["Long conversations use more weights","The KV cache grows with every token — at ~0.5 MB/token, a 32k context holds ~16 GB, rivaling the model itself","Long conversations overheat the GPU"],a:1,e:"Weights are fixed; caches scale with users × context length. KV memory is usually the real constraint on concurrency — and the reason cache management is half of serving."},
{q:"What did PagedAttention fix?",o:["Slow attention math","Memory fragmentation — page-based cache allocation reclaimed the 60-80% of memory naive engines wasted, multiplying concurrent capacity","Network latency"],a:1,e:"Treating KV memory like an OS treats RAM (small pages, no giant contiguous reservations) was the insight that made vLLM the default serving engine."}]},
{id:"l6a3",t:"Latency metrics like a pro: percentiles",min:4,body:`
<p>"Average latency is 800ms" is how dashboards lie. Real traffic latencies are skewed: most requests are fast, a tail is brutally slow — and <strong>averages hide the tail</strong>. Professionals speak in percentiles:</p>
<ul>
<li><strong>p50</strong> (median) — the typical experience</li>
<li><strong>p95 / p99</strong> — the worst experience 1-in-20 / 1-in-100 requests get. THIS is what users complain about, and what SLOs are written against.</li></ul>
<p>Why the tail matters more than it seems: a user session involves many requests, so the chance of hitting the p99 at least once climbs fast. Your heaviest users — the ones with long conversations and big documents — live disproportionately in the tail. The tail IS the product experience for your best customers.</p>
<p>For LLM serving, measure percentiles of each phase separately, because their causes differ:</p>
<ul>
<li><strong>TTFT p99 blowups</strong> → queueing under load, giant prompts, cache misses on cold prefixes</li>
<li><strong>TPOT p99 blowups</strong> → oversized batches, memory pressure, noisy neighbors on shared GPUs</li>
<li><strong>End-to-end</strong> — what the user feels: TTFT + TPOT × output length. (Long outputs hurt even when both phases are healthy — another reason concise answers are an engineering feature.)</li></ul>
<div class="callout tip"><div class="ct">Habit transfer</div>You computed p95 from your own logs in the Level 5 gate. From now on, every latency conversation you have — with vendors, dashboards, or teammates — should reflexively ask: "p-what?"</div>`,
quiz:[
{q:"Why are averages misleading for latency?",o:["Math errors","Skewed distributions: a fast majority hides a painful tail, and the tail is what users actually complain about","Averages are fine"],a:1,e:"p99 captures the 1-in-100 experience that average erases — and across a multi-request session, most users hit the tail eventually."},
{q:"TTFT p99 spiked but TPOT is stable. Which causes fit?",o:["Slow decoding or memory pressure","Queueing under load, oversized prompts, or prefix-cache misses — prefill-side problems","GPU fan failure"],a:1,e:"TTFT ≈ queue + prefill. Phase-separated percentiles point you at the right subsystem immediately — that's why you track them separately."}]}
]},
{title:"Hardware & engines",lessons:[
{id:"l6b1",t:"GPUs: what actually matters on the spec sheet",min:5,body:`
<p>A [[gpu|GPU]] is thousands of small cores built to do the same operation on huge blocks of numbers simultaneously — born for graphics, perfect for the matrix multiplications that are ~all of a transformer. Reading a spec sheet like an inference engineer, three numbers matter:</p>
<ul>
<li><strong>[[vram|Memory capacity]]</strong> (GB) — the hard gate: weights + KV caches must fit. Consumer cards ~24 GB; datacenter cards 80–192+ GB. Don't fit → you're sharding across GPUs (complexity) or quantizing (next chapter).</li>
<li><strong>[[memory bandwidth|Memory bandwidth]]</strong> (GB/s) — your decode speed, as the back-of-envelope showed. Datacenter cards run 2–8 TB/s; this number is most of what the price buys.</li>
<li><strong>Compute</strong> (FLOPS at various precisions) — governs prefill speed and batched throughput. Modern cards have specialized tensor cores with extra-fast low-precision modes (FP8, FP4) — half the reason quantization pays.</li></ul>
<p>The ecosystem in one paragraph: NVIDIA dominates (the CUDA software moat as much as the silicon), generations march on (Hopper → Blackwell → onward, each a big bandwidth/precision jump); AMD and custom accelerators (TPUs, Trainium, Groq…) compete on price-performance in spots; and <strong>renting beats buying</strong> for almost everyone (cloud per-hour or serverless-GPU platforms like Modal/RunPod/Baseten that bill per second).</p>
<div class="callout"><div class="ct">Local inference counts too</div>The same arithmetic runs on your laptop: a 7B model at 4-bit ≈ 4 GB — runs on a decent laptop via Ollama or llama.cpp. Edge/local inference (privacy, offline, zero marginal cost) is a real deployment target, and your bytes-per-parameter math now covers it.</div>`,
quiz:[
{q:"Which spec most directly determines single-user decode speed?",o:["Core count","Memory bandwidth — decode is bound by how fast weights stream from memory","VRAM capacity"],a:1,e:"Decode reads all weights per token. Bandwidth ÷ model bytes ≈ max tokens/sec. Capacity decides what FITS; bandwidth decides how FAST."},
{q:"A 70B model in FP16 (~140 GB) on 80 GB GPUs — what are your options?",o:["It's impossible","Shard across multiple GPUs, or quantize (140 GB → ~35 GB at 4-bit fits on one card)","Use a bigger hard drive"],a:1,e:"Weights must fit in GPU memory. Parallelism or precision-reduction are the levers — and that arithmetic is exactly how real capacity planning works."}]},
{id:"l6b2",t:"Batching: the economics of serving",min:5,sim:"batching",body:`
<p>The decode insight — GPU reads 14 GB of weights to produce ONE token — contains its own salvation: <strong>that weight-read can serve many users at once.</strong> Process 32 users' next-tokens together and you amortize one memory pass across 32 outputs. Throughput scales ~linearly; each user's latency degrades only mildly (drag the slider above). [[batching|Batching]] is the entire economic basis of serving — it's why API tokens cost cents, not dollars.</p>
<p>But naive ("static") batching has an ugly flaw: requests finish at different times, and everyone waits for the longest. The fix that defines modern engines is <strong>[[continuous batching]]</strong>: the batch is rebuilt <em>every decode step</em> — finished requests exit instantly, queued requests join mid-flight. GPU stays full, no one waits on strangers.</p>
<p>One scheduling wrinkle remains: prefill and decode in one batch interfere — a new request's heavy prefill stalls everyone else's smooth decode (TPOT spikes!). Engines mitigate with chunked prefill (slice big prompts into pieces interleaved with decode steps); at datacenter scale there's a stronger move coming in the techniques chapter (<em>disaggregation</em>).</p>
<div class="callout"><div class="ct">The dial every operator sets</div>Bigger batches → throughput ↑, cost/token ↓, per-user latency ↑. Latency-sensitive chat: modest batches. Overnight batch jobs: maximum stuffing. There is no 'right' setting — only the right setting for YOUR latency target. (Notice this is the same trade-off you priced in Level 5's batch-vs-realtime decision, now visible at the hardware level.)</div>`,
quiz:[
{q:"Why does batching dramatically improve throughput at modest latency cost?",o:["GPUs prefer even numbers","Decode is memory-bound — one weight-read from memory can compute next-tokens for MANY users, amortizing the expensive part","It compresses the requests"],a:1,e:"The bottleneck (weight streaming) is paid once per step regardless of batch size, up to compute limits. Sharing it across users is nearly free throughput."},
{q:"What does continuous batching fix over static batching?",o:["Memory fragmentation","Convoy waste: requests join and leave the batch every step, so short requests don't wait for long ones and the GPU never idles","Network errors"],a:1,e:"Rebuilding the batch each decode step keeps utilization high under real, messy traffic — a defining feature of vLLM-class engines."}]},
{id:"l6b3",t:"Inference engines: vLLM and the serving stack",min:4,body:`
<p>You could load a model with plain PyTorch and generate. An [[inference engine]] does the same job 10–100× more efficiently — it's where every technique from this level lives in software:</p>
<ul>
<li><strong>vLLM</strong> — the open-source default. PagedAttention, continuous batching, prefix caching, quantized-model support, speculative decoding — and an OpenAI-compatible API server, so <em>the client code you've written all course works unchanged against your own GPU</em>.</li>
<li><strong>SGLang</strong> — vLLM's main open rival; notably strong at structured generation and aggressive prefix-cache reuse (RadixAttention) for agentic/branching workloads.</li>
<li><strong>TensorRT-LLM</strong> — NVIDIA's compiled approach: kernels tuned per model per GPU; peak performance, more setup friction.</li>
<li><strong>llama.cpp / Ollama</strong> — the local/edge end: CPU+GPU mixes, aggressive quantization, runs on laptops.</li></ul>
<p>Trying it is genuinely this small (any Linux box with a suitable GPU, rented by the hour):</p>
<pre><code>pip install vllm
vllm serve Qwen/Qwen2.5-7B-Instruct
# ...and your existing OpenAI client code points at http://localhost:8000/v1</code></pre>
<p>Above the engine sits the serving layer you already know from Level 5 — containers, autoscaling, routing — with two GPU-specific twists: <strong>[[cold start|cold starts]] are brutal</strong> (pulling a multi-GB image + loading weights into VRAM = minutes, making scale-to-zero painful for spiky traffic), and <strong>routing should be cache-aware</strong> (send a user's follow-up to the replica already holding their KV cache/prefix — a cache hit beats a 'balanced' load).</p>`,
quiz:[
{q:"Why do GPU services suffer especially badly from cold starts?",o:["GPUs are slow computers","Spinning up means pulling huge images AND loading tens of GB of weights into VRAM — minutes, not seconds — which fights scale-to-zero economics","Clouds throttle GPUs"],a:1,e:"A web container cold-starts in seconds; a model server in minutes. Operators keep warm capacity, accept idle cost, or engineer fast weight-loading — there's no free option."},
{q:"Why route a user's follow-up message to the SAME replica that served them before?",o:["Politeness","That replica likely still holds their conversation's KV cache — a cache hit skips re-prefilling the whole history","Load balancers require it"],a:1,e:"Cache-aware routing trades perfect load spreading for massive prefill savings. At scale, cache hit-rate is a first-class routing objective."}]}
]},
{title:"Optimization techniques",lessons:[
{id:"l6c1",t:"Quantization: the closest thing to a free lunch",min:5,sim:"quant",body:`
<p>You've met [[quantization]] twice — QLoRA's frozen 4-bit base (Level 4), and the fits-on-what-GPU arithmetic. Now the full picture: storing [[weight|weights]] in fewer bits per number (16 → 8 → 4) attacks BOTH serving constraints at once:</p>
<ul>
<li><strong>Memory capacity</strong> — a 70B model: 140 GB at FP16 → 35 GB at 4-bit. Multi-GPU problem becomes single-GPU problem (play with the simulator above).</li>
<li><strong>Memory bandwidth</strong> — decode streams weights from memory; half the bytes ≈ up to twice the tokens/sec. Modern tensor cores even compute faster at low precision (FP8/FP4).</li></ul>
<p>How it works, intuitively: each group of weights gets a scale factor mapping its range onto a small integer grid; smarter schemes (GPTQ, AWQ, modern FP8/FP4 formats) protect the few outlier weights that matter disproportionately, calibrating against sample data.</p>
<p>The quality bill, with today's methods: <strong>8-bit ≈ free</strong> (~99%+ retained); <strong>4-bit ≈ cheap</strong> (~97–98% on most tasks — the industry sweet spot); below 4-bit it gets real. Two caveats that separate pros from spec-sheet readers:</p>
<ul>
<li>Damage is <em>uneven</em> — math, code, long-chain reasoning, and low-resource languages degrade first; casual chat hides damage that your hardest tasks expose</li>
<li>So the rule is the eternal one: <strong>run YOUR eval suite on the quantized model.</strong> Generic benchmarks won't feel your edge cases. (Every level of this course converges on the same sentence.)</li></ul>`,
quiz:[
{q:"Why does quantization speed up decoding, beyond just fitting in memory?",o:["It shortens the answers","Decode is memory-bandwidth-bound — fewer bytes per weight = fewer bytes streamed per token = more tokens/sec","It skips layers"],a:1,e:"Bandwidth is the decode bottleneck, and quantization directly shrinks the bytes moved. Capacity AND speed from one technique — that's why it's universal."},
{q:"Your 4-bit model aces casual-chat tests. What should worry you before shipping?",o:["Nothing — chat is representative","Quantization damage is uneven: math, code, and complex reasoning degrade first — run your full eval suite, especially the hard cases","The model might be too fast"],a:1,e:"Easy tasks mask quantization loss; your hardest 20% is where it bites. Task-specific evals (yours!) are the only honest verdict."}]},
{id:"l6c2",t:"Speculative decoding: spending compute to save time",min:5,sim:"speculative",body:`
<p>Decode wastes the GPU's compute (it idles waiting on memory). [[speculative decoding|Speculative decoding]] spends that idle compute to buy latency, via a beautiful trick:</p>
<ol>
<li>A tiny, fast <strong>draft model</strong> guesses the next k tokens (say 4) in sequence — cheap, quick</li>
<li>The big <strong>target model</strong> verifies all 4 <em>in one parallel pass</em> — remember, processing known tokens in parallel is what GPUs do brilliantly (it's prefill-shaped work!)</li>
<li>Matching tokens are accepted instantly; at the first mismatch, the target's own token replaces it and drafting resumes from there</li></ol>
<p>The output is <strong>mathematically identical</strong> to the big model generating alone — the draft only proposes; the target always disposes. When drafts are right ~70% of the time, you get 2–3× faster generation for free quality-wise (slider above shows the acceptance-rate sensitivity).</p>
<p>When it shines: predictable text — code (boilerplate!), structured output, formulaic prose — and that's exactly where draft models guess well. When it flops: creative, high-entropy text at high temperature; acceptance drops, you pay drafting overhead for nothing, and it can net out <em>slower</em>. Production systems measure acceptance rate per workload and toggle accordingly.</p>
<p>Variants you'll see in engine docs: separate small models, extra prediction heads on the target itself (Medusa/EAGLE-style), and model-free n-gram lookahead (drafting by copying from the prompt — shockingly effective for RAG, where answers quote the context!).</p>`,
quiz:[
{q:"Why doesn't speculative decoding change output quality?",o:["The draft model is very good","The target model verifies every proposed token and overrides any mismatch — the draft only saves time when it agrees with what the target would've said","It does degrade quality slightly"],a:1,e:"Acceptance requires agreement with the target's own distribution. Speculation is a scheduling trick, not an approximation — same tokens, fewer slow sequential steps."},
{q:"Why is n-gram (copy-from-prompt) speculation so effective for RAG workloads?",o:["RAG uses smaller models","Grounded answers quote retrieved context heavily — so 'draft by copying from the prompt' guesses right constantly","It isn't effective"],a:1,e:"RAG answers are largely restatements of supplied text. Free drafting from that text gets high acceptance with zero extra model — a lovely systems insight."}]},
{id:"l6c3",t:"Going multi-GPU: parallelism and disaggregation",min:5,body:`
<p>When one GPU isn't enough — model too big, or traffic too heavy — the toolbox splits work across many. The flavors, by what gets split:</p>
<ul>
<li><strong>[[tensor parallelism|Tensor parallelism]]</strong> — every layer's matrices split across N GPUs; all N cooperate on every token, chattering constantly over ultra-fast interconnects (NVLink). Buys: room for big models AND lower latency (N memory systems streaming weights in parallel). Costs: communication overhead; needs GPUs in the same box.</li>
<li><strong>Pipeline parallelism</strong> — layers 1–20 on GPU A, 21–40 on GPU B; tokens flow through like an assembly line. Simpler interconnect needs, but per-token latency doesn't improve. Mostly for fitting truly enormous models.</li>
<li><strong>Expert parallelism</strong> — for [[moe|Mixture-of-Experts]] models: experts spread across GPUs; each token visits only its few routed experts. The throughput-efficient way to serve modern MoE frontier models.</li>
<li><strong>Replication</strong> — the boring champion: model fits on one GPU? Just run N independent copies behind a load balancer. No communication overhead, linear scaling. Always check this first.</li></ul>
<p>And the datacenter-scale finisher — <strong>disaggregation</strong>: remember prefill (compute-hungry) and decode (memory-hungry) fighting inside shared batches? Big deployments now run them on <em>separate GPU pools</em>: prefill nodes chew prompts and ship the resulting KV cache over fast networks to decode nodes that stream tokens. Each pool gets hardware matched to its bottleneck and scales independently (long-prompt-heavy day? grow the prefill pool). This is how the largest API providers actually serve — your requests are very likely prefilled and decoded on different machines.</p>`,
quiz:[
{q:"Your model fits comfortably on one GPU but traffic tripled. First move?",o:["Tensor parallelism across 3 GPUs","Replication — three independent copies behind a load balancer; zero communication overhead, linear scaling","Pipeline parallelism"],a:1,e:"Parallelism techniques pay communication taxes that only make sense when you NEED them (model too big, or latency targets unreachable). For pure throughput with a fitting model, copies win."},
{q:"What's the logic of prefill/decode disaggregation?",o:["Separating users by subscription tier","The two phases have opposite bottlenecks (compute vs. memory bandwidth) — separate GPU pools let each be provisioned and scaled to its own bottleneck","It reduces electricity use"],a:1,e:"Specialized pools end the interference (prefills stalling decode) and let capacity match workload shape — the architecture of frontier-scale serving."}]},
{id:"l6c4",t:"The economics of serving (and when to self-host)",min:5,body:`
<p>The capstone question of the expert tier: <strong>API or self-host?</strong> Now you can answer it with arithmetic instead of vibes.</p>
<p><strong>Cost per token, self-hosted</strong> = (GPU $/hour) ÷ (throughput in tokens/hour) — and now every term is yours to estimate: throughput follows from model bytes, memory bandwidth, batch size, quantization, and utilization. The brutal lever is <strong>utilization</strong>: a GPU at 10% utilization produces tokens at ~10× the cost of a busy one. APIs pool everyone's traffic to keep GPUs saturated — that's the efficiency you're renting, and why APIs are so hard to beat at low volume.</p>
<p>The honest decision grid:</p>
<ul>
<li><strong>Stay on APIs when</strong>: volume is low/spiky, you need frontier-best quality, your team is small. (Most products, most of the time.)</li>
<li><strong>Self-hosting wins when</strong>: volume is high and steady (utilization!), a smaller/fine-tuned open model passes your evals (Level 4's distillation play), data can't leave your infrastructure, or per-token margins are your business model</li>
<li><strong>The hybrid truth</strong>: mature systems mix — frontier API for the hard 10%, self-hosted distilled model for the bulk 90% ([[model cascade|cascade]], now priced end-to-end)</li></ul>
<div class="callout fail"><div class="ct">Real-world failure</div>A startup proudly migrated off APIs to "save money": rented an 8-GPU cluster, served their fine-tuned 70B… at 8% average utilization. Their cost per token came out ~6× the API price they'd left, plus an infra engineer's salary. The arithmetic was knowable in advance — utilization × throughput × $/hour — and nobody ran it. You, now, would run it.</div>
<p>And with that, you can reason from "user types a question" down to "bytes stream across a memory bus" and back up to "this is what it costs and why." That's the full stack of AI engineering.</p>`,
quiz:[
{q:"Why are APIs so hard to beat on cost at low volume?",o:["Providers sell below cost","Utilization: pooled multi-tenant traffic keeps their GPUs saturated, while your dedicated GPU would idle — and idle GPUs make expensive tokens","They use secret hardware"],a:1,e:"Cost/token = $/hour ÷ tokens/hour. At 10% utilization your denominator collapses. Pooling IS the API's product as much as the model is."},
{q:"Which situation most favors self-hosting?",o:["A weekend prototype","High steady volume + a fine-tuned smaller model that passes your evals + data-residency requirements","Wanting the absolute best model quality with no ops team"],a:1,e:"Steady volume buys utilization; a smaller adapted model shrinks the hardware bill; privacy needs remove the API option. When all three align, self-hosting wins decisively."}]}
]}
],
project:{id:"l6gate",t:"Capstone — Design, build, measure, defend",
body:`
<p>The final gate. Not a guided exercise — a brief, like you'd get from a CTO. You make the calls; you defend them with numbers. Budget 2–4 weeks of evenings.</p>
<h2>The brief</h2>
<p>Build a complete AI application that solves a problem you genuinely care about, using at minimum: <strong>retrieval over real documents, at least one tool/function the model can call, structured logging with cost tracking, an eval suite with ≥25 cases, guardrails, and a deployed endpoint.</strong> Beyond that, every architecture decision is yours.</p>
<h2>Required deliverables</h2>
<h3>1. The design doc (write FIRST, 2 pages max)</h3>
<ul>
<li>The problem, the users, and what "good" means — with 3 measurable success criteria</li>
<li>Architecture sketch: components, data flow, model choices WITH reasoning (why this model tier for this step? API vs self-hosted — show the arithmetic from the economics lesson)</li>
<li>Failure-mode analysis: your top 3 risks (hallucination where? injection how? cost blowup when?) and the specific mitigation for each</li></ul>
<h3>2. The build</h3>
<ul><li>All six minimum elements, working end-to-end at a URL</li></ul>
<h3>3. The measurement report</h3>
<ul>
<li>Eval results: overall + broken down by case type, including adversarial and impossible-question cases</li>
<li>Performance: p50/p95 TTFT and end-to-end latency from your real logs</li>
<li>Economics: measured cost per request → projected monthly cost at 100× volume → ONE concrete optimization (cascade? caching? distillation? quantized self-host?) with estimated savings, using real arithmetic</li></ul>
<h3>4. The defense (1 page)</h3>
<p>Three honest answers: What would break first at 1,000× scale, and what would you change? What did you measure that surprised you? What would you NOT build again?</p>
<h2>Grading yourself — the rubric</h2>
<table>
<tr><th>Dimension</th><th>Passing standard</th></tr>
<tr><td>Working system</td><td>A stranger can use the deployed URL and get grounded, cited answers</td></tr>
<tr><td>Engineering judgment</td><td>Model/architecture choices justified by measurement or arithmetic, not fashion</td></tr>
<tr><td>Evaluation rigor</td><td>≥25 cases incl. adversarial; scores tracked across at least 2 system iterations</td></tr>
<tr><td>Safety</td><td>Injection attempted by you against your own system, results documented, mitigations in place</td></tr>
<tr><td>Economics</td><td>Cost per request known; scale projection and optimization plan use real numbers</td></tr>
<tr><td>Honesty</td><td>The defense names real weaknesses — systems without known weaknesses are systems without known anything</td></tr>
</table>
<p>Pass this gate honestly, and you are not someone who watched videos about AI. You're someone who has designed, built, attacked, measured, deployed, and priced a complete AI system — and can explain every layer from the prompt to the memory bus. That's an AI engineer. Welcome to the field.</p>`,
checklist:[
"I wrote the design doc FIRST: success criteria, architecture with justified choices, failure-mode analysis",
"My system includes retrieval, tool calling, logging with cost tracking, guardrails, 25+ eval cases, and a deployed endpoint",
"I ran my eval suite across at least 2 iterations and improved a measured weakness",
"I attacked my own system with prompt injection and documented results + mitigations",
"I measured p50/p95 latency and cost/request from real logs, projected 100× scale, and designed one optimization with arithmetic",
"I wrote the honest defense: what breaks at scale, what surprised me, what I'd do differently"
]}
});
