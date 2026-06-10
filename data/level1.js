window.COURSE_LEVELS = window.COURSE_LEVELS || [];
window.COURSE_LEVELS.push({
title:"Foundations",
sub:"What AI models actually are, how they're built, and why they behave the way they do. Zero code, zero assumed knowledge — but no hand-waving either.",
chapters:[
{title:"Welcome",lessons:[
{id:"l1a1",t:"What an AI engineer actually does",min:4,body:`
<p>An <strong>AI engineer</strong> builds applications on top of [[foundation model|foundation models]] — big AI models that other companies (OpenAI, Anthropic, Meta, Google) have already trained. This is a crucial point that beginners miss: <strong>you almost never train a model from scratch.</strong> Training a frontier model costs hundreds of millions of dollars. Your job is everything that happens <em>after</em>.</p>
<p>Concretely, AI engineers spend their days on five things:</p>
<ul>
<li><strong>Adapting models</strong> — with prompts, with retrieved data ([[rag|RAG]]), or with [[fine-tuning]]</li>
<li><strong>Evaluating</strong> — proving the system actually works, which is far harder than making it appear to work</li>
<li><strong>Building the plumbing</strong> — [[pipeline|pipelines]] that feed data in, [[api|APIs]] that serve answers out</li>
<li><strong>Making it safe</strong> — [[guardrails]] against attacks, nonsense, and embarrassment</li>
<li><strong>Making it cheap and fast</strong> — [[inference]] optimization, because every request costs real money</li>
</ul>
<p>This course follows that exact arc. Levels 1–2 give you the mental model and the tools. Levels 3–4 teach you to build and customize. Levels 5–6 teach you to ship and scale. By the end you'll have built five real projects and a capstone.</p>
<div class="callout"><div class="ct">The difference that matters</div>A person who watched a YouTube video can <em>talk</em> about RAG. An AI engineer has built one, watched it fail on real questions, measured why, and fixed it. This course forces you onto the second path: every level ends with a project gate you must actually build.</div>`,
quiz:[
{q:"What do AI engineers mostly do?",o:["Train new foundation models from scratch","Build and adapt applications on top of existing foundation models","Design new GPU hardware"],a:1,e:"Training from scratch costs hundreds of millions. AI engineering = adapting, evaluating, shipping, and scaling applications built on existing models."},
{q:"Which of these is typically the HARDEST part of the job?",o:["Calling a model API","Reliably evaluating whether the system is good","Picking a programming language"],a:1,e:"Calling an API takes ten lines of code. Knowing whether your system is actually good — and stays good — is the discipline that separates engineers from demo-makers."}]},
{id:"l1a2",t:"How to take this course (so it actually works)",min:3,body:`
<p>This course is designed around how expertise actually forms — and it's not by reading.</p>
<ul>
<li><strong>Go in order.</strong> Later lessons assume earlier ones. The sidebar tracks what you've finished.</li>
<li><strong>Play with every interactive demo.</strong> They exist because feeling a concept beats memorizing it. Drag the sliders to extremes. Break things.</li>
<li><strong>Pass every quiz.</strong> You need all answers correct to complete a lesson. Wrong answers show explanations — read them, they're mini-lessons.</li>
<li><strong>Do the labs on your real computer.</strong> Starting in Level 2, lessons marked 🧪 require you to type real commands and run real code. Do not skip these. Watching is not doing.</li>
<li><strong>Project gates are mandatory.</strong> Each level ends with a project. The checklist only counts if it's true. Nobody is watching — but the only person you'd cheat is you.</li>
<li><strong>Use the review checkpoints.</strong> After each gate there's a mixed quiz drawing from everything so far. Memory needs repetition spaced over time.</li>
</ul>
<div class="callout tip"><div class="ct">Use AI while you learn</div>You're learning AI engineering — so use AI as your tutor throughout. Stuck on a lab? Paste the error into ChatGPT or Claude and ask it to explain (not just fix). Curious why something works? Interrogate the model. Learning to extract understanding from an AI assistant is itself a core AI-engineering skill.</div>
<p>Expected pace: 15–30 minutes a day gets you through a level in roughly 2–3 weeks. Speed doesn't matter. Not stopping does.</p>`,
quiz:[
{q:"What's the right way to handle the 🧪 labs?",o:["Read them carefully — that's enough","Actually run them on your own computer, even when it's uncomfortable","Skip to the quizzes"],a:1,e:"Skills form in your fingers, not your eyes. The discomfort of real errors on your real machine is exactly where learning happens."}]},
{id:"l1a3",t:"The map: six levels from zero to expert",min:3,body:`
<p>Here's the journey, so you always know where you are:</p>
<table>
<tr><th>Level</th><th>You learn</th><th>You build</th></tr>
<tr><td><strong>1 · Foundations</strong></td><td>What models are, training, tokens, why they hallucinate</td><td>A prompt-driven analysis (no code)</td></tr>
<tr><td><strong>2 · Working with Models</strong></td><td>Terminal, Python, the OpenAI API, prompt engineering, basic evals</td><td>A command-line chatbot + eval suite</td></tr>
<tr><td><strong>3 · Building Applications</strong></td><td>Embeddings, RAG, structured outputs, agents, guardrails</td><td>"Chat with your documents" app</td></tr>
<tr><td><strong>4 · Customizing Models</strong></td><td>Data engineering, fine-tuning, LoRA, preference alignment</td><td>Your own fine-tuned model</td></tr>
<tr><td><strong>5 · Shipping to Production</strong></td><td>Pipelines, deployment, LLMOps, monitoring, cost engineering</td><td>Your RAG app deployed as a live web API</td></tr>
<tr><td><strong>6 · Inference at Scale</strong></td><td>GPUs, KV caches, batching, quantization, speculative decoding, serving economics</td><td>Capstone: a complete, measured, end-to-end system</td></tr>
</table>
<p>The content blends three of the field's best books: <em>AI Engineering</em> (Chip Huyen) for the big picture and evaluation discipline, the <em>LLM Engineer's Handbook</em> (Iusztin &amp; Labonne) for end-to-end building and MLOps, and <em>Inference Engineering</em> for the expert-level serving material. The lessons are original — think of this course as a guided path through the ideas, and those books as your deeper references when you want more.</p>`,
quiz:[
{q:"Which level teaches RAG — connecting a model to your own documents?",o:["Level 1","Level 3","Level 6"],a:1,e:"Level 3 is Building Applications: embeddings, RAG, agents, and guardrails, ending with a chat-with-your-documents project."}]}
]},
{title:"What is a language model?",lessons:[
{id:"l1b1",t:"It all starts with predicting the next word",min:5,body:`
<p>Strip away the hype and a [[llm|large language model]] does exactly one thing: <strong>given some text, it predicts what [[token]] comes next.</strong> That's it. That's the whole trick.</p>
<p>"The capital of France is" → the model computes a probability for every token in its vocabulary: <code>Paris</code> 92%, <code>the</code> 3%, <code>located</code> 2%… It picks one, appends it, and repeats. Every essay, every poem, every line of code an LLM has ever produced was generated <strong>one token at a time</strong>, each chosen by this predict-append-repeat loop.</p>
<p>Why does something so simple produce something so capable? Because predicting the next token <em>well</em> across trillions of examples forces the model to internalize a staggering amount of structure: grammar, facts, logic, style, code syntax, even rudimentary reasoning. To guess what follows "The verdict in the 2008 case was" you need to know law, history, and how court reporting is phrased. Prediction is a forcing function for understanding.</p>
<div class="callout"><div class="ct">Hold onto this</div>Every behavior you'll ever see from an LLM — brilliance and nonsense alike — traces back to "what token is statistically likely to come next, given everything in the [[context window]]?" When a model confidently invents a fake citation, it isn't lying. It's completing a pattern. Plausibility is the objective; truth is a frequent side effect.</div>`,
quiz:[
{q:"At its core, what does an LLM compute?",o:["The true answer to a question","A probability distribution over what token comes next","A database lookup of stored sentences"],a:1,e:"It predicts the next token, appends it, and repeats. There is no database of sentences and no built-in concept of truth — just learned statistical structure."},
{q:"Why can next-token prediction produce reasoning-like behavior?",o:["The model secretly contains rules written by engineers","Predicting text well across trillions of examples forces the model to learn the structure that generated the text","It can't — all LLM reasoning is fake marketing"],a:1,e:"To predict well, the model must compress grammar, facts, and logical patterns into its parameters. Prediction is a forcing function for understanding — imperfect, but real."}]},
{id:"l1b2",t:"Tokens: the alphabet of AI",min:5,sim:"tokenizer",body:`
<p>Models don't read letters or words. A [[tokenizer]] first chops text into <strong>tokens</strong> — pieces from a fixed vocabulary (typically 50,000–200,000 entries) learned by finding the most common chunks in training data. Common words like <code>the</code> are one token. Rare words get split: <code>tokenization</code> might become <code>token</code> + <code>ization</code>.</p>
<p>Rules of thumb for English: 1 token ≈ 4 characters ≈ ¾ of a word. 1,000 tokens ≈ 750 words.</p>
<p>Why should you care? Because tokens are the unit of <strong>everything</strong> in this field:</p>
<ul>
<li><strong>Cost</strong> — APIs bill per million tokens, in and out</li>
<li><strong>Memory</strong> — the [[context window]] is measured in tokens</li>
<li><strong>Speed</strong> — generation speed is tokens per second</li>
<li><strong>Weirdness</strong> — many classic LLM failures are tokenizer artifacts. Models historically struggled to count the r's in "strawberry" partly because they see token chunks, not letters. Arithmetic suffers when numbers split into odd pieces. Non-English text often uses 2–4× more tokens, making it slower and pricier.</li></ul>
<p>Try the playground below — watch how short common words survive intact while long words shatter.</p>`,
quiz:[
{q:"Roughly how many tokens is a 1,500-word English article?",o:["About 150","About 2,000","About 15,000"],a:1,e:"1 token ≈ ¾ of a word, so 1,500 words ≈ 2,000 tokens. This estimate matters constantly: for cost, for context limits, for speed."},
{q:"Why do LLMs struggle to count letters in a word?",o:["They're bad at math on purpose","They never see letters — the tokenizer hands them multi-character chunks","Letters are removed during training"],a:1,e:"The model receives token IDs, not characters. 'strawberry' may arrive as 2–3 chunks, so 'count the r's' requires reasoning about units it cannot directly see."}]},
{id:"l1b3",t:"Inside the box: parameters and the transformer",min:5,sim:"attention",body:`
<p>So what's inside the thing making these predictions? A neural network — billions of numbers called [[parameter|parameters]] (or [[weight|weights]]), organized into layers. Text-as-numbers flows in, gets transformed layer by layer through multiplication with these weights, and a prediction comes out. "Training" means nudging those billions of numbers, over and over, until predictions get good. The parameters <em>are</em> the model: its knowledge, its style, its abilities — all just numbers.</p>
<p>Modern LLMs use an architecture called the [[transformer]], and its superpower is <strong>[[attention]]</strong>: a mechanism that lets every token look at every other token in the context and decide which ones matter right now. When the model processes "The cat sat on the mat because <em>it</em> was soft", attention is how "it" figures out it refers to the mat, not the cat.</p>
<p>Sizes you'll hear: a "7B" model has 7 billion parameters; frontier models run into hundreds of billions. More parameters = more capacity for knowledge and nuance, but also more memory and more cost per token — a trade-off you'll engineer around constantly, all the way to Level 6.</p>
<div class="callout"><div class="ct">You don't need the math</div>You can have a long AI-engineering career without deriving attention equations. You DO need the concepts: parameters store the knowledge, attention routes information between tokens, and model size trades quality against cost. (In Level 6, attention returns with a vengeance — its memory appetite shapes all of inference engineering.)</div>`,
quiz:[
{q:"What are a model's parameters?",o:["Settings you adjust in the API, like temperature","The billions of learned numbers that store everything the model knows","The rules engineers wrote to control it"],a:1,e:"Parameters are learned numbers, adjusted during training. No human writes rules into them — which is also why nobody can simply 'edit out' a wrong fact."},
{q:"What does the attention mechanism do?",o:["Lets each token weigh which other tokens in the context matter for the current prediction","Makes the model pay attention to the user","Compresses the model to use less memory"],a:0,e:"Attention routes information between tokens — how 'it' finds its referent, how a question finds relevant context. It's the heart of the transformer."}]},
{id:"l1b4",t:"Where models come from: pretraining",min:5,body:`
<p>[[pretraining|Pretraining]] is the giant first phase that gives a model its raw capability. The recipe sounds absurd:</p>
<ol>
<li>Collect a huge slice of human text — trillions of tokens of web pages, books, code, papers</li>
<li>Show the model snippet after snippet with the next token hidden</li>
<li>Each time it guesses wrong, nudge the parameters to make the right answer more likely</li>
<li>Repeat ~quadrillions of times on thousands of [[gpu|GPUs]] for months</li>
</ol>
<p>The cost is staggering — frontier runs cost hundreds of millions of dollars in compute. This is why only a handful of organizations pretrain, and everyone else (you) builds on the results.</p>
<p>Three consequences you'll feel in practice:</p>
<ul>
<li><strong>Data is destiny.</strong> The model is a compression of its training data. Whatever was common in the data, the model does well; whatever was rare or absent, it does badly. Biases in, biases out.</li>
<li><strong>Knowledge has a cutoff.</strong> A model trained on data through last year knows nothing after that date — a key reason RAG (Level 3) exists.</li>
<li><strong>Scale buys capability.</strong> More data + more parameters + more compute has, so far, reliably bought better models ("scaling laws") — though with rapidly rising price tags.</li></ul>`,
quiz:[
{q:"What is the training signal during pretraining?",o:["Human teachers labeling answers as right or wrong","Whether the model correctly predicted the hidden next token","A list of facts the model must memorize"],a:1,e:"Pretraining is self-supervised: the text itself provides the answers (the actual next token). That's what makes training on trillions of tokens feasible — no human labeling required."},
{q:"Your model confidently knows nothing about an event from last month. Most likely reason?",o:["It's broken","The event happened after its training data cutoff","The event was deleted for safety"],a:1,e:"Models know only what was in their training data. Anything after the cutoff doesn't exist for them — which is exactly the problem retrieval (RAG) solves."}]},
{id:"l1b5",t:"From autocomplete to assistant: post-training",min:5,body:`
<p>A freshly pretrained ("base") model is a savant with no manners. Ask it "What's the capital of France?" and it might reply with… more exam questions — because in its training data, one question is often followed by others. It completes patterns; it doesn't <em>converse</em>.</p>
<p>[[post-training|Post-training]] turns this raw pattern-completer into an assistant, in two main steps:</p>
<ul>
<li><strong>[[sft|Supervised fine-tuning (SFT)]]</strong> — train on tens of thousands of (instruction → ideal response) example pairs, written or curated by humans. The model learns the <em>shape</em> of being helpful: answer the question, follow the format, stop when done.</li>
<li><strong>Preference alignment ([[rlhf|RLHF]] / [[dpo|DPO]])</strong> — collect human judgments comparing pairs of responses ("A is better than B"), and train the model to produce more A's and fewer B's. This tunes tone, honesty, harmlessness, and helpfulness.</li></ul>
<p>This is why ChatGPT in 2022 felt like magic: GPT-3-class base models had existed for two years, but post-training made the capability <em>usable</em> by anyone.</p>
<div class="callout warn"><div class="ct">Side effects you'll engineer around</div>Alignment shapes personality and pathology alike. Models can become sycophantic (agreeing with you because raters liked agreeable answers), over-cautious (refusing harmless requests), or addicted to certain phrasings ("Certainly! Here's a comprehensive…"). In Level 4 you'll run these techniques yourself, on your own model.</div>`,
quiz:[
{q:"Why might a base (pretrained-only) model answer a question with more questions?",o:["It's being evasive","It completes statistical patterns, and questions are often followed by more questions in real text","Base models can't generate answers"],a:1,e:"A base model has no concept of 'being asked something'. It continues text. SFT is what teaches the ask→answer pattern."},
{q:"What does RLHF/DPO training data consist of?",o:["More raw internet text","Human preferences between pairs of candidate responses","GPU performance benchmarks"],a:1,e:"Preference alignment learns from comparisons — 'response A beats response B' — which is much easier for humans to provide consistently than writing perfect answers from scratch."}]}
]},
{title:"Model behavior",lessons:[
{id:"l1c1",t:"Temperature and the randomness dial",min:4,sim:"temperature",body:`
<p>If models pick the most likely token every time, why does the same question give different answers? Because picking the single most likely token every time ([[temperature]] = 0, "greedy") produces repetitive, lifeless text — and can get stuck in loops. So instead, models <strong>[[sampling|sample]]</strong>: they roll a weighted die over the probability distribution.</p>
<p><strong>Temperature</strong> reshapes that die before the roll:</p>
<ul>
<li><strong>T → 0</strong>: distribution sharpens to a spike — near-deterministic, safe, dull. Use for extraction, classification, code, anything with a right answer.</li>
<li><strong>T ≈ 0.7–1.0</strong>: balanced — natural-sounding variety. Default for chat and writing.</li>
<li><strong>T &gt; 1.3</strong>: distribution flattens — unlikely tokens get real chances. Creative at first, then word salad.</li></ul>
<p>Its partner [[top-p]] limits sampling to the smallest set of tokens covering p (say 90%) of the probability, chopping off the long tail of nonsense. Play with the demo: drag temperature to the extremes and sample repeatedly — watch certainty melt into chaos.</p>
<div class="callout tip"><div class="ct">Engineering habit</div>Randomness means a single good output proves nothing. The demo that worked once in front of you can fail for the next ten users. This is the deep reason evaluation (Levels 2–3) runs every test many times over many cases.</div>`,
quiz:[
{q:"You're building an app that extracts dates from invoices. What temperature?",o:["Low (near 0) — there's a correct answer, you want consistency","High (1.5) — creativity finds more dates","Temperature doesn't apply to extraction"],a:0,e:"Tasks with a right answer want low temperature. Save higher temperatures for open-ended generation where variety is a feature."},
{q:"Why does one successful test run prove little about an LLM feature?",o:["Sampling is random — the next run can take a different path","Models update themselves between runs","It proves the feature works"],a:0,e:"Outputs are samples from a distribution. Reliability claims need many runs across many inputs — the heart of evaluation."}]},
{id:"l1c2",t:"The context window: working memory and its limits",min:4,sim:"context",body:`
<p>The [[context window]] is the maximum number of tokens the model can process in one request — prompt plus response. Think of it as working memory: <strong>if it's not in the window, it does not exist for the model.</strong></p>
<p>Modern windows are large (128k tokens — roughly a novel — is common), but the limit still bites:</p>
<ul>
<li><strong>Chatbots "forget"</strong> — long conversations overflow, old messages get dropped, and users swear the bot lost its mind. (Try the demo.)</li>
<li><strong>You can't paste a whole knowledge base</strong> — companies have gigabytes of documents; windows hold megabytes at best. Hence retrieval: fetch only the relevant bits (Level 3).</li>
<li><strong>Long ≠ well-used</strong> — models attend unevenly across huge contexts; details buried in the middle get missed more often ("lost in the middle"). Stuffing the window is not a strategy.</li>
<li><strong>Tokens cost money and time</strong> — sending 100k tokens with every request is slow and expensive. [[prefill|Prefill]] time grows with prompt length.</li></ul>
<div class="callout"><div class="ct">Reframe</div>Much of AI engineering is really <strong>context engineering</strong>: deciding what earns a place in that precious window — instructions, examples, retrieved facts, history — and what gets summarized, retrieved-on-demand, or dropped.</div>`,
quiz:[
{q:"A user's long chat session suddenly 'forgets' early decisions. Most likely cause?",o:["The model deleted its parameters","The conversation exceeded the context window and old messages were dropped","The API key expired"],a:1,e:"Once history exceeds the window, something must be cut — usually the oldest turns. The model isn't forgetting; it literally never receives those tokens."},
{q:"Why not just paste all company documents into every prompt?",o:["Copyright law forbids it","Cost, latency, window limits, and degraded attention over huge contexts","Models refuse long inputs"],a:1,e:"Even when documents fit, you pay in money, speed, and accuracy. Retrieving only relevant chunks (RAG) beats brute-force stuffing."}]},
{id:"l1c3",t:"Hallucination: why models lie with confidence",min:5,body:`
<p>A model states, fluently and specifically, something completely false — a fake court case, an imaginary API function, a wrong date. This is [[hallucination]], and it is <strong>the</strong> defining failure mode of LLMs. Understand it deeply and half of AI system design makes sense.</p>
<p>Why it happens — remember Lesson 4: a model is trained to produce <em>plausible continuations</em>, not <em>true statements</em>:</p>
<ul>
<li>Truth was never the objective. Text that "sounds right" scores well in training even when wrong.</li>
<li>Parameters store fuzzy, compressed statistics — not a lookup table of facts. Rare facts compress badly.</li>
<li>The model must always output <em>some</em> token. With no strong signal, it outputs the most plausible-sounding guess — formatted exactly like a confident fact.</li>
<li>Fluency and confidence are styles learned from training text, utterly uncorrelated with accuracy.</li></ul>
<p>Engineering consequences (this list IS the syllabus of Levels 2–3):</p>
<ul>
<li><strong>Ground the model</strong> — put real documents in the context ([[rag|RAG]]) so it can quote instead of recall</li>
<li><strong>Constrain output</strong> — [[structured output|structured formats]] and citation requirements shrink the room for invention</li>
<li><strong>Verify</strong> — check claims against sources; never let unverified output drive irreversible actions</li>
<li><strong>Evaluate relentlessly</strong> — measure your system's factuality, don't vibe-check it</li></ul>
<div class="callout fail"><div class="ct">Real-world failure</div>In 2023, two lawyers submitted a federal court brief citing six precedent cases suggested by ChatGPT. None existed. The model had generated perfectly formatted, perfectly plausible, perfectly fake citations — and they were sanctioned by the judge. The error wasn't using AI; it was trusting fluent output without verification.</div>`,
quiz:[
{q:"What is the root cause of hallucination?",o:["A bug that providers will soon patch","Models optimize for plausible continuation, and truth was never the training objective","Models are intentionally deceptive"],a:1,e:"Hallucination is inherent to next-token prediction. It can be reduced — grounding, constraints, verification — but with current architectures, never assumed away."},
{q:"Which strategy most directly reduces hallucination in a company Q&A bot?",o:["Raise the temperature","Retrieve real documents into the context and require answers grounded in them","Use a longer system prompt saying 'do not hallucinate'"],a:1,e:"Grounding changes the task from 'recall from fuzzy parameters' to 'read and quote from provided text' — far more reliable. Politely asking a model not to hallucinate is not a control."}]},
{id:"l1c4",t:"What models are good and bad at (a field guide)",min:4,body:`
<p>Models are <em>jagged</em>: superhuman at some tasks, surprisingly bad at adjacent ones. Internalize this map so you stop being surprised:</p>
<table>
<tr><th>Reliably strong</th><th>Reliably shaky</th></tr>
<tr><td>Transforming text: summarize, rewrite, translate, change tone</td><td>Precise arithmetic and counting (tokens, remember?)</td></tr>
<tr><td>Drafting: emails, code, outlines, boilerplate</td><td>Rare or recent facts recalled from parameters</td></tr>
<tr><td>Extraction &amp; classification with clear instructions</td><td>Long multi-step logic without room to reason</td></tr>
<tr><td>Explaining well-documented concepts</td><td>Knowing what it doesn't know (calibration)</td></tr>
<tr><td>Pattern-matching from a few examples</td><td>Consistency across runs and phrasings</td></tr>
</table>
<p>The pattern behind the pattern: models excel when the answer is <strong>supported by the context you give them</strong> or by overwhelming training data, and degrade when they must recall precisely, count exactly, or be consistent under pressure.</p>
<p>Good AI products are designed around this jaggedness: give the model the text (don't make it remember), give it tools for math (Level 3), give it room to reason step-by-step (Level 2), and verify what comes out. Weak products treat the model as an oracle and ship its raw guesses.</p>`,
quiz:[
{q:"Which task setup plays to an LLM's strengths?",o:["\"What were our company's exact Q3 2024 revenues?\" from memory","\"Here is our Q3 report: [text]. Summarize the three main risks.\"","\"Multiply 48,329 × 7,251 in your head\""],a:1,e:"Transforming provided text is the sweet spot. Precise recall from parameters and raw arithmetic are exactly the weak spots — give it the document, give it a calculator."}]}
]},
{title:"The AI landscape",lessons:[
{id:"l1d1",t:"The model menu: closed APIs vs open weights",min:4,body:`
<p>Your first real engineering decision in any project: <em>which model, accessed how?</em> Two families:</p>
<p><strong>Closed models behind [[api|APIs]]</strong> (GPT-4-class from OpenAI, Claude from Anthropic, Gemini from Google): you send a request over the internet, pay per [[token]], and never touch the model itself. Top quality, zero infrastructure, but you ship your data to a vendor, accept their prices and limits, and they can change or retire the model under you.</p>
<p><strong>[[open weights|Open-weights]] models</strong> (Llama from Meta, Mistral, Qwen, and hundreds more on Hugging Face): you download the actual parameters and run them on hardware you control. Full control and privacy, can be radically cheaper at scale, fine-tune however you like — but now GPU provisioning, serving, and scaling are <em>your</em> problem (that's Level 6).</p>
<p>How practitioners actually choose:</p>
<ul>
<li><strong>Prototype on a frontier API</strong> — prove the use case with the best model, no setup</li>
<li><strong>Then optimize</strong> — once it works, ask: would a smaller/cheaper model do? Do privacy or cost demand self-hosting? Often the answer is a mix ([[model cascade|cascades]], Level 5)</li></ul>
<div class="callout tip"><div class="ct">Rule of thumb</div>Start with the strongest model available and make the use case work. Downgrading for cost is easy once you have evaluations to prove the cheaper model is good enough. Building on a weak model first means you never learn whether your idea or your model was the problem.</div>`,
quiz:[
{q:"Why prototype with a frontier model even if it's expensive?",o:["Expensive always means better forever","It isolates your idea from model weakness — if it fails on the best model, the idea needs work; downgrading later is easy with evals","APIs are the only legal option"],a:1,e:"Prototyping on the strongest model removes one variable. With eval results in hand, you can later swap in cheaper models and measure exactly what you lose."},
{q:"Your client is a hospital that cannot send patient data to external servers. Which direction does this push?",o:["Closed API models","Open-weights models running on infrastructure they control","No AI is possible"],a:1,e:"Data-residency and privacy constraints are the classic driver toward self-hosted open-weights models — trading convenience for control."}]},
{id:"l1d2",t:"Prompt, RAG, or fine-tune? The adaptation ladder",min:4,body:`
<p>You have a model. It's 80% right for your task. The three ways to close the gap — in the order you should try them:</p>
<ol>
<li><strong>[[prompt engineering|Prompt engineering]]</strong> (minutes, ~free): better instructions, worked examples, output formats, room to reason. People dismiss it as trivial; in practice it routinely closes most of the gap. <em>Changes what you ask.</em></li>
<li><strong>[[rag|RAG]]</strong> (days): retrieve relevant data into the context at request time. The fix for missing, private, or fresh <strong>knowledge</strong>. <em>Changes what the model knows right now.</em></li>
<li><strong>[[fine-tuning|Fine-tuning]]</strong> (weeks, needs data + evals): actually trains the weights. The fix for <strong>behavior</strong> — consistent style, formats, domain-specific patterns that prompting can't lock in. <em>Changes what the model is.</em></li></ol>
<div class="callout"><div class="ct">The knowledge vs. behavior test</div>"The model doesn't know our refund policy" → knowledge → RAG. "The model knows it but writes in the wrong tone/format every time" → behavior → better prompts, then fine-tuning. Teams that fine-tune to inject facts usually regret it: facts go stale, and RAG handles them better.</div>
<p>These compose — serious systems often use all three. But the ladder's order is sacred: each rung costs 10× the one before, so climb only when the cheaper rung demonstrably (measured!) falls short.</p>`,
quiz:[
{q:"Your support bot doesn't know about products launched last month. First move?",o:["Fine-tune on the new product docs","RAG — retrieve product docs into the context at question time","Wait for the next base model"],a:1,e:"Missing/fresh knowledge is RAG's home turf. Update the document store and the bot knows it instantly — no retraining, no staleness."},
{q:"Why try prompt engineering before fine-tuning?",o:["Fine-tuning is illegal for most models","Prompting is nearly free, takes minutes, and often closes most of the gap — fine-tuning costs weeks and needs data + evals","Prompting always beats fine-tuning in quality"],a:1,e:"It's an economics argument: exhaust the cheap, fast option and measure, before paying for the expensive one. Often you never need the expensive one."}]},
{id:"l1d3",t:"What people actually build (and what makes a good first use case)",min:4,body:`
<p>Where foundation models earn their keep today: coding assistants, customer-support bots grounded in company docs, document processing (contracts, invoices, claims), writing and marketing tools, search and knowledge management, meeting summaries, data extraction at scale, and AI features inside existing products ("summarize this thread").</p>
<p>Notice what these share — the anatomy of a strong LLM use case:</p>
<ul>
<li><strong>Language in, language out</strong> — the task lives in text</li>
<li><strong>Drafts are valuable</strong> — an 85%-right answer that a human reviews still saves real time</li>
<li><strong>Mistakes are recoverable</strong> — wrong summary: annoying. Wrong medication dose: catastrophic.</li>
<li><strong>Volume is high</strong> — the task happens often enough that automation compounds</li></ul>
<p>And the anti-patterns: tasks demanding 100% accuracy with no human check, decisions with legal/medical/financial stakes shipped raw, problems where being wrong is worse than being absent, and "AI for AI's sake" features nobody asked for.</p>
<div class="callout warn"><div class="ct">The demo-to-production gap</div>The most expensive sentence in this industry is "the demo worked." A demo proves the happy path exists. Production means the weird paths — typos, hostile users, edge cases, scale — and that gap is precisely what Levels 2–6 teach you to close.</div>`,
quiz:[
{q:"Which is the strongest first AI use case for a small company?",o:["Auto-approving loan applications with no human review","Drafting first-pass responses to common support emails, reviewed by staff before sending","Replacing the accounting system"],a:1,e:"Text in/text out, drafts save time, human review catches errors, high volume. The loan case fails the 'mistakes are recoverable' test catastrophically."}]}
]}
],
project:{id:"l1gate",t:"Project Gate 1 — Stress-test a model like an engineer",
body:`
<p>No code yet — but real engineering thinking. You'll systematically probe a model's strengths and failure modes and write up findings like a professional evaluating a system. This is the mindset everything else builds on.</p>
<h2>Your mission</h2>
<p>Use any free chatbot (ChatGPT, Claude, Gemini). Create a document titled <strong>"Model Stress Test"</strong> with four experiments:</p>
<h3>1. Hallucination hunt</h3>
<p>Ask about 5 increasingly obscure topics in a domain you know well (your hometown, your profession, a hobby). Start famous, end very niche. Record where answers go from accurate → vague → confidently wrong. Note: does the model's <em>tone</em> change as accuracy collapses?</p>
<h3>2. The grounding effect</h3>
<p>Pick a topic the model got wrong or vague in experiment 1. Now paste in a paragraph of real source text about it and ask again. Compare answers side by side. You've just demonstrated the principle behind RAG.</p>
<h3>3. Consistency check</h3>
<p>Ask the exact same non-trivial question 5 times in 5 fresh chats. Record how much answers vary in substance, not just wording. Connect what you see to sampling and temperature.</p>
<h3>4. The jaggedness probe</h3>
<p>Find one task the model does astonishingly well and one simple task it fumbles (try: letter counting, arithmetic on big numbers, very recent events). One sentence each: why does this fit the strong/shaky map from the field guide lesson?</p>
<h2>Write the verdict</h2>
<p>End with a short paragraph: based on your evidence, what would you trust this model to do unsupervised? What only with review? What never? You now have something most AI commentators don't: <strong>data</strong>.</p>`,
checklist:[
"I ran the hallucination hunt across 5 topics and recorded where accuracy collapsed",
"I demonstrated the grounding effect: same question, with vs. without source text pasted in",
"I asked one question in 5 fresh chats and documented how answers varied",
"I found and explained one surprisingly-strong and one surprisingly-weak task",
"I wrote a verdict paragraph: trust unsupervised / trust with review / never trust"
]}
});
