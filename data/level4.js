window.COURSE_LEVELS = window.COURSE_LEVELS || [];
window.COURSE_LEVELS.push({
title:"Customizing Models",
sub:"When prompting isn't enough: dataset engineering, supervised fine-tuning, LoRA, and preference alignment - changing what the model IS.",
chapters:[
{title:"The decision",lessons:[
{id:"l4a1",t:"To fine-tune or not to fine-tune",min:5,body:`
<p>[[fine-tuning|Fine-tuning]] continues training an existing model on your own examples, actually changing its [[weight|weights]]. It's the most powerful adaptation tool - and the most overprescribed. The decision framework, sharpened from Level 1's ladder:</p>
<p><strong>Fine-tuning is the right tool when:</strong></p>
<ul>
<li><strong>Behavior won't stick via prompting</strong> - you need a consistent voice, exact format, or domain-specific style across thousands of outputs, and your measured prompt-engineering ceiling is too low</li>
<li><strong>You're distilling for economics</strong> - a small fine-tuned model matches a frontier model on YOUR narrow task at 1/20th the inference cost. (This is the most common commercially-sound reason.)</li>
<li><strong>The domain is genuinely alien</strong> - specialized jargon and conventions (legal, medical, your codebase) that base models handle clumsily</li>
<li><strong>Prompts have become monsters</strong> - 4,000 tokens of instructions+examples re-billed on every call can be baked into weights instead</li></ul>
<p><strong>It's the wrong tool when:</strong></p>
<ul>
<li><strong>The problem is knowledge</strong> - facts go stale and fine-tuning teaches style far better than it stores facts; that's RAG's job. (The #1 misuse.)</li>
<li><strong>You have no eval</strong> - without a test set, you literally cannot know whether the fine-tune helped. Eval first, always.</li>
<li><strong>You have under ~100 quality examples</strong> - below that, few-shot prompting usually wins anyway</li>
<li><strong>You haven't maxed out prompting</strong> - a day of prompt work is cheaper than the cheapest fine-tune</li></ul>
<div class="callout"><div class="ct">The honest sequence</div>Prompt → measure → RAG (if knowledge) → measure → fine-tune (if behavior still falls short) → measure. Teams that skip to fine-tuning usually buy a slower, costlier way to discover their prompt was the problem.</div>`,
quiz:[
{q:"PRODUCTION: Your support bot's answers on this week's new product catalog are outdated and wrong. The catalog changes every Monday. A teammate suggests 'just fine-tune weekly on the new docs'. Your setup has no current eval harness. What is the correct diagnosis and first move?",o:["Fine-tune weekly on the new docs - the model will reliably absorb each Monday's catalog into its weights and stay current","Paste the entire catalog into the system prompt every call - the model reads it fresh each time, so accuracy stays high regardless of size","Knowledge problem: fresh facts belong in RAG (update the index nightly). Fine-tuning teaches style/behavior, not a database; without evals you can't even know if it helped. Build the eval + RAG update first."],a:2,e:"Mental model: RAG decouples knowledge from weights (facts stale → update store). Common mistake: using fine-tune for transient knowledge. Check this question: always measure baseline prompt/RAG before any fine-tune; the catalog case is the textbook misuse."},
{q:"SCENARIO: Your 50k-log fine-tune run after 3 weeks of LoRA gave +3% on internal metric vs the untuned frontier. No strong prompt baseline was measured. Production traffic will be 100k calls/day. What's the likely next reality per the lesson?",o:["Ship immediately - a +3% lift over the untuned frontier model is a clear, decision-ready win at any production volume","You probably still need the skipped data work (curation/hard negatives) or the prompt baseline may have matched or beaten it; at volume the real question is whether the cheaper small model clears your full eval + cost bar","The +3% gain will compound as traffic scales to 100k calls/day, so the real lift in production will be substantially larger"],a:1,e:"Mental model: data >> training knobs; baseline first. Common mistake: declaring victory after one training run without the comparison. Check this question: before shipping fine-tune, show delta vs best prompt-only on held-out, and cost/latency at your scale."}]},
{id:"l4a2",t:"The fine-tuning landscape: APIs vs open weights",min:4,body:`
<p>Two roads, same destination:</p>
<p><strong>Managed fine-tuning (e.g. OpenAI's API):</strong> upload training examples in JSONL, the provider trains and hosts the result, you call it like any model. No GPUs, no infrastructure - but the model stays theirs, you tune limited knobs, and per-token prices for fine-tuned models run higher.</p>
<p><strong>Open-weights fine-tuning (Llama, Mistral, Qwen + libraries like Hugging Face TRL, Axolotl, Unsloth):</strong> you control everything - method, data privacy, where it runs, what it costs to serve. The price: it's real ML engineering, with GPUs (rented by the hour - Colab, RunPod, Lambda), training curves, and failure modes.</p>
<p>This level teaches the concepts through both lenses, and the project gate offers both paths. Either way, the workflow is identical - and it's mostly NOT training:</p>
<ol>
<li><strong>Build the dataset</strong> (the majority of the work - next chapter)</li>
<li><strong>Establish baselines</strong> - eval the base model + best prompt first; this is the bar to beat</li>
<li><strong>Train</strong> (the easy part, honestly)</li>
<li><strong>Evaluate against the baseline</strong> - same test set, side by side</li>
<li><strong>Deploy and monitor</strong> - and keep dataset + training config versioned so you can reproduce it</li></ol>
<div class="callout tip"><div class="ct">Where the time really goes</div>Ask practitioners: ~70% data work, ~10% training, ~20% evaluation. Beginners budget the reverse and produce models that are confidently, reproducibly mediocre. The dataset IS the product.</div>`,
quiz:[
{q:"Your team spent 3 weeks on LoRA training runs and got a 3% lift on the internal eval. The dataset was 50k raw logs with minimal filtering. What does the lesson predict about next steps?",o:["Ship it - a 3% lift on the internal eval clears the bar, so the dataset and training choices were already good enough","Run the training job longer with more epochs on the same 50k logs; the extra passes will extract a much larger lift from the data","The real work was skipped: curation, hard-example mining, and rigorous eval against a strong prompt baseline. Most effort belongs in the data, not the training job; you likely still need to do the data work to see real gains or decide fine-tuning wasn't needed"],a:2,e:"Mental model: training knobs are easy; the model is the data. Common mistake: declaring victory after the first training run. Check this question: before declaring fine-tuning success, show the delta vs your best prompt-only baseline on a held-out set."},
{q:"Why establish a base-model-plus-best-prompt baseline BEFORE fine-tuning?",o:["Fine-tuning providers require a documented base-model baseline before they will accept and run your training job","Without it you can't know if fine-tuning helped - and often the baseline turns out good enough to skip fine-tuning entirely","It warms up the base model's weights so the subsequent fine-tuning run converges faster and reaches a higher final score"],a:1,e:"The baseline is the bar. Sometimes it clears your quality target and saves you the whole project - the cheapest possible win."}]}
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
<li><strong>Quality crushes quantity</strong> - 500 excellent, consistent examples beat 50,000 scraped mediocre ones. (Famous result: LIMA reached near-GPT-quality instruction-following with ~1,000 hand-curated examples.)</li>
<li><strong>The outputs must be what you WANT, not what you have</strong> - your historical support replies include your worst agents on their worst days. Curate, don't dump.</li>
<li><strong>Consistency is invisible and decisive</strong> - if half your examples use bullet points and half don't, the model learns to coin-flip. Style-guide your data like you'd style-guide a brand.</li>
<li><strong>Diversity covers reality</strong> - include the edge cases, hostile inputs, and ambiguous requests the model will actually face - with the responses you want for them (including "the right way to refuse")</li></ul>
<p>Sources, in order of typical quality: experts writing examples (gold, expensive) → curated+cleaned production logs (great, common) → synthetic generation (scalable, next lesson) → public datasets (fine for generic capability, useless for your special sauce).</p>`,
quiz:[
{q:"FIX THIS DATA FOR YOUR TWIN: You have 50k raw historical support logs. Plan: dump them into fine-tune for voice Twin. What is the correct first step per dataset lesson?",o:["Train on all 50k logs as-is - the larger the dataset, the better the Twin learns your voice, and volume averages out any bad replies","Feed the raw logs in unfiltered and trust the model to average across them, so the occasional weak reply gets washed out by the majority","Curate ruthlessly: keep only excellent consistent responses, enforce style guide, deliberately include edge/hostile cases (even if only ~2k survive) - the model becomes exactly its training outputs"],a:2,e:"Mental model: fine-tune data (L4b1) is the product. Common mistake: quantity over quality. Check this question: bad historical replies get baked into permanent Twin behavior; curate like you would brand guidelines."},
{q:"SCENARIO: Your Twin voice fine-tune data contains only clean polite exchanges. In prod a user is hostile + asks for private info leak. Model complies or hallucinates. Root cause per this lesson?",o:["Hostile/ambiguous/edge cases were absent from data, so no learned correct response (e.g. refusal + privacy guard) was installed; dataset designs the behavior distribution","The base model is misaligned by default, and fine-tuning on polite exchanges can't override its built-in tendency to comply with hostile requests","The failure is purely a system-prompt problem - a stronger safety instruction at inference time would have stopped the leak regardless of the training data"],a:0,e:"Mental model: the dataset (not prompt) teaches desired responses to real inputs. Common mistake: train on happy path only. Check this question: diversity and coverage in L4 data directly determine robustness of your voice Twin later used in L5 multi-agent."}]},
{id:"l4b2",t:"Synthetic data: models teaching models",min:5,body:`
<p>The clever escape from data scarcity: use a strong LLM to <em>generate</em> training examples for your fine-tune. Synthetic data now powers much of open-model post-training, and the workflow is very learnable:</p>
<ol>
<li><strong>Seed</strong> - gather what you have: 50 real examples, your docs, a style guide, a task description</li>
<li><strong>Generate at scale</strong> - prompt a frontier model: "Here are 5 example (question → ideal answer) pairs and our style guide. Generate 50 more covering [topic list], varying difficulty and phrasing."</li>
<li><strong>Force diversity deliberately</strong> - vary personas, topics, lengths, difficulty in your generation prompts. Naive generation produces samey data; taxonomy-driven generation (loop over a topic × difficulty × persona grid) produces coverage.</li>
<li><strong>Filter ruthlessly</strong> - generate 3×, keep the best third: dedupe near-identical items, drop too-easy/malformed ones, use an [[llm-as-judge]] to score each example against your rubric, spot-check by hand</li>
<li><strong>Distill</strong> - fine-tune your small model on the survivors. Big-model judgment at small-model prices: [[distillation]] in action.</li></ol>
<div class="callout warn"><div class="ct">Two traps</div><strong>Mode collapse:</strong> unfiltered synthetic data is repetitive and self-similar; models trained on it get blander and weaker at edges - diversity must be engineered in, not hoped for. <strong>Terms of service:</strong> some providers restrict using their outputs to train competing models; check before you build a business on it.</div>
<p>The pattern to remember: <strong>generation is cheap, curation is the value.</strong> The teams with great synthetic pipelines are really great at filtering.</p>`,
quiz:[
{q:"What's the biggest quality risk in synthetic training data?",o:["It costs too much - generating examples with a frontier model is far more expensive than paying experts to hand-write them","It's illegal everywhere - every provider's terms of service forbid using model outputs to train any other model, with no exceptions","Low diversity - naive generation yields repetitive, samey examples, and models trained on them get blander"],a:2,e:"LLMs gravitate to their modal outputs. Without deliberate diversity engineering (taxonomies, personas, difficulty tiers) and aggressive filtering, you distill the blandness."},
{q:"What's the 'generate 3×, keep the best third' practice about?",o:["Generating each example three times and majority-voting on the answer corrects factual errors the model would otherwise bake in","Curation is where quality comes from - overgenerate, then filter hard with dedup, judges, and spot checks","Spreading generation across three runs avoids hitting the provider's rate limits, letting you build a larger dataset faster"],a:1,e:"Generation is cheap; selection is the value-add. Aggressive filtering is what separates useful synthetic data from noise."}]},
{id:"l4b3",t:"Where data comes from - and why you must look at it",min:6,src:"AIE ch.8 §Dataset Engineering",body:`
<p>Beyond "curate hard" and "generate synthetically," dataset engineering has a few disciplines that separate amateurs from professionals. The first: knowing your acquisition options and their trade-offs.</p>
<h2>Acquisition: the menu</h2>
<ul>
<li><strong>Experts write examples</strong> - gold standard, slowest and priciest. Worth it for the hardest, highest-value behaviors.</li>
<li><strong>Curated production logs</strong> - your real inputs paired with corrected/approved outputs. Realistic and common; the work is the curation.</li>
<li><strong>Synthetic generation</strong> - scalable, cheap, needs heavy filtering (last lesson).</li>
<li><strong>Public datasets</strong> - fine for generic capability, useless for your special sauce, and watch the license.</li></ul>
<h2>Annotation: harder than it looks for open-ended tasks</h2>
<p>Labeling "spam / not spam" is easy. Labeling open-ended outputs - "is this summary good?" - is genuinely hard, because reasonable people disagree. The professional moves: write a <strong>precise annotation guideline</strong> (with examples of good/bad and edge cases), measure <strong>inter-annotator agreement</strong> (if two labelers rarely agree, your task definition is broken, not your labelers), and treat ambiguous cases as a signal to sharpen the guideline. Vague instructions produce inconsistent labels, and inconsistent labels train a coin-flipping model.</p>
<h2>The discipline nobody brags about: look at your data</h2>
<p>The highest-ROI habit in all of dataset engineering is the least glamorous: <strong>actually read your examples.</strong> Sit down and read 50-100 of them, by hand. You will find mislabeled examples, formatting drift, duplicates, a topic that's secretly 40% of your data, and outputs you'd be embarrassed to ship. Every serious practitioner does this; every disappointing fine-tune skipped it. Aggregate metrics hide the rot - your eyes don't.</p>
<div class="callout tip"><div class="ct">Data work is the job</div>It's tempting to treat data as setup and training as the "real" work. It's the reverse. The model is a mirror of its data, so the leverage is in the data: better examples, cleaner labels, honest inspection. A mediocre method on great data beats a great method on mediocre data, almost every time.</div>`,
quiz:[
{q:"Two annotators labeling your summaries rarely agree with each other. What does that most likely mean?",o:["One annotator is lazy or careless and should be replaced before you trust any of the labels they produced","Your task definition / annotation guideline is ambiguous - fix the instructions before blaming the labelers","The model under evaluation is broken, since disagreement on its outputs reflects inconsistency in what the model generated"],a:1,e:"Low inter-annotator agreement is usually a definition problem, not a people problem. If humans can't agree on 'good,' the model can't learn it. Sharpen the guideline with examples and edge cases."},
{q:"What's the single highest-ROI habit when preparing a fine-tuning dataset?",o:["Manually reading 50-100 of your actual examples to catch mislabels, drift, duplicates, and embarrassing outputs","Generating as many examples as possible, since more data reliably outweighs the noise from a few low-quality records","Picking a higher learning rate so the model absorbs your dataset's patterns faster and reaches a stronger final result"],a:0,e:"Reading your data by hand surfaces problems aggregate stats hide - and the model becomes whatever those examples are. The least glamorous habit has the biggest payoff."}]},
{id:"l4b4",t:"The data-collection pipeline: from raw sources to a clean dataset",min:6,src:"LEH ch.3 §Data Engineering",body:`
<p>For the LLM Twin - and most real projects - your data doesn't arrive as a tidy JSONL. It's scattered across blog posts, exports, documents, APIs. Turning that mess into a training set is a <strong>[[data pipeline]]</strong>, and the <em>LLM Engineer's Handbook</em> treats it as a first-class engineering stage, not a one-off script. (Notice the echo of the RAG feature pipeline - same discipline, different output.)</p>
<h2>The stages</h2>
<ol>
<li><strong>Collect raw data.</strong> Pull from sources: <strong>[[web scraping]]</strong> for public pages (respect robots.txt, terms of service, and the law), <strong>APIs</strong> for platforms that offer them (cleaner and more stable than scraping), exports (your Notion, your posts), and files. For the Twin, this is gathering everything you've written.</li>
<li><strong>Clean.</strong> Strip HTML/markup, boilerplate, navigation, ads, signatures; fix encoding; drop near-empty or junk items. Garbage here becomes garbage the model imitates.</li>
<li><strong>Standardize.</strong> Convert everything into one consistent schema - a uniform record per item (text + metadata like source, date, author). Now downstream steps don't care where each piece came from.</li>
<li><strong>Deduplicate &amp; decontaminate.</strong> Remove duplicates and near-duplicates (they over-weight repeated content and waste compute), and run <strong>[[data decontamination]]</strong> - make sure nothing in training overlaps your eval/test set, or your scores become memorization.</li>
<li><strong>Store.</strong> Save the clean, standardized dataset (a versioned file or a data store) so the next stage - building instruction/preference examples - starts from something trustworthy and reproducible.</li></ol>
<div class="callout warn"><div class="ct">Scraping responsibly</div>Just because data is reachable doesn't mean it's yours to use. Check terms of service and licensing, respect robots.txt and rate limits, avoid personal data you have no right to, and prefer official APIs when they exist. "We scraped it" has ended in lawsuits; building a product on shaky data rights is building on sand.</div>`,
quiz:[
{q:"Why standardize all collected data into one schema before building training examples?",o:["It compresses the data into a smaller footprint, cutting storage costs and speeding up the later training and eval stages","Fine-tuning libraries reject records that aren't in one canonical schema, so standardizing is a hard requirement to train at all","So downstream steps work uniformly regardless of source, making the pipeline repeatable and the data trustworthy"],a:2,e:"A uniform record (text + metadata) decouples 'where it came from' from 'what we do next.' That's what turns a pile of sources into a reproducible dataset pipeline."},
{q:"What is data decontamination, and why does it matter for fine-tuning?",o:["Stripping toxic, biased, or unsafe language from the training set so the fine-tuned model doesn't reproduce harmful content","Ensuring training data doesn't overlap your eval/test set, so your scores reflect real ability rather than memorization","Encrypting the dataset at rest and in transit so private records can't leak during the training and storage stages"],a:1,e:"If test examples leak into training, the model memorizes them and your eval lies to you (the contamination problem from Level 2, self-inflicted). Decontamination keeps evaluation honest."}]}
]},
{title:"Fine-tuning in practice",lessons:[
{id:"l4c1",t:"Why full fine-tuning is expensive: the memory math",min:5,body:`
<p>Why can't you fine-tune a 7B model on your laptop? Let's actually count, because this arithmetic explains the entire PEFT revolution. Training must hold, per [[parameter]]:</p>
<ul>
<li>The weight itself (2 bytes in 16-bit)</li>
<li>Its gradient - which way to nudge it (2 bytes)</li>
<li>Optimizer state - Adam keeps two running statistics (8 bytes in 32-bit)</li>
<li>Plus activations from the forward pass (depends on batch/sequence length)</li></ul>
<p>So full fine-tuning costs roughly <strong>12+ bytes per parameter</strong>: a 7B model needs ~84+ GB - beyond any single consumer GPU (24 GB) and even most single datacenter GPUs. A 70B model: ~840 GB, a multi-GPU cluster. Compare <em>inference</em>, which needs only the weights: ~14 GB for the same 7B model. <strong>Training is ~6× hungrier than inference.</strong></p>
<p>That gap is why parameter-efficient fine-tuning (PEFT) exists: what if you didn't have to update all the weights? Hold that thought for one lesson.</p>
<div class="callout"><div class="ct">Why you should bother with this math</div>This back-of-envelope skill - bytes per parameter × parameter count, for training vs. inference - instantly tells you what hardware any model needs, what's feasible on a rented GPU, and whether a vendor's claim is plausible. Level 6 builds heavily on exactly this kind of reasoning.</div>`,
quiz:[
{q:"Why does training need ~6× the memory of inference?",o:["Beyond weights, training stores gradients and optimizer state per parameter, plus activations","Training processes longer sequences and bigger token batches, and that larger input is what consumes the extra memory","Training frameworks are simply less memory-efficient than inference servers, so the same model uses far more RAM"],a:0,e:"Weights (2B) + gradients (2B) + Adam states (8B) ≈ 12 bytes/parameter vs. ~2 for inference-only. This arithmetic is why full fine-tuning needs serious hardware - and why LoRA exists."},
{q:"Roughly how much memory does FULL fine-tuning of a 7B model need?",o:["~14 GB - fine-tuning needs only the weights in memory, so a 7B model fits on a single consumer GPU","~1 GB - with quantization the whole training process compresses down to roughly one byte per parameter","~84+ GB"],a:2,e:"7B × ~12 bytes ≈ 84 GB before activations. Out of reach for consumer GPUs - which is exactly the problem PEFT solves."}],
videos:[{title:"Andrej Karpathy - Let's build GPT: from scratch, in code (challenge material)",url:"https://www.youtube.com/watch?v=kCc8FmEb1nY",why:"THE video for seeing training mechanics - gradients, loss, attention - built in real code. Ambitious; treat it as a stretch goal you return to."}]},
{id:"l4c2",t:"LoRA and QLoRA: fine-tuning for the rest of us",min:5,body:`
<p>[[lora|LoRA]] (Low-Rank Adaptation) rests on a lovely empirical fact: the <em>change</em> a fine-tune makes to weights is highly redundant - it can be captured by tiny low-rank matrices. So: <strong>freeze the entire base model</strong>, and inject small trainable "adapter" matrices alongside the big frozen ones. Train only those.</p>
<p>The numbers are absurd in the best way: adapters are typically <strong>&lt;1% of model parameters</strong>. No gradients or optimizer state for the frozen 99% - memory collapses from ~84 GB to roughly <em>weights + a little</em> (~16-18 GB for a 7B). Quality on typical adaptation tasks: usually within a whisker of full fine-tuning. The adapter saves as a tiny file (megabytes), and you can keep many adapters per base model - one per customer, per task, per style.</p>
<p>[[qlora|QLoRA]] stacks one more trick: load the frozen base in [[quantization|quantized]] 4-bit (the frozen weights don't need full precision - they're not being updated), train LoRA adapters in higher precision on top. A 7B fine-tune now fits in <strong>~6-8 GB</strong> - a free Colab GPU. This single technique democratized fine-tuning.</p>
<p>The knobs you'll see (sane defaults exist for all): rank r (adapter size; 8-64 typical), which layers get adapters (modern default: all linear layers), learning rate, and epochs (1-3; more usually just memorizes your data).</p>
<div class="callout tip"><div class="ct">Default to LoRA</div>For adaptation tasks (style, format, domain), LoRA/QLoRA is the professional default - full fine-tuning is reserved for deep capability changes with serious budgets. When the project gate offers local fine-tuning, this is what you'll run.</div>`,
quiz:[
{q:"Where do LoRA's massive memory savings come from?",o:["LoRA compresses the training dataset into a compact form so far fewer examples need to be held in memory during training","The base model is frozen - no gradients or optimizer state for 99%+ of parameters; only tiny adapters train","LoRA skips the evaluation and activation-caching steps that consume most of full fine-tuning's memory budget"],a:1,e:"Training overhead (gradients + optimizer state) applies only to trainable parameters. Shrink those to <1% and the overhead nearly vanishes."},
{q:"What extra trick does QLoRA add?",o:["Loading the frozen base model in 4-bit quantization, since unchanging weights tolerate lower precision","Training multiple LoRA adapters at once and merging them, so one run covers several tasks for the price of one","Swapping in a faster, lighter optimizer that needs far less state per parameter than Adam during training"],a:0,e:"Quantize what's frozen, keep adapters precise. A 7B fine-tune drops to ~6-8 GB - free-tier Colab territory. This is what put fine-tuning in everyone's hands."}],
videos:[{title:"Umar Jamil - LoRA: Low-Rank Adaptation, explained visually + PyTorch from scratch",url:"https://www.youtube.com/watch?v=PXWYUTMt-AU",why:"Exactly why low-rank adapters work, with the math made visual and then coded. The clearest LoRA explainer going."}]},
{id:"l4c3",t:"🧪 Lab: Run a real fine-tune",min:15,lab:true,body:`
<p>Concepts → keyboard. The OpenAI managed path is the gentlest first fine-tune; the lab is small enough to cost a few dollars at most.</p>
<h3>1. Pick a teachable behavior</h3>
<p>Choose something checkable, e.g.: <em>always answer with exactly three bullet points, each under 12 words, no intro or outro text.</em> (Style/format tasks are perfect first fine-tunes - easy to generate data for, easy to score.)</p>
<h3>2. Build the dataset (synthetic, like a pro)</h3>
<p>Write a script that loops 60 times: ask <code>gpt-4o-mini</code> for a random user question (vary topics with a list you rotate through), then generate the IDEAL three-bullet answer; write each as a JSONL line in the chat format from earlier. Manually review the file - fix or delete weak examples (curation!). Keep 50 for training, 10 aside for testing.</p>
<h3>3. Upload and train</h3>
<pre><code>from openai import OpenAI
client = OpenAI()
f = client.files.create(file=open("train.jsonl","rb"), purpose="fine-tune")
job = client.fine_tuning.jobs.create(training_file=f.id, model="gpt-4o-mini-2024-07-18")
# check progress:
client.fine_tuning.jobs.retrieve(job.id)    # status → succeeded, then note fine_tuned_model</code></pre>
<h3>4. Evaluate - the part that makes it engineering</h3>
<p>Adapt your Level 2 harness: run your 10 held-out test questions against (a) base model, (b) base model + your best instruction prompt, (c) your fine-tuned model with NO format instructions. Score each output with code: exactly 3 bullets? Each under 12 words? No extra text?</p>
<p>Typical finding - and the real lesson: the fine-tune follows format <em>without any prompt</em>, beating even instructed baselines on consistency. You've baked behavior into weights and proven it with numbers.</p>
<div class="callout tip"><div class="ct">Want the open-weights version?</div>Search "Unsloth fine-tuning notebook" - free Colab notebooks fine-tune Llama-class models with QLoRA in under an hour. Same workflow: data → train → eval. The project gate gives full credit for either path.</div>`,
quiz:[
{q:"Why hold 10 examples out of training?",o:["To save upload bandwidth and keep the training file small enough to upload quickly to the fine-tuning API","The fine-tuning API caps the number of examples per training file, so you must set some aside to stay under the limit","Testing on training data only proves memorization - held-out examples measure generalization"],a:2,e:"The model has SEEN the training examples. Only unseen inputs reveal whether it learned the pattern versus memorized the instances. Sacred rule of all ML."},
{q:"What's the most meaningful comparison for your fine-tune?",o:["Fine-tuned model (no prompt) vs. base model with your BEST instruction prompt - beat the cheap alternative, not a strawman","Fine-tuned model vs. the raw base model with no prompt at all, since that shows the full gain training delivered","Fine-tuned model vs. a much larger base model, to prove your small tuned model can rival a frontier-scale one"],a:0,e:"The honest baseline is the best you could do WITHOUT fine-tuning. If a one-line prompt matches your fine-tune, the fine-tune wasn't worth it."}]},
{id:"l4c4",t:"Preference alignment: DPO and friends",min:5,body:`
<p>[[sft|SFT]] teaches the model what good responses <em>look like</em>. But some qualities are easier to express as <em>comparisons</em> than examples: less sycophantic, more concise, more honest about uncertainty, our-brand-not-competitor tone. That's preference alignment - the second stage of post-training (Level 1, now from the builder's side).</p>
<p>Data shape: a prompt plus a <strong>chosen</strong> and a <strong>rejected</strong> response:</p>
<pre><code>{"prompt": "Is this rash serious?",
 "chosen": "I can't diagnose, but here's when a rash warrants seeing a doctor promptly: ...",
 "rejected": "It's probably nothing, don't worry about it!"}</code></pre>
<p>Methods, practically:</p>
<ul>
<li><strong>[[rlhf|RLHF]]</strong> - the original: train a separate [[reward model]] on preferences, then optimize the LLM against it with reinforcement learning. Powerful, finicky, infrastructure-heavy: frontier-lab territory.</li>
<li><strong>[[dpo|DPO]]</strong> - the practical default: a clever loss trains <em>directly</em> on (chosen, rejected) pairs. No reward model, no RL loop - runs wherever SFT runs (yes, with LoRA). This brought alignment to ordinary teams.</li></ul>
<p>The standard recipe, as used for virtually every modern open model: <strong>SFT first</strong> (teach the task) <strong>→ DPO second</strong> (refine judgment between plausible responses). Where do pairs come from? Human ratings of A/B outputs, production thumbs-up/down (gold!), or LLM-judged comparisons (synthetic preferences - same curation rules as before).</p>
<div class="callout warn"><div class="ct">Alignment is a double-edged sword</div>Push preferences carelessly and you create the pathologies from Level 1: optimize "users liked it" and you breed sycophancy; over-penalize risk and you breed useless over-refusal. Your preference data defines the trade-off - audit what it actually rewards before training on it.</div>`,
quiz:[
{q:"Why has DPO largely replaced RLHF outside frontier labs?",o:["It produces dramatically better-aligned models than RLHF, so labs switched purely for the higher final quality","RLHF has been prohibited for most teams due to safety regulations, leaving DPO as the only legally available option","It trains directly on preference pairs - no reward model, no RL infrastructure - at comparable quality for most uses"],a:2,e:"DPO collapses RLHF's complex pipeline into a single supervised-style training run. Accessibility, not superiority, drove the takeover."},
{q:"When is preference data the right format (vs. SFT examples)?",o:["When the target is a relative quality - less sycophantic, more concise - easier to express as 'A beats B' than as perfect examples","When you have too much data to label, since preference pairs need far fewer examples than SFT to teach a behavior","When you want to teach new factual knowledge, because chosen-vs-rejected pairs store facts more reliably than SFT examples"],a:0,e:"'Don't be sycophantic' is hard to demonstrate in isolated examples but trivial to encode as chosen-vs-rejected pairs. Comparisons capture subtle qualities."}]},
{id:"l4c5",t:"From raw text to a training-ready dataset: chat templates and packing",min:6,src:"LEH ch.5 §SFT · ch.6",body:`
<p>You have clean, standardized data. Two formatting details stand between you and a correct fine-tune - small, easy to get wrong, and quietly destructive when you do.</p>
<h2>Build the instruction examples</h2>
<p>An <strong>[[instruction dataset]]</strong> is (instruction → ideal response) pairs in the chat format you've seen. From raw material you create them by: turning documents into Q→A pairs (often synthetically, then curated), pairing real inputs with corrected outputs, or - for the Twin - generating questions your writing answers and using your actual text as the ideal response. For preference alignment, you instead build <strong>[[preference dataset|preference triples]]</strong>: same prompt, a <code>chosen</code> response (your-voice / better) and a <code>rejected</code> one (generic / worse).</p>
<h2>Use the model's chat template - exactly</h2>
<p>Every chat model was trained with a specific <strong>[[chat template]]</strong>: the precise special tokens and role markers that delimit system/user/assistant turns. When you fine-tune, you must format your examples with <em>that model's own template</em> (libraries expose <code>tokenizer.apply_chat_template(...)</code> for exactly this). Use the wrong format - or hand-roll your own - and the model trains on text that doesn't match how it will be prompted at inference, silently tanking quality. This is one of the most common "my fine-tune is mysteriously bad" bugs.</p>
<h2>Packing: don't pay for padding</h2>
<p>Training happens in fixed-length sequences. If your examples are short and you pad each to full length, most of the compute trains on meaningless padding tokens. <strong>[[sequence packing]]</strong> concatenates several short examples into one full sequence (with separators) so nearly every token is real. Same learning, often much faster and cheaper - many fine-tuning libraries turn it on with a flag. It doesn't change <em>what</em> the model learns, just how efficiently you spend GPU time.</p>
<div class="callout fail"><div class="ct">Why it breaks: the silent template mismatch</div>A team fine-tunes, evals look terrible, and they blame their data or the method. The real culprit: they formatted training examples with plain text or the wrong chat template, so the model never saw the role markers it expects at inference. Fix the template, and the same data and method suddenly work. Always format with the target model's own chat template.</div>`,
quiz:[
{q:"You fine-tuned a chat model and quality is mysteriously poor, though the data looks good. Likely culprit?",o:["The learning rate was set slightly too high, so the model overshot and washed out the patterns in your otherwise-good data","You formatted training examples with the wrong (or no) chat template, so training text didn't match the inference format","The GPU was too small, forcing a tiny batch size that made the gradients too noisy for the model to learn cleanly"],a:1,e:"Chat models expect their specific role-marker format. Train on the wrong template and you create a train/inference mismatch that quietly wrecks quality. Use tokenizer.apply_chat_template with the target model."},
{q:"What does sequence packing improve, and what does it NOT change?",o:["It improves training efficiency (fewer wasted padding tokens) without changing what the model learns","It improves accuracy by effectively adding more training signal, since each packed sequence exposes the model to more examples","It changes the model architecture to handle longer contexts, letting it attend across the concatenated examples at once"],a:0,e:"Packing concatenates short examples to avoid padding waste - a speed/cost win. The learning signal is the same; you're just not paying GPU time to process padding."}]},
{id:"l4c6",t:"Model merging: combining models without retraining",min:4,src:"AIE ch.7 §Finetuning",body:`
<p>A surprising, almost alchemical technique worth knowing exists: <strong>[[model merging]]</strong> - blending the <em>weights</em> of two or more models into one, with no further training. Because fine-tuned variants of the same base model live in compatible weight space, you can literally combine them.</p>
<p>What it's used for:</p>
<ul>
<li><strong>Combining skills</strong> - merge a model fine-tuned for coding with one fine-tuned for math, hoping to get one model decent at both (sometimes it works remarkably well).</li>
<li><strong>Averaging training runs</strong> - averaging several checkpoints or runs can yield a more robust model than any single one.</li>
<li><strong>Cheap experimentation</strong> - merging is seconds of arithmetic, not hours of GPU training, so you can try many blends.</li></ul>
<p>Techniques range from simple weight averaging to fancier recipes (task-vector arithmetic, TIES, DARE). You don't need the details now - just the mental model: fine-tunes of a shared base can be combined arithmetically, and a chunk of the open-model leaderboard is merged models.</p>
<div class="callout warn"><div class="ct">It's empirical, not guaranteed</div>Merging sometimes produces a model better than its parents, and sometimes a confused mush that's worse at everything. There's no guarantee. As always: a merge is a hypothesis, and your eval set is the only judge. Merge, then measure.</div>`,
quiz:[
{q:"What is model merging?",o:["Training two models jointly from scratch on a combined dataset so the single result inherits both sets of skills","Running two separate models at inference and averaging their output probabilities to get one blended response","Combining the weights of existing (usually same-base) models arithmetically into one, with no further training"],a:2,e:"Merging blends the weights themselves - cheap, training-free. (Averaging outputs at inference is a different thing called ensembling.) Fine-tunes of a shared base live in compatible weight space, so they can be combined."},
{q:"How should you decide whether a merged model is actually good?",o:["Run it through your eval set; merging is empirical and can produce a worse model, so measure before trusting","Trust the technique - because the parents share a base, the merged model is guaranteed to be at least as good as both","Check that the merged file is smaller than the parents, which confirms the weights combined cleanly without conflict"],a:0,e:"Merging is a hypothesis with no guarantee - it can beat the parents or muddle them. Only your evaluation on your task tells you which happened."}]}
]},
{title:"Evaluating customized models",lessons:[
{id:"l4d1",t:"Evaluating fine-tuned models: base vs SFT vs DPO",min:6,src:"LEH ch.7 §Evaluating LLMs",body:`
<p>You've trained a model. The whole point of this level - the reason fine-tuning is engineering and not vibes - is proving whether it's actually better. Evaluating a customized model has its own structure.</p>
<h2>Three altitudes of evaluation</h2>
<ul>
<li><strong>General capability</strong> - did fine-tuning <em>damage</em> the model's broad abilities? Narrow fine-tuning can cause "catastrophic forgetting" - your model gets great at your task and worse at everything else. A few general benchmark checks catch this regression.</li>
<li><strong>Domain</strong> - is it better across your whole subject area (your support topics, your writing themes), not just a couple of cases?</li>
<li><strong>Task-specific</strong> - does it nail the exact behavior you trained for, scored on your held-out test set? This is the one that decides whether to ship.</li></ul>
<h2>The comparison that matters: base vs SFT vs DPO</h2>
<p>Run the same held-out test set through each stage and read the deltas:</p>
<ul>
<li><strong>Base</strong> (+ your best prompt) - the bar to beat, from Level 2's discipline.</li>
<li><strong>After [[sft|SFT]]</strong> - did it learn the task/format/voice? Usually the big jump.</li>
<li><strong>After [[dpo|DPO]]</strong> - did preference alignment refine the subtle qualities (less sycophantic, more on-voice) without breaking what SFT taught?</li></ul>
<p>Score with the right tools from Level 2: objective checks where possible (format, keywords, functional), [[llm-as-judge]] with a rubric for nuanced quality, and [[pairwise comparison]] when you just need "is the tuned one better than base?" Watch for over-fitting: if it aces training-like cases but flops on slightly different held-out ones, it memorized instead of generalizing.</p>
<div class="callout"><div class="ct">Negative results are real results</div>The honest verdict might be "SFT helped, DPO didn't move the needle" or even "the base model plus a good prompt matched the fine-tune." Both are valuable professional conclusions that save money - and exactly the kind of measured judgment your Gate 4 (and the LLM Twin's Stage-2 evaluation) demands. The standard is evidence, not hope.</div>`,
quiz:[
{q:"After fine-tuning, your model is great at the target task but noticeably worse at general questions it used to handle. What happened?",o:["The API throttled it under load, so general queries return degraded answers while the trained task stays unaffected","Catastrophic forgetting - narrow fine-tuning degraded broad capability; checking a few general benchmarks catches this regression","It needs a DPO pass - only preference alignment can restore the general abilities that SFT temporarily suppressed"],a:1,e:"Over-narrow fine-tuning can erode general skills. That's why customized-model evaluation checks general capability too, not just the trained task - so you catch the trade-off you made."},
{q:"What's the most decision-relevant comparison when evaluating a fine-tune?",o:["Tuned model vs. base-model-with-your-best-prompt, on held-out cases - beating the cheap alternative is what justifies shipping","Tuned model vs. a random or untrained baseline, since a large delta there proves the fine-tune learned the task","Tuned model vs. a larger frontier model, to show your small tuned model can match a far more expensive one"],a:0,e:"The honest bar is the best you could do without fine-tuning. If a good prompt on the base model matches your fine-tune, the fine-tune didn't earn its cost - a real and useful conclusion."}]},
{id:"l4d2",t:"🧪 Lab: Verify a real fine-tune (Colab notebooks + proof)",min:14,lab:true,src:"LEH ch.5 §SFT · ch.7",colab:{
goal:"Run an open-weights fine-tune end to end on a free GPU using the course's three Colab notebooks (QLoRA SFT → DPO → eval), then paste the eval notebook's JSON output here to verify it. The JSON must report base_accuracy and tuned_accuracy.",
notebook:"notebooks/01_sft_qlora.ipynb",
verify:"json",
jsonKeys:["base_accuracy","tuned_accuracy"],
plausible:{base_accuracy:[0,1],tuned_accuracy:[0,1]}},
body:`
<p>The lab in the last chapter used the managed (OpenAI) path. This one runs the <strong>open-weights</strong> path - real QLoRA on a free GPU - using the three notebooks this course ships in its <code>notebooks/</code> folder. This is the LLM Twin's training engine, and it's the deepest hands-on ML in the course.</p>
<h2>The three notebooks</h2>
<ol>
<li><strong><code>01_sft_qlora.ipynb</code></strong> - loads a small model in 4-bit, attaches LoRA adapters, and fine-tunes on your <code>train.jsonl</code>. Watch the loss fall. Saves a tiny adapter.</li>
<li><strong><code>02_dpo.ipynb</code></strong> - takes preference triples (<code>prefs.jsonl</code>) and runs DPO on top of the SFT model. Watch reward accuracy climb.</li>
<li><strong><code>03_eval_base_vs_tuned.ipynb</code></strong> - scores the base model and your tuned model on the <em>same</em> held-out cases, then prints a JSON line with <code>base_accuracy</code> and <code>tuned_accuracy</code>.</li></ol>
<h2>How to run them</h2>
<ul>
<li>Open a notebook in <a href="https://colab.research.google.com" target="_blank" rel="noopener">Google Colab</a> (upload it, or use File → Upload notebook). Set <strong>Runtime → Change runtime type → T4 GPU</strong>.</li>
<li>Upload your <code>train.jsonl</code> (from Gate 4 / Twin) via the file panel. Run cells top to bottom; read each markdown note first.</li>
<li>Every code cell explains what it does and <em>what to watch</em> - especially the loss curve (should trend down) and DPO reward accuracy (should rise toward 1).</li></ul>
<h2>Verify</h2>
<p>Run notebook 3 to the end. It prints a single JSON line like <code>{"base_accuracy": 0.55, "tuned_accuracy": 0.80, "n_cases": 10}</code>. <strong>Copy that line and paste it below</strong> to verify the lab. The checker confirms it parses and reports both scores in a plausible range.</p>
<div class="callout tip"><div class="ct">This is the real thing</div>You loaded a quantized model, attached adapters, trained on a GPU, aligned with DPO, and measured base-vs-tuned with code - the exact workflow used to ship open-model fine-tunes. The managed API hides all of this; here you saw the machine. Honor system on the numbers, but the skill is yours.</div>`,
quiz:[
{q:"Notebook 3 prints base_accuracy and tuned_accuracy on the SAME held-out cases. Why is that comparison the point of the whole exercise?",o:["To make the notebook longer and demonstrate more of the eval library's features before you move on to deployment","Colab requires notebooks to print a JSON line at the end, so the two accuracy fields satisfy that output format","It's the evidence that fine-tuning actually changed task performance - measured on unseen cases, base vs tuned side by side"],a:2,e:"The numbers are the deliverable. Same test set, base vs tuned, on held-out cases: that delta is the honest proof that training helped (or didn't) - the core discipline of this level."},
{q:"In notebook 1, the training loss stays flat and never decreases. What's the most likely issue?",o:["The model is already perfect on this data, so there's no error left for the loss to decrease and the flat line is expected","Something is off - learning rate, data format/chat template, or dataset - a healthy run shows the loss trending down","Colab's free T4 GPU always reports a flat loss curve; you only see it fall on a paid high-memory runtime"],a:1,e:"A falling loss is the sign learning is happening. Flat loss points to a misconfiguration (LR too low, wrong chat template, broken data) - exactly the kind of signal the notebooks tell you to watch."}]}
]},
{title:"Twin Track - Stage 2",lessons:[
{id:"l4twin2",t:"🧪 Twin Stage 2: train your voice",min:14,lab:true,src:"LEH ch.5 §SFT · ch.6",body:`
<p>In Stage 1 you made your writing <em>retrievable</em>. Now make a model <em>sound like you</em>. This is the Twin's heart: turn your corpus into a training set, fine-tune a model on it (SFT), refine it toward your voice (DPO), and honestly test whether it worked.</p>
<h2>Step 1 - Generate an instruction dataset FROM your writing</h2>
<p>Use your <code>twin_data/</code> corpus to build (instruction → your-voice response) pairs. The synthetic recipe from this level, aimed at you:</p>
<ul>
<li>For passages you wrote, prompt a strong model: "Given this text I wrote, generate a question or instruction it would be the ideal answer to." Pair that instruction with your <em>actual</em> text as the assistant response - so the model learns your real voice, not a paraphrase.</li>
<li>Cover variety: different topics, lengths, and a few "write X in my style" instructions.</li>
<li><strong>Curate</strong> - read them, drop weak pairs, fix instructions. Aim for 100+ solid examples. Format with the model's chat template.</li></ul>
<h2>Step 2 - SFT (notebook 1)</h2>
<p>Run <code>01_sft_qlora.ipynb</code> on your <code>train.jsonl</code>. Watch the loss fall; save the adapter.</p>
<h2>Step 3 - A small DPO pass (notebook 2)</h2>
<p>Build a few dozen <strong>preference pairs</strong>: same prompt, <code>chosen</code> = your-voice answer, <code>rejected</code> = a generic-assistant answer (generate the bland version on purpose). Run <code>02_dpo.ipynb</code> to sharpen "sounds like me" vs "sounds like a chatbot."</p>
<h2>Step 4 - Does it actually sound like you?</h2>
<p>Two evals, both honest:</p>
<ul>
<li><strong>LLM-judge rubric</strong> - "Does this response match the voice in these reference samples [your real writing]? Score 1-5 on tone, vocabulary, structure." Run base vs SFT vs DPO (notebook 3 pattern).</li>
<li><strong>Your blind test</strong> - mix a few model outputs with a few of your real sentences and see if a friend (or you, later) can tell which is which. The ultimate Turing-ish check for a Twin.</li></ul>
<div class="callout"><div class="ct">Where the Twin stands now</div>You have a model fine-tuned on your own voice, measured against the base, with a real verdict. In Level 5 (Stage 3) you'll combine it with your Stage-1 retrieval and serve the whole thing behind your own deployed API - a personal AI that knows your writing and speaks in your voice, built entirely by you. Keep your dataset, adapter, and evals.</div>`,
quiz:[
{q:"Why pair generated instructions with your ACTUAL written text (not a paraphrase) as the response?",o:["It's faster to generate, since reusing your existing text skips the step of having the model rewrite each response","Paraphrases are against the fine-tuning rules, which require assistant responses to be verbatim source text","So the model learns your real voice from genuine examples; paraphrases would teach a watered-down version"],a:2,e:"The assistant responses become the model's voice. Using your authentic text trains your actual style; paraphrasing would dilute exactly the thing you're trying to capture."},
{q:"For the Twin's DPO pass, what makes a good (chosen, rejected) pair?",o:["chosen = your-voice answer, rejected = a deliberately generic chatbot-style answer to the same prompt","chosen = the longer, more detailed answer, rejected = the shorter one, so the Twin learns to write fuller responses","chosen = the factually correct answer, rejected = one with wrong facts, so the Twin learns to be more accurate"],a:0,e:"DPO refines the relative quality you care about: sounding like you. Contrasting your voice (chosen) against a generic version (rejected) teaches that preference directly - DPO's whole strength."}]}
]}
],
project:{id:"l4gate",t:"Project Gate 4 - Fine-tune your own model, prove it's better",
body:`
<p>The complete professional fine-tuning workflow: dataset → baseline → train → honest evaluation. Choose your path:</p>
<p><strong>Path A (managed, simplest):</strong> OpenAI fine-tuning API, as in the lab - but bigger and yours.<br>
<strong>Path B (open weights, more learning):</strong> QLoRA on a Llama-class model via a free Colab GPU (search "Unsloth notebook" - the lab pointed the way).</p>
<h2>Requirements, either path</h2>
<h3>1. Pick a behavior you actually want</h3>
<p>Not the lab's toy - something you'd use: your writing voice for emails, a strict report format, a domain Q&A style, a code-review tone. It must be <em>scoreable</em>: write down 3 concrete criteria a good output satisfies BEFORE you build anything.</p>
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
<li>Write the verdict: did fine-tuning beat the best prompt? By how much? Was it worth it - would you ship it, and when would the per-call savings repay the training effort?</li></ul>
<p>A negative result with honest measurement is a PASS for this gate. "We measured; prompting was sufficient" is a professional conclusion that saves real companies real money - and proves you've escaped demo-land for good.</p>`,
checklist:[
"I defined a target behavior with 3 concrete, scoreable criteria before building",
"I built and curated a 100+ example dataset with deliberate diversity, holding out 15 test cases",
"I recorded the base-model + best-prompt baseline score BEFORE training",
"I completed a fine-tuning run (managed API or QLoRA on Colab)",
"I ran the three-way comparison (base / base+prompt / fine-tuned) on held-out cases",
"I wrote an honest verdict on whether the fine-tune justified its cost"
]}
});
