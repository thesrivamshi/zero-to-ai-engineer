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
{id:"l6a3",t:"Latency metrics like a pro: percentiles",min:4,sim:"percentiles",src:"INF ch.1 §Metrics",body:`
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
{q:"TTFT p99 spiked but TPOT is stable. Which causes fit?",o:["Slow decoding or memory pressure","Queueing under load, oversized prompts, or prefix-cache misses — prefill-side problems","GPU fan failure"],a:1,e:"TTFT ≈ queue + prefill. Phase-separated percentiles point you at the right subsystem immediately — that's why you track them separately."}]},
{id:"l6a4",t:"Inference at scale: archetypes, metrics, and choosing a model to serve",min:6,src:"INF ch.0–1 §Prerequisites",body:`
<p>Welcome to the expert level, where the question shifts from "does it work?" to "does it work for a million users, fast, and without bankrupting us?" Before the mechanics, get the lay of the land.</p>
<h2>Application archetypes shape everything</h2>
<p>How you serve depends on what you're building. A few axes that drive the engineering:</p>
<ul>
<li><strong>Online vs offline</strong> — a user waiting in real time (chat) vs bulk processing on your schedule (the deployment-types lesson, now at GPU scale). Online lives or dies on latency; offline optimizes throughput and cost.</li>
<li><strong>Consumer vs B2B</strong> — consumer scale means massive, spiky concurrency and tight cost-per-request; B2B often means fewer, higher-value, sometimes privacy-bound requests (self-hosting pressure from Level 1).</li>
<li><strong>AI-native vs feature</strong> — is the model the product (the whole experience is the latency budget) or a feature inside a larger app (it shares the budget)?</li></ul>
<h2>The metrics, made precise</h2>
<p>You've met these; here they are as the serving vocabulary you'll use constantly:</p>
<ul>
<li><strong>[[ttft|TTFT]]</strong> — time to first token (prefill-dominated). The "is it alive?" feel.</li>
<li><strong>[[tpot|TPOT]]</strong> — time per output token (decode-dominated). The "readable pace?" feel.</li>
<li><strong>[[throughput]]</strong> — total tokens/requests per second across all users. The cost number.</li>
<li>All reported as <strong>percentiles</strong>, per phase. End-to-end ≈ TTFT + TPOT × output length.</li></ul>
<h2>Choosing a model to serve</h2>
<p>Serving has its own model-selection funnel, beyond Level 2's quality evals: can a <em>smaller</em> model hit your quality bar (cheaper, faster)? Should you <strong>finetune-for-domain</strong> a small model to match a big one on your task ([[distillation]] economics from Level 4)? Could you <strong>distill</strong> a frontier model's behavior into a tiny servable one? The cheapest model that clears your quality and latency bars wins — and that's often far smaller than the frontier model you prototyped on.</p>
<div class="callout tip"><div class="ct">The expert's reframe</div>At this level, "which model?" is inseparable from "how will I serve it?" A model that's 2% better but 5× costlier and slower to serve may be the wrong choice. You now weigh quality, latency percentiles, throughput, and dollars together — that joint optimization is what inference engineering <em>is</em>.</div>`,
quiz:[
{q:"At the serving level, why might you deliberately choose a smaller or distilled model over a more capable one?",o:["Smaller models are always more accurate","If it clears your quality AND latency bars, a smaller model is cheaper and faster to serve at scale — quality isn't the only axis","Bigger models can't be deployed"],a:1,e:"Serving optimizes quality, latency percentiles, throughput, and cost jointly. A slightly-better model that's far costlier/slower to serve can be the wrong call — the cheapest model that meets all bars wins."},
{q:"End-to-end latency for a generated answer is approximately…",o:["Just TTFT","TTFT + TPOT × number of output tokens — so long outputs hurt even when both phases are healthy","Throughput ÷ batch size"],a:1,e:"First-token time plus per-token time times length. It's why concise outputs are a latency feature, and why you track TTFT and TPOT separately."}]},
{id:"l6a5",t:"ops:byte — why your expensive GPU sits idle",min:7,sim:"opsbyte",src:"INF ch.2 §Calculating Bottlenecks",body:`
<p>Here's the single most clarifying idea in all of inference engineering, and the reason half the techniques in this level exist. A GPU has two resources: <strong>compute</strong> (how fast it multiplies) and <strong>memory bandwidth</strong> (how fast it moves data). Any operation is bottlenecked by one of them — and for LLM decoding, it's almost always the surprising one.</p>
<h2>Arithmetic intensity vs the hardware ratio</h2>
<p>Every operation has an <strong>[[arithmetic intensity]]</strong>: FLOPs of compute per byte of memory moved. Every GPU has an <strong>[[ops:byte]]</strong> ratio: its peak FLOP/s divided by its memory bandwidth (for an A100, roughly 312 TFLOP/s ÷ 2 TB/s ≈ 150 FLOP/byte). The rule:</p>
<ul>
<li>Intensity <strong>below</strong> the ratio → <strong>[[memory-bound]]</strong>: the math units starve, idle, waiting for data. Adding compute does nothing; you need to move fewer bytes or move them faster.</li>
<li>Intensity <strong>above</strong> the ratio → <strong>[[compute-bound]]</strong>: the math units are saturated. You need more FLOPs or less work.</li></ul>
<h2>The punchline for LLM decode</h2>
<p>Generating one token reads the <em>entire</em> model's weights from memory but does relatively little math per weight. At batch size 1, arithmetic intensity is tiny — decode is <strong>deeply memory-bound</strong>. Your pricey GPU's compute sits mostly idle, bottlenecked on hauling weights from memory. Two enormous consequences follow:</p>
<ul>
<li><strong>Batching is nearly free throughput</strong> — because the weights are loaded once and reused across the whole batch, arithmetic intensity ≈ batch size. Raising the batch packs more useful work into each weight-load, lifting throughput until you finally hit the compute roof. This is why serving is obsessed with batching.</li>
<li><strong>[[quantization]] speeds decode</strong> — fewer bytes per weight means less memory traffic, so a memory-bound workload runs faster. Quantization isn't only about fitting in memory; it directly attacks the decode bottleneck.</li></ul>
<p>Play with the sim: pick a GPU, slide the batch, and watch the verdict flip from memory-bound (compute idle) to compute-bound (the roofline).</p>
<div class="callout"><div class="ct">The mental tool you'll use forever</div>Faced with "why is this slow?" or "will this optimization help?", the expert first asks: <em>am I compute-bound or memory-bound?</em> The answer tells you which optimizations can possibly help (a faster GPU does nothing for a memory-bound workload) and which are wasted effort. This one question, the <strong>[[roofline]]</strong> model, organizes the entire field.</div>`,
quiz:[
{q:"Why is single-request (batch=1) LLM decoding memory-bound, not compute-bound?",o:["The model is too small","Generating each token reads all the model's weights from memory but does little math per weight, so the GPU waits on memory while compute idles","Decoding doesn't use the GPU"],a:1,e:"Decode's arithmetic intensity is tiny at batch 1 — lots of bytes moved (all weights) per FLOP. The math units starve waiting for data. That's the memory-bound regime."},
{q:"Given decode is memory-bound, why does batching raise throughput so cheaply?",o:["It uses a faster GPU","Weights are loaded once and reused across the whole batch, so arithmetic intensity rises with batch size — more useful work per weight-load — until you hit the compute roof","It reduces model size"],a:1,e:"The bottleneck is moving weights, and a batch amortizes one weight-load over many requests. Throughput climbs almost for free until intensity reaches the ops:byte ratio and you become compute-bound."}]},
{id:"l6a6",t:"FlashAttention: making the heart of the transformer fast",min:6,src:"INF ch.2 §Attention Optimization",body:`
<p>Attention (Level 1) is the transformer's core — and, done naively, a memory hog that throttles inference. Understanding why, and how <strong>[[flashattention]]</strong> fixes it, ties the ops:byte lesson to a real, ubiquitous optimization.</p>
<h2>Why naive attention is slow</h2>
<p>For a sequence of length n, attention computes an n×n matrix of scores (every token against every token). The naive implementation writes that giant matrix out to the GPU's main memory (HBM), then reads it back to apply softmax, then again to multiply by values. For long contexts that's a huge amount of slow memory traffic — and from the last lesson, you know what that means: <strong>memory-bound</strong>, with the compute units idling. The cost also grows quadratically with sequence length, which is why long context is expensive.</p>
<h2>The FlashAttention trick: don't write the matrix</h2>
<p>FlashAttention computes attention in <strong>tiles</strong> that fit in the GPU's tiny, ultra-fast on-chip memory (SRAM), fusing the score, softmax, and value-multiply into <em>one</em> pass — so the enormous n×n matrix is <strong>never written to slow memory at all</strong>. It uses a clever running-softmax so it never needs the whole row at once. Same mathematical result, a fraction of the memory traffic: dramatically faster and lower-memory, especially for long sequences. It's a textbook case of <strong>[[kernel fusion]]</strong> — keep intermediates in fast memory instead of round-tripping to slow memory.</p>
<div class="callout tip"><div class="ct">You won't write it; you'll rely on it</div>FlashAttention (and its successors) are built into the inference engines and libraries you use — you get the speedup for free by using a modern stack. But knowing <em>why</em> it helps (it kills memory traffic on a memory-bound op) is what lets you reason about long-context costs, pick engines, and understand why "just use a bigger context window" isn't free. The pattern — fuse kernels to avoid slow-memory round-trips — recurs throughout GPU optimization.</div>`,
quiz:[
{q:"What is the core trick that makes FlashAttention faster?",o:["It uses a smaller model","It computes attention in on-chip-memory tiles and never writes the giant n×n score matrix to slow GPU memory — cutting memory traffic on a memory-bound operation","It skips the softmax step"],a:1,e:"Naive attention round-trips a huge intermediate matrix through slow HBM. FlashAttention fuses the steps and keeps tiles in fast SRAM, so the matrix is never materialized in slow memory — same result, far less memory traffic."},
{q:"Why does FlashAttention's benefit grow with longer sequences?",o:["Longer sequences use bigger models","Attention's intermediate matrix and memory traffic grow quadratically with sequence length, so avoiding that traffic matters most exactly when context is long","It doesn't — it's constant"],a:1,e:"The n×n attention matrix scales quadratically with length, and that's the slow-memory traffic FlashAttention eliminates. Long contexts are where naive attention hurts most and where the fix pays off most."}]}
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
{q:"Why route a user's follow-up message to the SAME replica that served them before?",o:["Politeness","That replica likely still holds their conversation's KV cache — a cache hit skips re-prefilling the whole history","Load balancers require it"],a:1,e:"Cache-aware routing trades perfect load spreading for massive prefill savings. At scale, cache hit-rate is a first-class routing objective."}]},
{id:"l6b4",t:"Inside the GPU: the memory hierarchy that explains everything",min:6,src:"INF ch.3 §Hardware",body:`
<p>You've been reasoning about "memory-bound" without seeing the memory. A GPU isn't one pool — it's a <strong>hierarchy</strong>, and its shape explains every optimization in this level.</p>
<table>
<tr><th>Level</th><th>Size</th><th>Speed</th></tr>
<tr><td><strong>Registers / SRAM</strong> (on-chip)</td><td>tiny (KB–MB)</td><td>blazing</td></tr>
<tr><td><strong>HBM / VRAM</strong> (the GPU's main memory)</td><td>moderate (24–192 GB)</td><td>fast, but the bottleneck</td></tr>
<tr><td><strong>System RAM / disk</strong> (off-GPU)</td><td>large</td><td>slow — avoid in the hot path</td></tr>
</table>
<p>The whole game is keeping work in the fast tiers. <strong>Bandwidth</strong> — how fast you move bytes from HBM to the compute units — is the number that matters most for decode (it's the denominator of ops:byte). FlashAttention's trick was literally "stay in SRAM, don't touch HBM." Two model copies' weights must fit in HBM (VRAM) to serve, which is why quantization and multi-GPU exist.</p>
<h2>Generations and alternatives</h2>
<ul>
<li><strong>GPU generations</strong> — each NVIDIA generation (A100 → H100 → newer) mostly raises memory <em>bandwidth</em> and adds low-precision compute (FP8/FP4 tensor cores). Since decode is bandwidth-bound, more bandwidth ≈ directly more tokens/sec — that's why new GPUs are worth the premium for serving.</li>
<li><strong>Multi-GPU instances</strong> — big models span GPUs linked by fast interconnect (NVLink within a box, slower networking across boxes). The interconnect speed decides which parallelism strategies are viable (next chapter).</li>
<li><strong>Non-NVIDIA</strong> — Google TPUs, AMD, and custom inference chips (Groq, etc.) exist and can win on price/performance, but NVIDIA's software moat (CUDA) keeps it dominant.</li>
<li><strong>Local / desktop / mobile</strong> — small quantized models run on laptops and phones (llama.cpp, on-device NPUs) for privacy and zero marginal cost, trading away the top of the quality range.</li></ul>
<div class="callout tip"><div class="ct">One number to internalize: bandwidth</div>When you read a GPU spec sheet for serving, memory <em>bandwidth</em> (TB/s) and <em>capacity</em> (GB) usually matter more than peak FLOPs — because decode is memory-bound. A GPU with huge FLOPs but mediocre bandwidth will disappoint at LLM serving. This is the spec-sheet literacy that separates buyers who get burned from those who don't.</div>`,
quiz:[
{q:"For LLM serving, which GPU spec usually matters most, and why?",o:["Peak FLOPs — more compute is always better","Memory bandwidth (and capacity) — decode is memory-bound, so how fast you stream weights from HBM sets your token rate","Clock speed"],a:1,e:"Decode streams weights from HBM every step, so bandwidth is the bottleneck. A GPU with big FLOPs but weak bandwidth underperforms at serving. Capacity matters too (weights must fit in VRAM)."},
{q:"Why does each new GPU generation help LLM decode even when FLOPs gains are modest?",o:["Lower price","Generations mainly raise memory bandwidth (and add low-precision compute) — and bandwidth directly raises tokens/sec for memory-bound decode","Bigger fans"],a:1,e:"Decode is bandwidth-bound, so more HBM bandwidth ≈ proportionally more tokens/sec. That's why serving operators pay up for newer GPUs even when raw compute barely changed for their workload."}]},
{id:"l6b5",t:"CUDA, kernels, and why custom kernels win",min:5,src:"INF ch.4 §Software",body:`
<p>Under every PyTorch call and every inference engine sits a layer most engineers never see but should understand: <strong>[[kernel|kernels]]</strong>, the functions that actually run on the GPU, written in <strong>[[cuda|CUDA]]</strong> (NVIDIA's GPU programming platform).</p>
<h2>Why kernels matter for speed</h2>
<p>A naive model runs as a long sequence of separate kernels — one for each operation — and between them, intermediate results get written to slow HBM and read back. Sound familiar? It's the same slow-memory round-trip FlashAttention killed. <strong>[[kernel fusion]]</strong> generalizes the fix: combine many operations into one kernel so intermediates stay in fast on-chip memory. Fewer trips to slow memory = faster, especially for memory-bound work. This is a primary source of the speedups inference engines deliver.</p>
<h2>How this reaches you</h2>
<ul>
<li><strong>PyTorch</strong> is the standard framework for defining and running models; it calls optimized kernels under the hood and can compile/fuse them.</li>
<li><strong>Compiled engines</strong> (TensorRT-LLM) go further: they generate kernels tuned for your specific model and GPU ahead of time — peak performance, more setup.</li>
<li><strong>Model formats</strong> — weights ship in formats like <code>safetensors</code> (safe, fast-loading) or GGUF (for llama.cpp). The format affects load time and which runtime can serve it.</li></ul>
<p>You won't write CUDA. But knowing that fusion-of-kernels-to-avoid-slow-memory is <em>the</em> recurring optimization lets you understand why one engine is faster than another, why compilation helps, and why "it's the same model" doesn't mean "it's the same speed."</p>
<div class="callout"><div class="ct">The pattern, one more time</div>FlashAttention, kernel fusion, compiled engines — they're all the same move: <em>stop round-tripping intermediates through slow memory.</em> Once you see that the GPU's slow tier (HBM) is the enemy, the entire software stack's purpose snaps into focus: keep data in the fast tiers, move bytes as few times as possible. That's 80% of GPU performance engineering in one sentence.</div>`,
quiz:[
{q:"What does kernel fusion do, and why does it speed things up?",o:["It runs kernels on more GPUs","It combines several operations into one kernel so intermediate results stay in fast on-chip memory instead of round-tripping through slow HBM","It deletes unused layers"],a:1,e:"Separate kernels write/read intermediates to slow memory between steps. Fusing them keeps intermediates on-chip — the same slow-memory-avoidance principle as FlashAttention, generalized."},
{q:"Two serving setups run 'the same model' but one is much faster. A likely reason?",o:["The faster one cheated","Different kernels/engine: fusion, a compiled engine tuned for the GPU, or better attention kernels move far less memory for identical math","Models can't differ in speed"],a:1,e:"Identical math can have very different memory traffic depending on the kernels. A compiled or better-fused engine does the same computation with fewer slow-memory trips — hence faster."}]},
{id:"l6b6",t:"Benchmarking and load testing: measure before you trust",min:5,src:"INF ch.4 §Benchmarking",body:`
<p>Every claim in this level — "quantization is ~free," "batching lifts throughput," "this engine is faster" — ends in the same imperative: <strong>measure it on your workload.</strong> Serving has its own measurement discipline beyond quality evals.</p>
<h2>What to measure</h2>
<ul>
<li><strong>Latency percentiles per phase</strong> — TTFT and TPOT at p50/p95/p99, not averages (the percentiles lesson).</li>
<li><strong>Throughput</strong> — tokens/sec and requests/sec the setup sustains.</li>
<li><strong>The trade-off curve</strong> — these move together: as you raise concurrency, throughput climbs but latency degrades. The useful artifact is the <em>curve</em> of latency-vs-throughput, which shows where you can sit while still meeting your latency SLO.</li></ul>
<h2>Load testing</h2>
<p><strong>[[load testing]]</strong> sends controlled, increasing traffic at your service to answer: how many concurrent users before p99 latency breaches the SLO? Where does it fall over? You ramp request rate, watch the metrics, and find the breaking point <em>before</em> your users do. Crucial subtlety for LLMs: use <strong>realistic workloads</strong> — real prompt lengths and output lengths — because a benchmark of tiny prompts will wildly overstate the throughput you'll actually get with long contexts.</p>
<div class="callout fail"><div class="ct">Why it breaks: the benchmark that lied</div>A team benchmarks with 50-token prompts and short outputs, sees great throughput, and provisions accordingly. Production traffic has 4,000-token prompts and long answers — prefill and KV-cache memory explode, throughput craters, and the service falls over at a fraction of the "benchmarked" load. The fix is non-negotiable: benchmark and load-test with traffic that matches reality, including the long-context tail.</div>`,
quiz:[
{q:"Why must LLM load tests use realistic prompt and output lengths?",o:["Short prompts are against the rules","Throughput depends heavily on context length (prefill cost, KV-cache memory); tiny-prompt benchmarks overstate real capacity and lead to under-provisioning","Long prompts are more accurate"],a:1,e:"A 50-token benchmark hides the prefill and memory cost of real 4,000-token traffic. Realistic lengths reveal the throughput you'll actually sustain — anything else plans for a fantasy workload."},
{q:"What's the most useful artifact from serving benchmarks?",o:["A single 'max throughput' number","The latency-vs-throughput curve — it shows how high you can push concurrency while still meeting your latency SLO","The GPU temperature"],a:1,e:"Throughput and latency trade off as concurrency rises. The curve (not one peak number) tells you the operating point that maximizes throughput within your p99 latency budget."}]}
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
