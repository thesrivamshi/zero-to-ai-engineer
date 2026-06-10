window.COURSE_LEVELS = window.COURSE_LEVELS || [];
window.COURSE_LEVELS.push({
title:"Customizing Models",
sub:"When prompting isn't enough: dataset engineering, supervised fine-tuning, LoRA, and preference alignment — changing what the model IS.",
chapters:[
{title:"The decision",lessons:[
{id:"l4a1",t:"To fine-tune or not to fine-tune",min:5,body:`
<p>[[fine-tuning|Fine-tuning]] continues training an existing model on your own examples, actually changing its [[weight|weights]]. It's the most powerful adaptation tool — and the most overprescribed. The decision framework, sharpened from Level 1's ladder:</p>
<p><strong>Fine-tuning is the right tool when:</strong></p>
<ul>
<li><strong>Behavior won't stick via prompting</strong> — you need a consistent voice, exact format, or domain-specific style across thousands of outputs, and your measured prompt-engineering ceiling is too low</li>
<li><strong>You're distilling for economics</strong> — a small fine-tuned model matches a frontier model on YOUR narrow task at 1/20th the inference cost. (This is the most common commercially-sound reason.)</li>
<li><strong>The domain is genuinely alien</strong> — specialized jargon and conventions (legal, medical, your codebase) that base models handle clumsily</li>
<li><strong>Prompts have become monsters</strong> — 4,000 tokens of instructions+examples re-billed on every call can be baked into weights instead</li></ul>
<p><strong>It's the wrong tool when:</strong></p>
<ul>
<li><strong>The problem is knowledge</strong> — facts go stale and fine-tuning teaches style far better than it stores facts; that's RAG's job. (The #1 misuse.)</li>
<li><strong>You have no eval</strong> — without a test set, you literally cannot know whether the fine-tune helped. Eval first, always.</li>
<li><strong>You have under ~100 quality examples</strong> — below that, few-shot prompting usually wins anyway</li>
<li><strong>You haven't maxed out prompting</strong> — a day of prompt work is cheaper than the cheapest fine-tune</li></ul>
<div class="callout"><div class="ct">The honest sequence</div>Prompt → measure → RAG (if knowledge) → measure → fine-tune (if behavior still falls short) → measure. Teams that skip to fine-tuning usually buy a slower, costlier way to discover their prompt was the problem.</div>`,
quiz:[
{q:"Your bot needs to know this week's product catalog. Fine-tune?",o:["Yes — knowledge belongs in weights","No — fresh, changing facts are RAG's job; fine-tuning teaches behavior, not a database","Yes, weekly fine-tunes"],a:1,e:"Facts in weights go stale immediately and update expensively. The classic misuse. Fine-tune for HOW the model writes; retrieve WHAT it should know."},
{q:"What's the most common commercially-sound reason to fine-tune?",o:["It's more impressive to investors","Distillation economics: a small fine-tuned model matching a big model on a narrow task at a fraction of the inference cost","To remove the need for evaluation"],a:1,e:"Replace an expensive frontier-model call with a cheap specialized one, with evals proving parity on your task — at volume, the savings are enormous."}]},
{id:"l4a2",t:"The fine-tuning landscape: APIs vs open weights",min:4,body:`
<p>Two roads, same destination:</p>
<p><strong>Managed fine-tuning (e.g. OpenAI's API):</strong> upload training examples in JSONL, the provider trains and hosts the result, you call it like any model. No GPUs, no infrastructure — but the model stays theirs, you tune limited knobs, and per-token prices for fine-tuned models run higher.</p>
<p><strong>Open-weights fine-tuning (Llama, Mistral, Qwen + libraries like Hugging Face TRL, Axolotl, Unsloth):</strong> you control everything — method, data privacy, where it runs, what it costs to serve. The price: it's real ML engineering, with GPUs (rented by the hour — Colab, RunPod, Lambda), training curves, and failure modes.</p>
<p>This level teaches the concepts through both lenses, and the project gate offers both paths. Either way, the workflow is identical — and it's mostly NOT training:</p>
<ol>
<li><strong>Build the dataset</strong> (the majority of the work — next chapter)</li>
<li><strong>Establish baselines</strong> — eval the base model + best prompt first; this is the bar to beat</li>
<li><strong>Train</strong> (the easy part, honestly)</li>
<li><strong>Evaluate against the baseline</strong> — same test set, side by side</li>
<li><strong>Deploy and monitor</strong> — and keep dataset + training config versioned so you can reproduce it</li></ol>
<div class="callout tip"><div class="ct">Where the time really goes</div>Ask practitioners: ~70% data work, ~10% training, ~20% evaluation. Beginners budget the reverse and produce models that are confidently, reproducibly mediocre. The dataset IS the product.</div>`,
quiz:[
{q:"Where does most of the effort in a fine-tuning project actually go?",o:["GPU configuration","Dataset construction and evaluation — training itself is the small part","Choosing the learning rate"],a:1,e:"Training is a solved, push-button step. Data quality and honest evaluation are where projects are won or lost."},
{q:"Why establish a base-model-plus-best-prompt baseline BEFORE fine-tuning?",o:["Politeness to the base model","Without it you can't know if fine-tuning helped — and often the baseline turns out good enough to skip fine-tuning entirely","Providers require it"],a:1,e:"The baseline is the bar. Sometimes it clears your quality target and saves you the whole project — the cheapest possible win."}]}
]},
{title:"Dataset engineering",lessons:[
{id:"l4b1",t:"Your dataset is your product",min:5,body:`
<p>Fine-tuning data is (input → ideal output) pairs, formatted as conversations:</p>
<pre><code>{"messages": [
  {"role": "system", "content": "You are MedSummarize, converting clinical notes to patient-friendly summaries."},
  {"role": "user", "content": "Pt presents w/ acute exacerbation of COPD..."},
  {"role": "assistant", "content": "Your visit summary: Your chronic lung condition flared up..."}
]}</code></pre>
<p>One pattern per line (JSONL format), a few hundred to tens of thousands of lines. The brutal truth: <strong>the model becomes your dataset.</strong> Every quirk, error, and bias in those assistant responses gets amplified into permanent behavior. Hence the laws of data quality:</p>
<ul>
<li><strong>Quality crushes quantity</strong> — 500 excellent, consistent examples beat 50,000 scraped mediocre ones. (Famous result: LIMA reached near-GPT-quality instruction-following with ~1,000 hand-curated examples.)</li>
<li><strong>The outputs must be what you WANT, not what you have</strong> — your historical support replies include your worst agents on their worst days. Curate, don't dump.</li>
<li><strong>Consistency is invisible and decisive</strong> — if half your examples use bullet points and half don't, the model learns to coin-flip. Style-guide your data like you'd style-guide a brand.</li>
<li><strong>Diversity covers reality</strong> — include the edge cases, hostile inputs, and ambiguous requests the model will actually face — with the responses you want for them (including "the right way to refuse")</li></ul>
<p>Sources, in order of typical quality: experts writing examples (gold, expensive) → curated+cleaned production logs (great, common) → synthetic generation (scalable, next lesson) → public datasets (fine for generic capability, useless for your special sauce).</p>`,
quiz:[
{q:"You have 50,000 raw historical support replies. What's the right move before fine-tuning on them?",o:["Train on all of them — more data is better","Curate hard: filter to genuinely excellent responses, enforce style consistency, cover edge cases — even if only 2,000 survive","Use them as-is but train twice as long"],a:1,e:"The model becomes the dataset, bad examples included. 2,000 excellent consistent examples beat 50,000 mixed ones — quality compounds, garbage amplifies."},
{q:"Why must hostile/ambiguous inputs appear in your training data?",o:["To toughen the model emotionally","The model will face them in production, and the dataset is where you define the RIGHT response (including good refusals)","Regulators require it"],a:1,e:"Anything absent from training is left to chance at inference. Edge-case behavior is designed in the dataset, not hoped for."}]},
{id:"l4b2",t:"Synthetic data: models teaching models",min:5,body:`
<p>The clever escape from data scarcity: use a strong LLM to <em>generate</em> training examples for your fine-tune. Synthetic data now powers much of open-model post-training, and the workflow is very learnable:</p>
<ol>
<li><strong>Seed</strong> — gather what you have: 50 real examples, your docs, a style guide, a task description</li>
<li><strong>Generate at scale</strong> — prompt a frontier model: "Here are 5 example (question → ideal answer) pairs and our style guide. Generate 50 more covering [topic list], varying difficulty and phrasing."</li>
<li><strong>Force diversity deliberately</strong> — vary personas, topics, lengths, difficulty in your generation prompts. Naive generation produces samey data; taxonomy-driven generation (loop over a topic × difficulty × persona grid) produces coverage.</li>
<li><strong>Filter ruthlessly</strong> — generate 3×, keep the best third: dedupe near-identical items, drop too-easy/malformed ones, use an [[llm-as-judge]] to score each example against your rubric, spot-check by hand</li>
<li><strong>Distill</strong> — fine-tune your small model on the survivors. Big-model judgment at small-model prices: [[distillation]] in action.</li></ol>
<div class="callout warn"><div class="ct">Two traps</div><strong>Mode collapse:</strong> unfiltered synthetic data is repetitive and self-similar; models trained on it get blander and weaker at edges — diversity must be engineered in, not hoped for. <strong>Terms of service:</strong> some providers restrict using their outputs to train competing models; check before you build a business on it.</div>
<p>The pattern to remember: <strong>generation is cheap, curation is the value.</strong> The teams with great synthetic pipelines are really great at filtering.</p>`,
quiz:[
{q:"What's the biggest quality risk in synthetic training data?",o:["It costs too much","Low diversity — naive generation yields repetitive, samey examples, and models trained on them get blander","It's illegal everywhere"],a:1,e:"LLMs gravitate to their modal outputs. Without deliberate diversity engineering (taxonomies, personas, difficulty tiers) and aggressive filtering, you distill the blandness."},
{q:"What's the 'generate 3×, keep the best third' practice about?",o:["Tripling GPU usage for luck","Curation is where quality comes from — overgenerate, then filter hard with dedup, judges, and spot checks","Avoiding rate limits"],a:1,e:"Generation is cheap; selection is the value-add. Aggressive filtering is what separates useful synthetic data from noise."}]}
]},
{title:"Fine-tuning in practice",lessons:[
{id:"l4c1",t:"Why full fine-tuning is expensive: the memory math",min:5,body:`
<p>Why can't you fine-tune a 7B model on your laptop? Let's actually count, because this arithmetic explains the entire PEFT revolution. Training must hold, per [[parameter]]:</p>
<ul>
<li>The weight itself (2 bytes in 16-bit)</li>
<li>Its gradient — which way to nudge it (2 bytes)</li>
<li>Optimizer state — Adam keeps two running statistics (8 bytes in 32-bit)</li>
<li>Plus activations from the forward pass (depends on batch/sequence length)</li></ul>
<p>So full fine-tuning costs roughly <strong>12+ bytes per parameter</strong>: a 7B model needs ~84+ GB — beyond any single consumer GPU (24 GB) and even most single datacenter GPUs. A 70B model: ~840 GB, a multi-GPU cluster. Compare <em>inference</em>, which needs only the weights: ~14 GB for the same 7B model. <strong>Training is ~6× hungrier than inference.</strong></p>
<p>That gap is why parameter-efficient fine-tuning (PEFT) exists: what if you didn't have to update all the weights? Hold that thought for one lesson.</p>
<div class="callout"><div class="ct">Why you should bother with this math</div>This back-of-envelope skill — bytes per parameter × parameter count, for training vs. inference — instantly tells you what hardware any model needs, what's feasible on a rented GPU, and whether a vendor's claim is plausible. Level 6 builds heavily on exactly this kind of reasoning.</div>`,
quiz:[
{q:"Why does training need ~6× the memory of inference?",o:["Training uses bigger tokens","Beyond weights, training stores gradients and optimizer state per parameter, plus activations","Frameworks are inefficient"],a:1,e:"Weights (2B) + gradients (2B) + Adam states (8B) ≈ 12 bytes/parameter vs. ~2 for inference-only. This arithmetic is why full fine-tuning needs serious hardware — and why LoRA exists."},
{q:"Roughly how much memory does FULL fine-tuning of a 7B model need?",o:["~14 GB","~84+ GB","~1 GB"],a:1,e:"7B × ~12 bytes ≈ 84 GB before activations. Out of reach for consumer GPUs — which is exactly the problem PEFT solves."}]},
{id:"l4c2",t:"LoRA and QLoRA: fine-tuning for the rest of us",min:5,body:`
<p>[[lora|LoRA]] (Low-Rank Adaptation) rests on a lovely empirical fact: the <em>change</em> a fine-tune makes to weights is highly redundant — it can be captured by tiny low-rank matrices. So: <strong>freeze the entire base model</strong>, and inject small trainable "adapter" matrices alongside the big frozen ones. Train only those.</p>
<p>The numbers are absurd in the best way: adapters are typically <strong>&lt;1% of model parameters</strong>. No gradients or optimizer state for the frozen 99% — memory collapses from ~84 GB to roughly <em>weights + a little</em> (~16–18 GB for a 7B). Quality on typical adaptation tasks: usually within a whisker of full fine-tuning. The adapter saves as a tiny file (megabytes), and you can keep many adapters per base model — one per customer, per task, per style.</p>
<p>[[qlora|QLoRA]] stacks one more trick: load the frozen base in [[quantization|quantized]] 4-bit (the frozen weights don't need full precision — they're not being updated), train LoRA adapters in higher precision on top. A 7B fine-tune now fits in <strong>~6–8 GB</strong> — a free Colab GPU. This single technique democratized fine-tuning.</p>
<p>The knobs you'll see (sane defaults exist for all): rank r (adapter size; 8–64 typical), which layers get adapters (modern default: all linear layers), learning rate, and epochs (1–3; more usually just memorizes your data).</p>
<div class="callout tip"><div class="ct">Default to LoRA</div>For adaptation tasks (style, format, domain), LoRA/QLoRA is the professional default — full fine-tuning is reserved for deep capability changes with serious budgets. When the project gate offers local fine-tuning, this is what you'll run.</div>`,
quiz:[
{q:"Where do LoRA's massive memory savings come from?",o:["Compressing the training data","The base model is frozen — no gradients or optimizer state for 99%+ of parameters; only tiny adapters train","Skipping evaluation"],a:1,e:"Training overhead (gradients + optimizer state) applies only to trainable parameters. Shrink those to <1% and the overhead nearly vanishes."},
{q:"What extra trick does QLoRA add?",o:["Training multiple adapters at once","Loading the frozen base model in 4-bit quantization, since unchanging weights tolerate lower precision","Using a faster optimizer"],a:1,e:"Quantize what's frozen, keep adapters precise. A 7B fine-tune drops to ~6-8 GB — free-tier Colab territory. This is what put fine-tuning in everyone's hands."}]},
{id:"l4c3",t:"🧪 Lab: Run a real fine-tune",min:15,lab:true,body:`
<p>Concepts → keyboard. The OpenAI managed path is the gentlest first fine-tune; the lab is small enough to cost a few dollars at most.</p>
<h3>1. Pick a teachable behavior</h3>
<p>Choose something checkable, e.g.: <em>always answer with exactly three bullet points, each under 12 words, no intro or outro text.</em> (Style/format tasks are perfect first fine-tunes — easy to generate data for, easy to score.)</p>
<h3>2. Build the dataset (synthetic, like a pro)</h3>
<p>Write a script that loops 60 times: ask <code>gpt-4o-mini</code> for a random user question (vary topics with a list you rotate through), then generate the IDEAL three-bullet answer; write each as a JSONL line in the chat format from earlier. Manually review the file — fix or delete weak examples (curation!). Keep 50 for training, 10 aside for testing.</p>
<h3>3. Upload and train</h3>
<pre><code>from openai import OpenAI
client = OpenAI()
f = client.files.create(file=open("train.jsonl","rb"), purpose="fine-tune")
job = client.fine_tuning.jobs.create(training_file=f.id, model="gpt-4o-mini-2024-07-18")
# check progress:
client.fine_tuning.jobs.retrieve(job.id)    # status → succeeded, then note fine_tuned_model</code></pre>
<h3>4. Evaluate — the part that makes it engineering</h3>
<p>Adapt your Level 2 harness: run your 10 held-out test questions against (a) base model, (b) base model + your best instruction prompt, (c) your fine-tuned model with NO format instructions. Score each output with code: exactly 3 bullets? Each under 12 words? No extra text?</p>
<p>Typical finding — and the real lesson: the fine-tune follows format <em>without any prompt</em>, beating even instructed baselines on consistency. You've baked behavior into weights and proven it with numbers.</p>
<div class="callout tip"><div class="ct">Want the open-weights version?</div>Search "Unsloth fine-tuning notebook" — free Colab notebooks fine-tune Llama-class models with QLoRA in under an hour. Same workflow: data → train → eval. The project gate gives full credit for either path.</div>`,
quiz:[
{q:"Why hold 10 examples out of training?",o:["To save upload bandwidth","Testing on training data only proves memorization — held-out examples measure generalization","The API limits file size"],a:1,e:"The model has SEEN the training examples. Only unseen inputs reveal whether it learned the pattern versus memorized the instances. Sacred rule of all ML."},
{q:"What's the most meaningful comparison for your fine-tune?",o:["Fine-tuned model vs. nothing","Fine-tuned model (no prompt) vs. base model with your BEST instruction prompt — beat the cheap alternative, not a strawman","Fine-tuned model vs. a bigger base model"],a:1,e:"The honest baseline is the best you could do WITHOUT fine-tuning. If a one-line prompt matches your fine-tune, the fine-tune wasn't worth it."}]},
{id:"l4c4",t:"Preference alignment: DPO and friends",min:5,body:`
<p>[[sft|SFT]] teaches the model what good responses <em>look like</em>. But some qualities are easier to express as <em>comparisons</em> than examples: less sycophantic, more concise, more honest about uncertainty, our-brand-not-competitor tone. That's preference alignment — the second stage of post-training (Level 1, now from the builder's side).</p>
<p>Data shape: a prompt plus a <strong>chosen</strong> and a <strong>rejected</strong> response:</p>
<pre><code>{"prompt": "Is this rash serious?",
 "chosen": "I can't diagnose, but here's when a rash warrants seeing a doctor promptly: ...",
 "rejected": "It's probably nothing, don't worry about it!"}</code></pre>
<p>Methods, practically:</p>
<ul>
<li><strong>[[rlhf|RLHF]]</strong> — the original: train a separate reward model on preferences, then optimize the LLM against it with reinforcement learning. Powerful, finicky, infrastructure-heavy: frontier-lab territory.</li>
<li><strong>[[dpo|DPO]]</strong> — the practical default: a clever loss trains <em>directly</em> on (chosen, rejected) pairs. No reward model, no RL loop — runs wherever SFT runs (yes, with LoRA). This brought alignment to ordinary teams.</li></ul>
<p>The standard recipe, as used for virtually every modern open model: <strong>SFT first</strong> (teach the task) <strong>→ DPO second</strong> (refine judgment between plausible responses). Where do pairs come from? Human ratings of A/B outputs, production thumbs-up/down (gold!), or LLM-judged comparisons (synthetic preferences — same curation rules as before).</p>
<div class="callout warn"><div class="ct">Alignment is a double-edged sword</div>Push preferences carelessly and you create the pathologies from Level 1: optimize "users liked it" and you breed sycophancy; over-penalize risk and you breed useless over-refusal. Your preference data defines the trade-off — audit what it actually rewards before training on it.</div>`,
quiz:[
{q:"Why has DPO largely replaced RLHF outside frontier labs?",o:["It produces dramatically better models","It trains directly on preference pairs — no reward model, no RL infrastructure — at comparable quality for most uses","RLHF is now prohibited"],a:1,e:"DPO collapses RLHF's complex pipeline into a single supervised-style training run. Accessibility, not superiority, drove the takeover."},
{q:"When is preference data the right format (vs. SFT examples)?",o:["When you have too much data","When the target is a relative quality — less sycophantic, more concise — easier to express as 'A beats B' than as perfect examples","Never — SFT is always better"],a:1,e:"'Don't be sycophantic' is hard to demonstrate in isolated examples but trivial to encode as chosen-vs-rejected pairs. Comparisons capture subtle qualities."}]}
]}
],
project:{id:"l4gate",t:"Project Gate 4 — Fine-tune your own model, prove it's better",
body:`
<p>The complete professional fine-tuning workflow: dataset → baseline → train → honest evaluation. Choose your path:</p>
<p><strong>Path A (managed, simplest):</strong> OpenAI fine-tuning API, as in the lab — but bigger and yours.<br>
<strong>Path B (open weights, more learning):</strong> QLoRA on a Llama-class model via a free Colab GPU (search "Unsloth notebook" — the lab pointed the way).</p>
<h2>Requirements, either path</h2>
<h3>1. Pick a behavior you actually want</h3>
<p>Not the lab's toy — something you'd use: your writing voice for emails, a strict report format, a domain Q&A style, a code-review tone. It must be <em>scoreable</em>: write down 3 concrete criteria a good output satisfies BEFORE you build anything.</p>
<h3>2. Build a 100+ example dataset</h3>
<ul>
<li>Synthetic generation with deliberate diversity (topic × difficulty grid), seeded with any real examples you have</li>
<li>Curate: review every example (or judge-filter then spot-check); delete or fix the bottom slice</li>
<li>Hold out 15 examples for testing. Never let them near training.</li></ul>
<h3>3. Establish the baseline FIRST</h3>
<p>Eval harness scoring your 3 criteria (code checks where possible, LLM-judge where not) → run base model + your best prompt on the 15 test cases → record the score. This number is the bar.</p>
<h3>4. Train, evaluate, judge honestly</h3>
<ul>
<li>Run the fine-tune; eval it on the same 15 cases with the same harness</li>
<li>Compare three-way: base, base+best-prompt, fine-tuned</li>
<li>Write the verdict: did fine-tuning beat the best prompt? By how much? Was it worth it — would you ship it, and when would the per-call savings repay the training effort?</li></ul>
<p>A negative result with honest measurement is a PASS for this gate. "We measured; prompting was sufficient" is a professional conclusion that saves real companies real money — and proves you've escaped demo-land for good.</p>`,
checklist:[
"I defined a target behavior with 3 concrete, scoreable criteria before building",
"I built and curated a 100+ example dataset with deliberate diversity, holding out 15 test cases",
"I recorded the base-model + best-prompt baseline score BEFORE training",
"I completed a fine-tuning run (managed API or QLoRA on Colab)",
"I ran the three-way comparison (base / base+prompt / fine-tuned) on held-out cases",
"I wrote an honest verdict on whether the fine-tune justified its cost"
]}
});
