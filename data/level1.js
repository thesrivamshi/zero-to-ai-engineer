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
<p>The content blends three of the field's best books: <em>AI Engineering</em> (Chip Huyen) for the big picture and evaluation discipline, the <em>LLM Engineer's Handbook</em> (Iusztin &amp; Labonne) for end-to-end building and MLOps, and <em>Inference Engineering</em> for the expert-level serving material. The lessons are original — think of this course as a guided path through the ideas, and those books as your deeper references when you want more.</p>
<div class="callout"><div class="ct">The Agent Spine — one project that grows the whole way</div>You don't learn Python (or [[json|JSON]], [[sql|SQL]], [[function calling]], APIs, or [[mcp|MCP]]) from a separate course here. You learn them by building <strong>one agent</strong> that gets an upgrade every level: it starts as a script that calls a model (L2), gains memory in a [[database]] and tools it can call (L3), learns to sound like you via fine-tuning (L4), gets served behind an API and shared as an MCP server (L5), then measured and optimized at scale (L6). Each new skill shows up exactly when the agent needs it — never before. By the end, the "five projects" are really one system you built and can defend line by line.</div>
<div class="callout tip"><div class="ct">Two things on every lesson</div>Look for the <strong>🎬 Watch</strong> box (hand-picked videos for visual learners) and the <strong>📖 Read deeper</strong> box (the exact pages in the three books). The reading boxes are designed so that, across the whole course, they cover every chapter of all three books — finish them and you've worked through AI Engineering, the LLM Engineer's Handbook, and Inference Engineering.</div>`,
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
{q:"Why can next-token prediction produce reasoning-like behavior?",o:["The model secretly contains rules written by engineers","Predicting text well across trillions of examples forces the model to learn the structure that generated the text","It can't — all LLM reasoning is fake marketing"],a:1,e:"To predict well, the model must compress grammar, facts, and logical patterns into its parameters. Prediction is a forcing function for understanding — imperfect, but real."}],
videos:[{title:"Andrej Karpathy — [1hr Talk] Intro to Large Language Models",url:"https://www.youtube.com/watch?v=zjkBMFhNj_g",why:"The single best one-hour overview of what LLMs are, by a founding researcher at OpenAI. Watch it once now and again at the end of the course."}]},
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
{q:"Why do LLMs struggle to count letters in a word?",o:["They're bad at math on purpose","They never see letters — the tokenizer hands them multi-character chunks","Letters are removed during training"],a:1,e:"The model receives token IDs, not characters. 'strawberry' may arrive as 2–3 chunks, so 'count the r's' requires reasoning about units it cannot directly see."}],
videos:[{title:"Andrej Karpathy — Let's build the GPT Tokenizer",url:"https://www.youtube.com/watch?v=zduSFxRajkE",why:"Builds a real tokenizer from scratch and explains exactly why so many odd LLM behaviors are tokenizer artifacts. Hands-on and eye-opening."}]},
{id:"l1b3",t:"Inside the box: parameters and the transformer",min:5,sim:"attention",body:`
<p>So what's inside the thing making these predictions? A neural network — billions of numbers called [[parameter|parameters]] (or [[weight|weights]]), organized into layers. Text-as-numbers flows in, gets transformed layer by layer through multiplication with these weights, and a prediction comes out. "Training" means nudging those billions of numbers, over and over, until predictions get good. The parameters <em>are</em> the model: its knowledge, its style, its abilities — all just numbers.</p>
<p>Modern LLMs use an architecture called the [[transformer]], and its superpower is <strong>[[attention]]</strong>: a mechanism that lets every token look at every other token in the context and decide which ones matter right now. When the model processes "The cat sat on the mat because <em>it</em> was soft", attention is how "it" figures out it refers to the mat, not the cat.</p>
<p>Sizes you'll hear: a "7B" model has 7 billion parameters; frontier models run into hundreds of billions. More parameters = more capacity for knowledge and nuance, but also more memory and more cost per token — a trade-off you'll engineer around constantly, all the way to Level 6.</p>
<div class="callout"><div class="ct">You don't need the math</div>You can have a long AI-engineering career without deriving attention equations. You DO need the concepts: parameters store the knowledge, attention routes information between tokens, and model size trades quality against cost. (In Level 6, attention returns with a vengeance — its memory appetite shapes all of inference engineering.)</div>`,
quiz:[
{q:"What are a model's parameters?",o:["Settings you adjust in the API, like temperature","The billions of learned numbers that store everything the model knows","The rules engineers wrote to control it"],a:1,e:"Parameters are learned numbers, adjusted during training. No human writes rules into them — which is also why nobody can simply 'edit out' a wrong fact."},
{q:"What does the attention mechanism do?",o:["Lets each token weigh which other tokens in the context matter for the current prediction","Makes the model pay attention to the user","Compresses the model to use less memory"],a:0,e:"Attention routes information between tokens — how 'it' finds its referent, how a question finds relevant context. It's the heart of the transformer."}],
videos:[
{title:"3Blue1Brown — But what is a GPT? Visual intro to transformers",url:"https://www.youtube.com/watch?v=wjZofJX0v4M",why:"The clearest visual explanation of how a transformer turns tokens into predictions. Pause often."},
{title:"3Blue1Brown — Attention in transformers, visually explained",url:"https://www.youtube.com/watch?v=eMlx5fFNoYc",why:"Attention, the heart of the transformer, drawn out step by step. The best 26 minutes you can spend on this concept."},
{title:"3Blue1Brown — But what is a neural network? (Chapter 1)",url:"https://www.youtube.com/watch?v=aircAruvnKk",why:"If 'billions of numbers in layers' feels abstract, this builds the picture from zero. Start of the whole Neural Networks series."}]},
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
{q:"What does RLHF/DPO training data consist of?",o:["More raw internet text","Human preferences between pairs of candidate responses","GPU performance benchmarks"],a:1,e:"Preference alignment learns from comparisons — 'response A beats response B' — which is much easier for humans to provide consistently than writing perfect answers from scratch."}],
videos:[{title:"Andrej Karpathy — Deep Dive into LLMs like ChatGPT",url:"https://www.youtube.com/watch?v=7xTGNNLPyMI",why:"A full-stack walkthrough including pretraining AND post-training (SFT, RLHF). Longer and deeper than the intro talk — worth it."}]},
{id:"l1b6",t:"Self-supervision: the trick that made scale possible",min:5,src:"AIE ch.1 §The Rise of AI Engineering",body:`
<p>Here's a question worth sitting with: why did <em>language</em> become the center of the AI explosion, and not, say, weather prediction or image recognition? The answer is a training trick called <strong>[[self-supervision]]</strong>, and it's the quiet reason any of this exists.</p>
<p>Most of AI's 2010s successes ran on <strong>[[supervision]]</strong>: humans hand-label examples, the model learns from the labels. The model that kicked off the deep-learning era, AlexNet (2012), was trained on ImageNet — over a million images, each labeled by a person into one of 1,000 categories like "car" or "balloon".</p>
<p>Supervision works, but labeling is a tollbooth on the road to scale. Do the arithmetic: at 5 cents per image, labeling a million images costs <strong>$50,000</strong>. Want two labelers per image to cross-check quality? Double it. Want to cover a million categories instead of a thousand? Now you're at <strong>$50 million</strong> — just for labels. And that assumes easy labels. Labeling whether a CT scan shows cancer needs a radiologist, not a crowdworker. The cost becomes astronomical.</p>
<p>Self-supervision dodges the tollbooth entirely: <strong>the data labels itself.</strong> Take the sentence "I love street food." It silently contains six training examples — at each position, the earlier tokens are the input and the next token is the answer:</p>
<table>
<tr><th>Input (context)</th><th>Output (next token)</th></tr>
<tr><td>&lt;BOS&gt;</td><td>I</td></tr>
<tr><td>&lt;BOS&gt;, I</td><td>love</td></tr>
<tr><td>&lt;BOS&gt;, I, love</td><td>street</td></tr>
<tr><td>&lt;BOS&gt;, I, love, street</td><td>food</td></tr>
<tr><td>&lt;BOS&gt;, I, love, street, food</td><td>.</td></tr>
</table>
<p>No human wrote those labels — the text itself supplied them. (<code>&lt;BOS&gt;</code> and <code>&lt;EOS&gt;</code> are special "beginning/end of sequence" tokens; the end marker is how a model learns when to stop talking.) Because raw text is everywhere — books, blogs, articles, Reddit, code — you can mint a near-infinite labeled dataset for free. That's what let language models swell into [[llm|LLMs]].</p>
<div class="callout"><div class="ct">Self-supervision is not unsupervision</div>In self-supervised learning the labels exist — they're just <em>inferred from the input</em> (the next token) instead of provided by a human. In unsupervised learning there are no labels at all. The distinction matters: language modeling has a crisp right-answer for every prediction, which is exactly what makes training signal so clean and so scalable.</div>`,
quiz:[
{q:"Why did self-supervision matter so much for language models?",o:["It makes models smaller","It removes the human-labeling bottleneck, so raw text becomes a near-infinite training set","It guarantees the model tells the truth"],a:1,e:"Supervised labeling caps dataset size by cost (a million images ≈ $50k). Self-supervision lets every sentence on the internet become free labeled examples — that's what enabled scale."},
{q:"In self-supervised language modeling, where do the 'labels' come from?",o:["Paid human annotators","The text itself — the next token is the label for the preceding context","A separate answer-key dataset"],a:1,e:"Each sequence supplies both the context and the answer (the following token). No human labels the data, which is the whole point — unlike supervised learning, and unlike label-free unsupervised learning."}]},
{id:"l1b7",t:"From language models to foundation models",min:4,src:"AIE ch.1 §The Rise of AI Engineering",body:`
<p>Humans don't experience the world only through words — we see, hear, and touch. For AI to be broadly useful, it had to break out of text. That break is what turned "large language model" into the bigger idea of a <strong>[[foundation model]]</strong>.</p>
<p>The word <em>foundation</em> carries two meanings at once: these models are <em>foundational</em> to AI applications (everyone builds on top of them), and they can be <em>built upon</em> for endless different needs. The same trick that scaled text scales here too. A plain language model predicts the next token from text tokens; a <strong>[[multimodal]]</strong> model predicts the next token conditioned on text <em>and</em> image tokens (or audio, video, whatever it supports). A [[generative]] multimodal model is sometimes called a large multimodal model (LMM). GPT-4V and Claude understand images and text; some models handle video, 3D, even protein structures.</p>
<p>Self-supervision generalizes beautifully. To train its image-text model CLIP, OpenAI didn't pay anyone to label images. They scraped <strong>400 million (image, caption) pairs</strong> that already co-occurred on the internet — 400× the size of ImageNet, at zero labeling cost. They called this <strong>[[natural language supervision]]</strong>. CLIP isn't generative; it's an [[embedding model]] that maps images and text into the same space (you'll work with embeddings hands-on in Level 3), and such models became the backbone of generative multimodal systems.</p>
<p>Foundation models also flipped a deeper assumption. For decades AI was split by modality and by task: an NLP model did text, a vision model did images, and a model trained for sentiment analysis <em>couldn't</em> translate. Foundation models are <strong>general-purpose</strong> — one model does sentiment analysis <em>and</em> translation <em>and</em> summarization, out of the box, often well. You then tweak it (prompting, [[rag|RAG]], [[fine-tuning]]) to squeeze out the last mile on your specific task.</p>
<div class="callout tip"><div class="ct">Why this is the foundation of the whole job</div>Because one general model covers thousands of tasks, your work shifts from "train a model for this task" to "adapt this powerful general model to my task." Ten examples and a weekend, instead of a million examples and six months. That shift — and the techniques that exploit it — is what the rest of this course teaches.</div>
<p>This book and course use "foundation models" to mean both large language models and large multimodal models.</p>`,
quiz:[
{q:"What makes a model a 'foundation' model rather than just a language model?",o:["It runs only in the cloud","It's a general-purpose, build-upon-able model (often multimodal) that many applications are built on top of","It has exactly one trillion parameters"],a:1,e:"'Foundation' captures both senses: foundational to apps, and built-upon for many needs. Multimodality is common but the defining trait is general-purpose reusability."},
{q:"How did CLIP get a 400-million-example training set without paying labelers?",o:["A government grant funded the labeling","It used (image, caption) pairs that already co-occur on the web — natural language supervision","It generated the labels with another AI"],a:1,e:"Natural language supervision reuses naturally paired data (image + its caption) as the training signal — the same 'data labels itself' idea as text self-supervision, extended to images."}]},
{id:"l1b8",t:"What's in the training data — and why it's destiny",min:5,src:"AIE ch.2 §Training Data",body:`
<p>A model is, quite literally, a compression of the text it was trained on. So the single most important fact about any model is also the one you can least see: <strong>what was in its training data.</strong> Whatever was abundant, it learned well. Whatever was rare or missing, it fumbles. Data is destiny.</p>
<p>Most frontier models are pretrained largely on a scrape of the open web — projects like Common Crawl, which contains billions of pages. The web is vast and cheap, but it is not clean: it's full of clickbait, spam, propaganda, conspiracy theories, SEO sludge, and toxic language, alongside the good stuff. Train naively on raw web data and the model faithfully absorbs the sludge too. This is why model developers spend enormous effort on <strong>data quality</strong> — filtering, deduplicating, and curating — before a single training step runs. The quiet truth of modern AI: a huge fraction of the work is data work.</p>
<h2>The languages problem</h2>
<p>The internet is not a fair sample of humanity. English dominates online text far beyond its share of native speakers, so models are dramatically better in English than in low-resource languages. The consequences compound:</p>
<ul>
<li><strong>Worse quality</strong> in underrepresented languages — more errors, more hallucination, weaker reasoning.</li>
<li><strong>Higher cost and slower responses</strong> — tokenizers trained mostly on English split other languages into far more tokens. The same sentence in, say, Burmese or Shan can take several times as many tokens as in English, so it costs several times more and runs slower (remember: cost and speed are per-token).</li></ul>
<h2>The domains problem</h2>
<p>General web scrapes underrepresent specialized domains. There's relatively little cancer biology, proprietary legal contract language, or internal financial filing data on the open web, so a general model is weaker exactly where expert stakes are highest. This is a core reason domain teams reach for [[rag|RAG]] (feed the model the specialized text) or [[fine-tuning]] (teach it the specialized patterns) — the entire premise of Levels 3 and 4.</p>
<div class="callout fail"><div class="ct">Why it breaks: garbage in, fluent garbage out</div>A model trained on data full of a particular bias will reproduce that bias confidently and fluently — it has no separate notion of "correct," only "common in my data" (recall the hallucination lesson). Teams have shipped models that absorbed toxic patterns or factual errors straight from unfiltered web data. You cannot out-prompt a data problem; you can only mitigate it with grounding, filtering, and evaluation.</div>`,
quiz:[
{q:"Why is a general model usually weaker at, say, specialized legal or medical reasoning?",o:["Those topics are banned in training","Specialized domain text is underrepresented on the open web that pretraining scrapes","Lawyers and doctors opt out of AI"],a:1,e:"The model learns the distribution of its data. Niche, proprietary, or expert text is scarce online, so capability there is thin — which is why RAG and fine-tuning target exactly these gaps."},
{q:"A customer reports your app is noticeably slower and pricier for Thai than for English. Likely cause?",o:["Thai servers are far away","The tokenizer splits Thai into many more tokens per sentence, and cost/speed are per-token","The model refuses non-English text"],a:1,e:"Tokenizers trained mostly on English fragment other languages into more tokens. More tokens = more cost and more time. It's a data/tokenizer artifact, not a network issue."}]},
{id:"l1b9",t:"Scale, scaling laws, and Mixture-of-Experts",min:6,src:"AIE ch.2 §Modeling",body:`
<p>For roughly the last decade, the field's most reliable strategy was almost embarrassingly blunt: <strong>make it bigger.</strong> More parameters, more data, more compute — and models got better, predictably. That predictability has a name: <strong>[[scaling laws]]</strong>.</p>
<p>Scaling laws say model quality (measured as loss — how well it predicts held-out text) improves as a smooth, mathematical function of three inputs: number of parameters, amount of training data, and compute spent. Smooth means <em>forecastable</em>: labs can run small experiments and extrapolate how a 10× bigger run will perform <em>before</em> spending the money. When a single training run costs tens or hundreds of millions of dollars, being able to predict the payoff is everything.</p>
<h2>How big, on how much data?</h2>
<p>A natural question: given a fixed compute budget, should you build a bigger model or train on more data? For years teams over-indexed on raw size. The influential <strong>Chinchilla</strong> finding (DeepMind) showed many famous large models were <em>undertrained</em> — for their size, they'd seen too little data. The <strong>[[compute-optimal]]</strong> recipe is to scale parameters and data <em>together</em>, roughly in proportion. This is why "how many parameters?" is the wrong first question; "how many parameters <em>and</em> how many training tokens?" is the right one. (A rough heuristic from Chinchilla: on the order of ~20 training tokens per parameter.)</p>
<h2>Emergence: the unsettling part</h2>
<p>Some abilities don't improve gradually — they're <strong>[[emergence|absent, then suddenly present]]</strong> past a certain scale. A capability a 1B model simply cannot do shows up in a 70B model. Emergence is exciting (you get abilities you didn't explicitly train for) and unsettling (you can't fully predict what the next model will and won't be able to do). It's a big reason the field moves in lurching surprises rather than smooth steps.</p>
<h2>The cheat code: Mixture-of-Experts</h2>
<p>Bigger models cost more to run, token for token — unless you cheat cleverly. <strong>[[mixture of experts|Mixture-of-Experts]] (MoE)</strong> splits the network into many "expert" sub-networks and, for each token, routes it to only a few of them. You get the <em>knowledge capacity</em> of a giant model while paying <em>compute</em> for only the small slice that's active. A model like Mixtral 8×7B has the parameter count of a large model but the per-token cost closer to a small one. MoE is one of the main tricks behind frontier models that are both very capable and economically servable — you'll meet its serving consequences again in Level 6.</p>
<div class="callout warn"><div class="ct">Scaling is hitting walls</div>"Just make it bigger" is running into limits: we're approaching the <strong>data</strong> ceiling (the high-quality public internet is finite, and synthetic data has its own pitfalls), and the <strong>energy and compute</strong> ceiling (frontier runs consume staggering electricity, and GPUs are scarce and regulated). The next gains increasingly come from better data, better post-training, and inference-time techniques — not size alone.</div>`,
quiz:[
{q:"What do scaling laws let a lab do?",o:["Guarantee a model never hallucinates","Predict how much a bigger training run will improve quality before spending the money","Train without any data"],a:1,e:"Scaling laws are smooth empirical relationships between parameters, data, compute, and quality — so labs extrapolate from small runs to forecast big ones. Crucial when a run costs nine figures."},
{q:"What problem does Mixture-of-Experts solve?",o:["It removes the need for training data","It gives a model huge knowledge capacity while activating only a few experts per token, keeping compute cost low","It eliminates hallucination"],a:1,e:"MoE decouples capacity from per-token compute: many experts store knowledge, but each token uses only a few. That's how some frontier models stay both capable and affordable to serve."},
{q:"Why is 'just make it bigger' slowing as a strategy?",o:["Models got too accurate","High-quality data is running out and frontier runs hit energy/compute and cost ceilings","Governments mandated smaller models"],a:1,e:"The data ceiling (finite quality web text) and the compute/energy ceiling both bite. Gains increasingly shift to data quality, post-training, and inference techniques — the rest of this course."}]}
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
{q:"Which task setup plays to an LLM's strengths?",o:["\"What were our company's exact Q3 2024 revenues?\" from memory","\"Here is our Q3 report: [text]. Summarize the three main risks.\"","\"Multiply 48,329 × 7,251 in your head\""],a:1,e:"Transforming provided text is the sweet spot. Precise recall from parameters and raw arithmetic are exactly the weak spots — give it the document, give it a calculator."}]},
{id:"l1c5",t:"Sampling, deeper: top-k, top-p, and why you get different answers",min:6,sim:"samplers",src:"AIE ch.2 §Sampling",body:`
<p>The temperature lesson showed <em>that</em> models roll a weighted die. Now let's open the hood, because sampling settings are knobs you'll turn in every project, and because sampling is the real reason behind two behaviors that confuse beginners: <strong>inconsistency</strong> and, in part, <strong>hallucination</strong>.</p>
<h2>How a token actually gets chosen</h2>
<p>At each step the model outputs a raw score (a <em>logit</em>) for every token in its [[vocabulary]]. A function called <strong>softmax</strong> turns those scores into probabilities that sum to 1. Then a sampling rule picks one. The common rules, which <em>stack</em>:</p>
<ul>
<li><strong>[[greedy decoding|Greedy]]</strong> ([[temperature]] 0): always take the single highest-probability token. Deterministic — same input, same output — but often flat and loop-prone.</li>
<li><strong>Temperature</strong>: before the roll, sharpen (low T) or flatten (high T) the distribution. Controls <em>how adventurous</em> the pick is.</li>
<li><strong>[[top-k]]</strong>: keep only the k most likely tokens, discard the rest, then roll. Caps <em>how many</em> candidates are eligible.</li>
<li><strong>[[top-p]]</strong> (nucleus): keep the smallest set of tokens whose probabilities add up to p (say 0.9), then roll. Caps the <em>cumulative mass</em> — adapts to how confident the model is at this step.</li></ul>
<p>Play with the demo: turn temperature up and watch the long tail of nonsense tokens come alive, then clamp it back down with top-k or top-p. Most production apps set a low temperature plus one of top-k/top-p for tasks with a right answer, and a moderate temperature for creative work.</p>
<h2>Spending compute to get better answers</h2>
<p>Because sampling is cheap to repeat, you can trade money for quality at generation time — <strong>[[test-time compute]]</strong>. The simplest form is <em>best-of-N</em>: sample several answers and pick the best (by a scorer or a majority vote). Letting a model reason step-by-step before answering is another form. You'll use these ideas in Level 2 (self-consistency) and meet their cost consequences in Levels 5–6 — quality you buy at inference time still costs latency and dollars.</p>
<h2>Structured outputs: putting sampling on rails</h2>
<p>Sometimes you need the output to be valid JSON, or one of exactly three labels — no prose, no surprises. <strong>[[structured output|Structured outputs]]</strong> constrain sampling so only tokens that keep the output validly-formatted are allowed. Under the hood the model still samples, but the menu at each step is filtered to what's legal. This is how you make an LLM a reliable component in a software pipeline instead of a chatty oracle (you'll wire this up in Levels 2–3).</p>
<div class="callout"><div class="ct">Sampling explains two famous behaviors</div><strong>Inconsistency:</strong> because the next token is sampled from a distribution, the same prompt can take different paths on different runs — which is why one good demo proves nothing and evaluation must run many times. <strong>Hallucination, in part:</strong> the model must emit <em>some</em> token even when its distribution is a vague smear with no confident answer; it samples a plausible-sounding one, formatted exactly like a fact. Sampling doesn't create hallucination by itself, but it's why a model rarely just says "I don't know" unless trained to.</div>`,
quiz:[
{q:"What does top-p (nucleus) sampling do that a fixed top-k doesn't?",o:["It guarantees the true answer","It adapts the number of eligible tokens to the model's confidence — few when peaked, more when flat — by capping cumulative probability","It makes generation deterministic"],a:1,e:"top-k always keeps exactly k tokens regardless of context. top-p keeps however many are needed to reach probability mass p, so it tightens when the model is sure and loosens when it isn't."},
{q:"You need an LLM to return exactly one of {approve, deny, review} so downstream code can branch on it. Best tool?",o:["Raise the temperature so it's creative","Structured/constrained outputs so only valid labels can be produced","Ask politely in the prompt and hope"],a:1,e:"Constrained decoding filters the per-step menu to legal tokens, guaranteeing parseable output. Prompts help but don't guarantee format; high temperature makes it worse."},
{q:"Why does the same prompt sometimes give substantively different answers?",o:["The model retrains between calls","Each step samples from a probability distribution, so runs can take different paths","Your internet connection varies"],a:1,e:"Non-zero temperature sampling means generation is a random walk through the distribution. That inherent variance is exactly why reliability must be measured over many runs, not asserted from one."}]}
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
]},
{title:"Why AI engineering exists",lessons:[
{id:"l1e1",t:"Why now: the three forces behind the boom",min:5,src:"AIE ch.1 §The Rise of AI Engineering",body:`
<p>People built AI applications for over a decade before "AI engineering" was a phrase — that work was called ML engineering or MLOps. So why did a distinct, explosively-growing discipline appear in the 2020s? Three forces converged.</p>
<h2>Force 1 — General-purpose capabilities</h2>
<p>[[foundation model|Foundation models]] aren't just better at existing tasks; they can do <em>more</em> tasks, including things previously thought impossible. Since a model can now write about as well as a person, you can automate (or half-automate) nearly any task that involves communication — which is almost every knowledge-work task. That vastly widens both the user base and the demand for AI. One model, thousands of applications.</p>
<h2>Force 2 — A surge of investment</h2>
<p>ChatGPT's success triggered a flood of money. As apps got cheaper to build and faster to ship, the return on AI investment climbed, and companies rushed in. Some figures from the period: Goldman Sachs estimated AI investment could approach <strong>$100 billion in the US and $200 billion globally by 2025</strong>. One in three S&amp;P 500 companies mentioned AI in their Q2-2023 earnings calls — <strong>three times</strong> the year before. One practitioner reported his use-case costs dropping <strong>two orders of magnitude</strong> (100×) in a single year as models and infrastructure improved.</p>
<h2>Force 3 — A collapsed barrier to entry</h2>
<p>This is the one that matters most for you. The <strong>[[model as a service]]</strong> approach — models exposed behind an [[api|API]] you call over the internet — means you no longer need GPUs, a serving stack, or ML expertise to use a state-of-the-art model. A single API call gets you frontier capability. And because these models <em>write code</em> and respond to <em>plain English</em> instructions, people without a software background can build too. As Sam Altman put it, the biggest opportunity for most people is adapting these models for specific applications.</p>
<div class="callout"><div class="ct">Why the name "AI engineering"?</div>The author surveyed practitioners and "AI engineering" was the preferred term. It's deliberately <em>not</em> "ML engineering" (working with foundation models differs in key ways — next lesson) and deliberately not an "-Ops" name (the focus is on <em>engineering</em> models to do what you want, not just operating them). The discipline grew out of ML engineering but is its own thing now.</div>
<p>The upshot: a once-esoteric field became something anyone with a laptop and curiosity can enter. That's why this course can take you from zero — the door is genuinely open in a way it wasn't five years ago.</p>`,
quiz:[
{q:"Which force most directly explains why a beginner can build a real AI app today?",o:["The surge in venture investment","Model-as-a-service APIs: frontier capability via a single call, no GPUs or ML expertise needed","Larger model parameter counts"],a:1,e:"The collapsed barrier to entry — hosted APIs plus models that take plain-English instructions and write code — is what put state-of-the-art models in everyone's hands. Investment and capability matter, but the API is the door."},
{q:"Why did the author pick 'AI engineering' over 'MLOps' or 'ML engineering'?",o:["It sounds more impressive","Working with foundation models differs from traditional ML, and the focus is engineering models rather than just operating them","The other terms were trademarked"],a:1,e:"AI engineering grew out of ML engineering but centers on adapting/evaluating pre-trained models — different enough to need its own name, and more 'engineering' than 'ops'."}]},
{id:"l1e2",t:"The AI stack, and how AI engineering differs from ML engineering",min:6,src:"AIE ch.1 §The AI Engineering Stack",body:`
<p>To cut through the daily flood of new tools, hold onto a stable mental model: every AI application stack has <strong>three layers</strong>. You usually start at the top and only descend as needed.</p>
<table>
<tr><th>Layer</th><th>What it does</th><th>Examples of work</th></tr>
<tr><td><strong>Application development</strong></td><td>Build on ready-made models: prompts, context, interfaces — and rigorous evaluation</td><td>Prompt engineering, [[rag|RAG]], [[evaluation]], the user-facing app</td></tr>
<tr><td><strong>Model development</strong></td><td>Make and shape models</td><td>Training, [[fine-tuning]], dataset engineering, [[inference]] optimization</td></tr>
<tr><td><strong>Infrastructure</strong></td><td>Serve and run it all</td><td>Model serving, compute/data management, [[observability|monitoring]]</td></tr>
</table>
<p>A telling data point: after ChatGPT, the <em>application</em> and <em>application-development</em> layers exploded in open-source activity, while the <em>infrastructure</em> layer grew slowly. Why? Because models and apps changed, but the core infra needs — resource management, serving, monitoring — stayed largely the same. Much of what ML engineers learned over the past decade still applies.</p>
<h2>Three ways AI engineering differs from ML engineering</h2>
<ol>
<li><strong>Adaptation, not training.</strong> Classic ML: you train your own model. AI engineering: you use a model someone else trained, and focus on <em>adapting</em> it. ML knowledge goes from must-have to nice-to-have.</li>
<li><strong>Bigger models, harder serving.</strong> Foundation models are huge, compute-hungry, and higher-latency, so inference optimization and working with GPUs/clusters matter far more.</li>
<li><strong>Open-ended outputs, harder evaluation.</strong> Classic ML often has a clear right answer (fraud / not fraud). Foundation models produce open-ended text with no single ground truth, which makes <strong>evaluation a much bigger problem</strong> — the through-line of this entire course.</li></ol>
<h2>Two families of adaptation</h2>
<p>Every adaptation technique falls into one of two buckets, defined by whether it touches the weights:</p>
<ul>
<li><strong>Prompt-based</strong> ([[prompt engineering]], [[rag|RAG]]): adapt the model by changing <em>what you give it</em> — instructions and context — without changing the model. Easy to start, little data needed, lets you try many models fast.</li>
<li><strong>Weight-based</strong> ([[fine-tuning]]): adapt the model by changing <em>the model itself</em>. More complex, needs more data, but can reach quality, latency, and behavior that prompting can't.</li></ul>
<div class="callout tip"><div class="ct">The workflow flipped</div>In classic ML you gather data and train a model first, then build the product. With foundation models you can build the product <em>first</em> on an off-the-shelf model, get real feedback, and only invest in data and fine-tuning once the idea proves out. This rewards fast iteration — and it's exactly why this course has you building from Level 2 onward instead of studying for months first.</div>`,
quiz:[
{q:"Which is the single biggest reason evaluation is harder in AI engineering than classic ML?",o:["Foundation models run on GPUs","Outputs are open-ended with no single ground truth, unlike close-ended tasks like fraud detection","APIs are rate-limited"],a:1,e:"A spam classifier has a correct label to check against. A chatbot reply has countless acceptable forms and no exhaustive answer key — so measuring quality is a genuine engineering problem, which this course treats as central."},
{q:"You add three worked examples to your prompt and the model improves — no weights changed. Which adaptation family is this?",o:["Weight-based (fine-tuning)","Prompt-based — you changed what you give the model, not the model itself","Neither; that's training"],a:1,e:"Giving instructions/examples/context without updating weights is prompt-based adaptation. Fine-tuning is the weight-based family — more powerful, more costly, reserved for when prompting falls short."}]}
]},
{title:"Deciding what to build",lessons:[
{id:"l1f1",t:"Should you build it at all?",min:5,src:"AIE ch.1 §Planning AI Applications",body:`
<p>It's easy to build a cool demo with foundation models. It's hard to build a profitable product. Before writing a line, a professional asks <em>why</em> — and sometimes the right answer is "don't." (If you're building purely to learn, ignore all this and jump in; building is the best way to learn. This lesson is about building for a living.)</p>
<h2>Start with the risk-or-opportunity behind the idea</h2>
<p>Most build decisions are responses to a risk or an opportunity, ordered here from highest stakes to lowest:</p>
<ol>
<li><strong>Existential threat.</strong> If competitors with AI could make you obsolete, adopting AI is top priority. In one 2023 survey, <strong>7%</strong> of executives cited "business continuity" — we might go out of business otherwise — as their reason. Common in document-heavy fields (finance, insurance, legal) and creative work (advertising, design).</li>
<li><strong>Profit and productivity.</strong> The common case: AI won't kill you, but it can cut costs, boost retention, generate leads, speed operations. Worth doing if the return beats the cost.</li>
<li><strong>Don't-fall-behind.</strong> You're unsure where AI fits but don't want to be Kodak or Blockbuster. Reasonable as R&amp;D <em>if you can afford it</em> — risky for a small startup that needs focus.</li></ol>
<h2>Then: build, or buy?</h2>
<p>Once the reason is solid, ask whether <em>you</em> must build it. If AI is an existential matter for your business, you may want it in-house rather than outsourced to a competitor. If you're merely chasing productivity, there are often buy options that are cheaper, faster, and better than rolling your own. Building everything from scratch is frequently the wrong call.</p>
<div class="callout warn"><div class="ct">The demo is the easy 80%</div>The base capabilities of foundation models are so good that a fun demo takes a weekend. That initial success is misleading — it tempts teams into building things that can never reach production quality, or that a model provider will absorb next quarter. "Can I demo it?" and "should I ship it?" are completely different questions. The next two lessons sharpen the second one.</div>`,
quiz:[
{q:"A small startup wants to build AI 'so we don't fall behind,' with no specific use case. The chapter's caution?",o:["Always build — momentum matters","Don't-fall-behind R&D is reasonable only if you can afford it; a focus-starved startup may be better off prioritizing a concrete use case","Never build without an existential threat"],a:1,e:"The three motivations are ordered by stakes. 'Don't fall behind' is the weakest; it's fine as affordable R&D but dangerous for a small team that should be prioritizing focus and a real problem."},
{q:"When does building AI in-house (vs buying) most clearly make sense?",o:["Whenever it's a productivity boost","When AI is an existential matter for the business and you don't want to depend on a competitor","Always — buying is never worth it"],a:1,e:"Existential stakes push toward in-house control. Pure productivity gains usually have good buy options that beat building from scratch on cost, speed, and quality."}]},
{id:"l1f2",t:"The role of AI in a product, and defensibility",min:6,src:"AIE ch.1 §Planning AI Applications",body:`
<p>Two products can both "use AI" and need completely different engineering. What role the AI plays decides your reliability bar, your latency budget, and your risk. Apple's product framework gives three useful axes:</p>
<ul>
<li><strong>Critical or complementary.</strong> Face ID can't work without AI (critical); Gmail's Smart Compose is a nicety (complementary). The more critical the AI, the higher its accuracy and reliability must be — people forgive mistakes in features they didn't depend on.</li>
<li><strong>Reactive or proactive.</strong> A chatbot reacts to a request; Google Maps traffic alerts appear unprompted. Reactive features usually must be <em>fast</em>. Proactive ones can be precomputed (latency matters less) but face a <em>higher quality bar</em> — uninvited low-quality suggestions feel intrusive.</li>
<li><strong>Dynamic or static.</strong> Dynamic features update continually with user feedback (per-user personalization, memory); static ones update only when the shared model is upgraded.</li></ul>
<h2>The role of humans</h2>
<p>Decide how much the AI decides. For a support bot: (a) AI drafts, humans send; (b) AI handles easy cases, routes hard ones to humans; (c) AI handles everything. Keeping a person in the path is <strong>[[human-in-the-loop]]</strong>. Microsoft's <strong>Crawl–Walk–Run</strong> framework ramps automation safely: <em>Crawl</em> = human involvement mandatory; <em>Walk</em> = AI interacts with internal employees; <em>Run</em> = AI interacts directly with external users. You earn each step with evidence — e.g. once 95% of AI-suggested replies to simple tickets are used verbatim, you let it answer those directly.</p>
<h2>Defensibility: the moat question</h2>
<p>The low barrier to entry is a blessing and a curse: easy for you to build means easy for competitors. Worse, if you build a thin layer over a model's current limitation, the next model version can <em>subsume</em> your product (the "wrapper" problem). A VC's blunt test: if your product could be a feature of Google Docs, what stops Google from assigning three engineers to replicate it in two weeks?</p>
<p>There are three classic moats: <strong>technology, data, and distribution</strong>. With shared foundation models, core tech is similar for everyone, and distribution favors incumbents. That leaves <strong>data</strong> as the most realistic moat for a newcomer: get to market first, gather usage data, and use it to improve faster than anyone can catch up — the <strong>[[data flywheel]]</strong>. (Calendly could've been a Google Calendar feature; Mailchimp a Gmail feature. Startups win by executing the overlooked feature better.)</p>
<div class="callout tip"><div class="ct">Carry this into design</div>Before building, place your feature on these axes. "Critical + reactive + fully automated" demands the strongest evaluation, the tightest latency, and the most guardrails — exactly the muscles Levels 2–6 build. "Complementary + proactive + human-in-the-loop" lets you ship sooner and learn. The classification is an engineering decision, not a marketing one.</div>`,
quiz:[
{q:"A proactive feature (uninvited suggestions) differs from a reactive one mainly how?",o:["It must always be faster","It can be precomputed so latency matters less, but it faces a higher quality bar because bad uninvited output feels intrusive","It never uses AI"],a:1,e:"Reactive features usually must respond fast; proactive ones can be precomputed and shown opportunistically, but since users didn't ask, low quality reads as annoying — so the quality bar rises."},
{q:"You're a startup whose product is a thin layer over an API's current weakness. Best moat to pursue?",o:["Out-engineer the foundation model on core technology","Get to market first and build a data flywheel — usage data that compounds into a lead","Rely on distribution against incumbents"],a:1,e:"Core tech is shared (everyone uses similar models) and distribution favors big players. Proprietary usage data, compounding via a flywheel, is the realistic moat — and it guards against being subsumed by the next model version."}]},
{id:"l1f3",t:"Setting expectations and the last mile",min:5,src:"AIE ch.1 §Planning AI Applications",body:`
<p>You've decided to build. Now define what success <em>means</em> — before you start, while you can still be honest about it.</p>
<h2>Tie it to business metrics, then a usefulness threshold</h2>
<p>The metric that matters most is business impact. For a support chatbot: what % of messages should it automate? How many more messages can you handle? How much faster do customers get answers? How much labor is saved? But automating more messages is worthless if users hate the answers — so track customer satisfaction too.</p>
<p>To avoid shipping something half-baked, set a <strong>usefulness threshold</strong>: how good it must be to be worth deploying. Spell it out across metric groups you'll meet throughout this course:</p>
<ul>
<li><strong>Quality</strong> — how good the responses are (the [[evaluation]] discipline of Levels 2–3).</li>
<li><strong>Latency</strong> — including [[ttft|TTFT]] (time to first token), [[tpot|TPOT]] (time per output token), and total time. "Acceptable" is relative: if humans currently answer in an hour, anything faster may be fine.</li>
<li><strong>Cost</strong> — dollars per request (Levels 5–6).</li>
<li>Plus others like interpretability and fairness where they apply.</li></ul>
<h2>The last mile is the whole game</h2>
<p>Here's the trap that sinks teams. Foundation models are so capable that you hit <strong>80% quickly</strong> — and badly underestimate the rest. Real reports: a paper noted "the journey from 0 to 60 is easy; 60 to 100 is exceedingly challenging." LinkedIn reached 80% of the experience they wanted in <strong>one month</strong> — then spent <strong>four more months</strong> clawing from there to 95%, fighting product kinks and [[hallucination]] the whole way. This is the <strong>[[last mile]]</strong>, and it is where the engineering actually lives.</p>
<h2>And it never stops: maintenance</h2>
<p>Shipping isn't the finish line. AI moves fast, which cuts both ways. Good changes (cheaper inference, longer contexts, better models) still cause churn — you might self-host to save money, only for providers to halve prices three months later. Some changes are harder: regulations (GDPR compliance was estimated to cost businesses <strong>$9 billion</strong>), compute export controls that can cut off your GPU supply overnight, and unsettled IP law. Building on foundation models means committing to ride a fast-moving train — and budgeting for the ride, not just the ticket.</p>
<div class="callout warn"><div class="ct">The most expensive sentence in AI</div>"The demo worked." A demo proves the happy path exists at 80%. Production is the other 20% — the weird inputs, the hostile users, the edge cases, the slow grind from 80 to 95 — plus maintaining it as the ground shifts. Everything from Level 2 onward is training for that 20%.</div>`,
quiz:[
{q:"A team hits 80% of their target quality in a month and assumes they're almost done. What does the last-mile lesson predict?",o:["They'll finish in a few days","The remaining 20% likely takes far longer than the first 80% — the 60→100 stretch is the hard part","Quality will plateau at 80% forever"],a:1,e:"Foundation models make the first 80% fast, which dangerously understates the rest. Real teams (e.g. LinkedIn) spent months on the final push against kinks and hallucination. Plan for the last mile."},
{q:"Why set a 'usefulness threshold' before deploying?",o:["To impress investors","To define how good — across quality, latency, and cost — the system must be before it's worth putting in front of users","Because the API requires it"],a:1,e:"Without an explicit bar across quality/latency/cost, you can't tell if the product is ready or just demo-good. The threshold turns 'feels fine' into a measurable deploy decision."}]}
]},
{title:"A first look at inference",lessons:[
{id:"l1g1",t:"Inference: where latency, throughput, and cost come from",min:6,src:"INF ch.0–1 §Prerequisites",body:`
<p>You've seen how models are <em>made</em>. Now meet the side of the field where most of the money is actually spent, and where Level 6 will eventually take you: <strong>[[inference]]</strong> — the act of running a trained model to produce an output for a request.</p>
<p>Training is a one-time (well, occasional) capital expense. Inference is the <em>forever</em> cost: every single user message, every API call, every generated token runs the model again. A model is trained once but serves <strong>billions</strong> of inferences over its life. That's why, for most deployed products, inference dominates the bill — and why making it faster and cheaper is a whole engineering specialty.</p>
<h2>Two phases, because models are autoregressive</h2>
<p>Recall that LLMs are [[autoregressive]] — they emit one token at a time. That gives every request two distinct phases, and they have very different performance characteristics:</p>
<ul>
<li><strong>[[prefill|Prefill]]</strong> — the model reads your entire prompt at once and builds up its internal state. This is parallel and fast-per-token, but its work grows with prompt length (long prompts cost real time before a single output token appears).</li>
<li><strong>[[decode|Decode]]</strong> — the model generates output tokens one by one, each depending on all the tokens before it. This is sequential and is usually the slow part: if each token takes 10 ms, a 100-token answer takes a full second, a 500-token answer five seconds.</li></ul>
<h2>The two metrics users actually feel</h2>
<p>These map directly onto how an AI product feels to use:</p>
<ul>
<li><strong>[[ttft|Time To First Token (TTFT)]]</strong> — how long until the first word appears. Dominated by prefill. This is the "is it frozen?" feeling. [[streaming|Streaming]] the answer token-by-token exists largely to keep TTFT-perceived-latency low.</li>
<li><strong>[[tpot|Time Per Output Token (TPOT)]]</strong> — how fast words stream after the first. Dominated by decode. This is the "is it typing at a readable pace?" feeling.</li></ul>
<p>Total time ≈ TTFT + (TPOT × number of output tokens). Notice the lever: <em>shorter outputs are faster outputs</em>. Asking a model to "answer in one sentence" isn't just style — it's latency engineering.</p>
<h2>Latency vs throughput: the trade-off that runs serving</h2>
<p>Two words that sound similar and pull in opposite directions:</p>
<ul>
<li><strong>[[latency]]</strong> — how fast <em>one</em> user gets their answer. A single-user concern.</li>
<li><strong>[[throughput]]</strong> — how many requests/tokens you serve <em>across all users</em> per second. A fleet-wide, cost concern.</li></ul>
<p>They trade off (<strong>[[throughput-vs-latency]]</strong>). The main tool, <strong>[[batching]]</strong>, runs many users' requests together through one expensive load of the model's weights — throughput soars, but any individual user may wait slightly longer. Choosing where to sit on that curve is one of the central decisions of inference serving. You'll build real intuition for it with interactive demos in Level 6; for now, just hold the three words — latency, throughput, cost — because every serving decision is a negotiation among them.</p>
<div class="callout tip"><div class="ct">Planting a flag for Level 6</div>Everything here is intuition-level on purpose. By Level 6 you'll compute these quantities: KV-cache memory, ops:byte arithmetic, p50/p95/p99 latencies, batch-size economics. The expert you're becoming can look at a serving setup and say not just "it's slow" but "it's decode-bound at this batch size, and here's the number that proves it."</div>`,
quiz:[
{q:"Why does inference, not training, dominate the cost of most deployed AI products?",o:["Training is free","A model is trained occasionally but runs an inference for every single request, billions of times over its life","Inference uses more expensive GPUs than training"],a:1,e:"Training is a periodic capital cost; inference is the per-request forever cost. Serve enough users and the cumulative inference bill dwarfs training — which is why optimizing it is a whole discipline."},
{q:"A user complains your assistant 'takes forever to start replying,' though it types quickly once it begins. Which metric is the problem?",o:["TPOT (time per output token) — the decode phase","TTFT (time to first token) — dominated by the prefill phase","Throughput"],a:1,e:"'Slow to start, then fine' is a TTFT problem, driven by prefill (reading the prompt). Fast typing once started means TPOT/decode is healthy. Long prompts and cold systems inflate TTFT."},
{q:"Batching many users' requests together mainly improves what, at what cost?",o:["Improves latency for each user, at the cost of throughput","Improves throughput (users served per second), at some cost to individual latency","Improves accuracy, at the cost of memory"],a:1,e:"Batching amortizes one expensive weight-load across many requests, boosting throughput, but a given user may wait a bit longer. That latency-vs-throughput trade is the core of serving economics."}]}
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
