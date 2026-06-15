window.COURSE_LEVELS = window.COURSE_LEVELS || [];
window.COURSE_LEVELS.push({
title:"Building Real Applications",
sub:"Embeddings, RAG, structured outputs, tool-calling agents, and guardrails — the architecture patterns behind nearly every serious LLM product.",
chapters:[
{title:"Embeddings & search",lessons:[
{id:"l3a1",t:"Embeddings: turning meaning into numbers",min:5,sim:"embedding",body:`
<p>Here's a problem prompting can't solve: a user asks "How do I get my money back?" and the answer lives in a document titled "Refund Policy". Keyword search fails — no shared words. You need search by <strong>meaning</strong>. Enter [[embedding|embeddings]].</p>
<p>An embedding model converts any text into a vector — a list of numbers (commonly 256–3,072 of them) representing its <em>meaning</em> as a position in space. The magic property: <strong>texts with similar meaning land near each other</strong>, regardless of wording. "Money back" and "refund policy" end up neighbors; "money back" and "GPU architecture" end up continents apart.</p>
<p>Closeness is measured with [[cosine similarity]] — do two vectors point the same direction? (Play with the demo above.) Getting an embedding is a one-liner:</p>
<pre><code>emb = client.embeddings.create(model="text-embedding-3-small",
                               input="How do I get my money back?")
vector = emb.data[0].embedding     # a list of 1,536 floats</code></pre>
<p>This unlocks far more than search: clustering similar support tickets, deduplication, recommendation ("articles like this one"), classification by nearest labeled example, and — the headline act — [[rag|RAG]], coming next.</p>
<div class="callout"><div class="ct">Mental model</div>An embedding is a GPS coordinate in "meaning space". The embedding model is the surveyor that assigns coordinates. Search becomes geometry: embed the question, find the nearest stored points.</div>`,
quiz:[
{q:"Why does embedding search find 'Refund Policy' for the query 'how do I get my money back'?",o:["The words match","Both texts map to nearby vectors because their MEANINGS are similar, despite zero shared keywords","The document was manually tagged"],a:1,e:"That's the entire point of embeddings: similarity of meaning becomes proximity in vector space. Wording stops mattering."},
{q:"What is cosine similarity used for?",o:["Compressing models","Measuring how similar two embedding vectors (and hence two texts' meanings) are","Counting tokens"],a:1,e:"Cosine similarity scores directional alignment between vectors — the standard 'how related are these two texts' metric."}]},
{id:"l3a2",t:"Vector databases and the search pipeline",min:4,body:`
<p>With thousands or millions of document chunks, you can't compare a query against every vector one by one. A [[vector database]] stores embeddings in clever index structures that find the nearest neighbors in milliseconds, even at huge scale.</p>
<p>Options you'll encounter: <strong>Chroma</strong> (runs locally, perfect for learning — you'll use it in this level's project), <strong>Qdrant</strong> and <strong>Weaviate</strong> (production open-source), <strong>Pinecone</strong> (managed cloud), <strong>pgvector</strong> (vectors inside Postgres — popular because it's one less system to run).</p>
<p>The indexing pipeline — run once per document, and re-run when documents change:</p>
<ol>
<li><strong>Load</strong> — read PDFs, pages, wikis into text</li>
<li><strong>[[chunking|Chunk]]</strong> — split into retrieval-sized pieces</li>
<li><strong>Embed</strong> — vector per chunk</li>
<li><strong>Store</strong> — vectors + original text + metadata (source, date, section) into the DB</li></ol>
<p>And the query pipeline — every user question:</p>
<ol>
<li>Embed the question <em>(with the same model used for indexing — mixing models breaks everything silently)</em></li>
<li>Fetch the top-k nearest chunks (k typically 3–10)</li>
<li>Optionally filter by metadata (only this user's docs, only docs after 2024)</li></ol>
<div class="callout warn"><div class="ct">Classic silent failure</div>Index with embedding model A, later query with model B — the system runs without errors and returns garbage, because the two models place texts in completely different coordinate systems. Record which embedding model built each index, and re-embed everything when you change it.</div>`,
quiz:[
{q:"Why must the query be embedded with the SAME model that embedded the documents?",o:["For billing consistency","Different models use incompatible coordinate systems — distances between their vectors are meaningless","The database rejects other models"],a:1,e:"Each embedding model defines its own meaning-space. Mixing spaces fails silently: no errors, just irrelevant results. A notorious production gotcha."}]},
{id:"l3a3",t:"Chunking: the unglamorous knob that decides quality",min:4,sim:"chunking",body:`
<p>Before embedding, documents get split into chunks — and this mundane-sounding step has outsized impact on retrieval quality. The tension (drag the slider above to feel it):</p>
<ul>
<li><strong>Too small</strong> (a sentence): precise matching, but retrieved fragments lack the context to answer anything ("the limit is 30 days" — the limit on <em>what</em>?)</li>
<li><strong>Too large</strong> (whole pages): plenty of context, but each chunk mixes many topics, so its single embedding is a diluted average that matches queries poorly — and big chunks waste context-window budget</li></ul>
<p>Sane starting points (then tune by measuring, not by vibes):</p>
<ul>
<li>300–800 tokens per chunk with 10–20% overlap between consecutive chunks, so sentences cut at a boundary survive in the neighbor</li>
<li><strong>Respect structure</strong> — split at paragraphs, sections, headings rather than mid-sentence; for code, split at functions. Structure-aware beats fixed-size nearly always.</li>
<li><strong>Attach metadata</strong> — store each chunk's document title and section heading alongside it; a chunk saying "the limit is 30 days" becomes useful when prefixed "Refund Policy → Returns window".</li></ul>
<p>Advanced variants exist (semantic chunking, summaries-of-chunks, parent-document retrieval — retrieve small, hand the model the surrounding larger section), but tune the basics first: chunk size, overlap, and structure-awareness account for most of the gain.</p>`,
quiz:[
{q:"What's the core trade-off in chunk size?",o:["Cost vs. legality","Small = precise matching but starved context; large = rich context but diluted, mushy embeddings","Speed vs. security"],a:1,e:"Each chunk gets ONE vector. Focused chunk = sharp vector = good matching. Sprawling chunk = averaged vector = poor matching. But the chunk must still contain enough to be useful once retrieved."},
{q:"Why add overlap between consecutive chunks?",o:["To increase the database size","So information near a chunk boundary isn't split into two useless halves","Embedding models require it"],a:1,e:"A sentence cut in half at a boundary may match nothing. Overlap ensures boundary content appears whole in at least one chunk."}]},
{id:"l3a4",t:"How retrieval actually finds things: keywords, vectors, hybrid",min:6,src:"AIE ch.6 §RAG",body:`
<p>"Find the relevant chunks" sounds simple, but <em>how</em> you search decides what you find. There are two fundamentally different strategies, and the best systems use both.</p>
<h2>Sparse: match the words ([[bm25|BM25]])</h2>
<p><strong>[[sparse retrieval|Keyword search]]</strong> represents a document by which words it contains and ranks by overlap with the query's words. The standard algorithm is <strong>[[bm25|BM25]]</strong> — decades old, no model required, and still excellent. It weights rare words more (matching "tokenization" matters more than matching "the") and dampens the effect of very long documents. Its superpower: <strong>exact matches</strong> — product codes, error numbers, names, acronyms, an exact phrase. Its blind spot: it has no idea that "car" and "automobile" mean the same thing.</p>
<h2>Dense: match the meaning (embeddings)</h2>
<p><strong>[[dense retrieval|Embedding search]]</strong> (you just built one) represents each document as a vector of meaning and ranks by [[cosine similarity]]. Its superpower is the mirror image of BM25's: it matches <strong>meaning</strong> across different words ("how long to send something back" finds "30-day return policy"). Its blind spot: it can <em>miss exact tokens</em> — a precise part number might embed near lots of vaguely-similar text and get buried.</p>
<h2>Hybrid: use both</h2>
<p>Notice the strengths are complementary: BM25 nails exact terms, embeddings nail paraphrases. <strong>[[hybrid search]]</strong> runs both and merges the results (a common merge is Reciprocal Rank Fusion — combine the rank positions from each list). This is the default for serious RAG, because real queries contain <em>both</em> exact terms ("error E-1042") and fuzzy intent ("why won't it start").</p>
<table>
<tr><th>Need</th><th>Best retriever</th></tr>
<tr><td>Exact code / name / phrase</td><td>Keyword (BM25)</td></tr>
<tr><td>Paraphrased / conceptual question</td><td>Embeddings (dense)</td></tr>
<tr><td>Real-world mix of both</td><td>Hybrid</td></tr>
</table>
<div class="callout tip"><div class="ct">Don't reach for embeddings reflexively</div>Beginners assume "RAG = embeddings." But for a knowledge base full of part numbers, legal citations, or code identifiers, plain BM25 often beats a pure vector search — and it's cheaper and simpler (no embedding API, no vector DB). Measure both on your data. Frequently the answer is hybrid; sometimes it's just keywords.</div>`,
quiz:[
{q:"A user searches your support docs for the exact error code 'ERR_4821'. Which retriever is most reliable here, and why?",o:["Embeddings — they understand meaning","Keyword/BM25 — exact tokens like codes are its strength; embeddings can bury an exact string among vaguely-similar text","Neither can find codes"],a:1,e:"Exact identifiers are sparse retrieval's home turf. Dense embeddings match meaning and may rank the precise code below semantically-similar prose. This is exactly why hybrid exists."},
{q:"Why is hybrid search the default for serious RAG?",o:["It's cheaper than either alone","Real queries mix exact terms and fuzzy intent; keyword nails the former, embeddings the latter, so combining them covers both","Vector databases require it"],a:1,e:"BM25 and embeddings have complementary blind spots. Merging their results captures exact matches AND semantic matches, which single-method retrieval misses."}]},
{id:"l3a5",t:"🧪 Lab: Real embeddings, real retrieval — build a mini-RAG",min:8,lab:true,sim:"ragreal",src:"AIE ch.6 §RAG",body:`
<p>Enough theory — let's retrieve for real. The lab below is a genuine [[dense retrieval|dense retriever]]: it sends your query and a small document corpus to the live <strong>embeddings API</strong> (<code>text-embedding-3-small</code>), computes [[cosine similarity]] in your browser, and ranks the documents. This is the actual machinery inside every RAG system, with nothing faked.</p>
<p>Things to try, and what to notice:</p>
<ul>
<li>The default query — "how long do I have to send something back?" — shares <em>almost no words</em> with the winning document ("...refunds within 30 days..."). Watch dense retrieval match it anyway. That's meaning over words.</li>
<li>Ask "do you take Bitcoin?" — see it surface the payments document (which mentions crypto) even though you said Bitcoin.</li>
<li>Ask something the corpus can't answer ("what's your CEO's name?") — watch <em>every</em> score stay low. <strong>This is the signal a good RAG app uses to refuse</strong> instead of hallucinating: if the top similarity is weak, there's no real context, so don't pretend.</li></ul>
<div class="callout tip"><div class="ct">You just built the heart of RAG</div>Embed the corpus once (cached), embed each query, rank by cosine, take the top chunk(s), paste into the prompt. Everything else in RAG — chunking, hybrid search, reranking, query rewriting — is refinement around this core loop. When you build your Level 3 project, this is the engine under it.</div>
<p>The corpus embeds once and is cached; each query is one tiny embedding call (fractions of a cent).</p>`,
quiz:[
{q:"In the lab, your query and the matching document share almost no words, yet it ranks first. What made that work?",o:["Hidden keyword matching","Embeddings place text by meaning, so semantically-related sentences have high cosine similarity regardless of shared words","The API was told the answer"],a:1,e:"That's dense retrieval: meaning becomes geometry. Close meaning → vectors point the same way → high cosine — no word overlap required."},
{q:"For an out-of-scope query, every similarity score is low. How should a well-built RAG app use that?",o:["Return the highest-scoring chunk anyway","Treat weak top-similarity as 'no real context found' and refuse or say it doesn't know, instead of hallucinating","Raise the temperature to be creative"],a:1,e:"A low best-match is the app's cue that the answer isn't in the corpus. Honest refusal beats confidently grounding on irrelevant text — a key reliability habit you'll bake into your project."}]}
]},
{title:"RAG",lessons:[
{id:"l3b1",t:"RAG: the architecture that powers everything",min:5,sim:"rag",body:`
<p>[[rag|Retrieval-Augmented Generation]] is the single most deployed LLM architecture in industry, and you already understand all its parts. The insight: <strong>don't make the model remember — let it read.</strong></p>
<p>Per question:</p>
<ol>
<li><strong>Retrieve</strong> — embed the question, pull the top-k most relevant chunks from your vector DB</li>
<li><strong>Augment</strong> — paste those chunks into the prompt as context</li>
<li><strong>Generate</strong> — instruct: <em>"Answer using only the provided context. Cite which chunk supports each claim. If the context doesn't contain the answer, say so."</em></li></ol>
<p>What this buys, mapped to Level 1's pain points:</p>
<ul>
<li><strong>Hallucination ↓</strong> — the model quotes from text in front of it instead of recalling from fuzzy parameters</li>
<li><strong>Fresh & private knowledge</strong> — update the document store, the system knows it instantly; no retraining, and your data stays in your database (only retrieved snippets travel per-request)</li>
<li><strong>Citations</strong> — answers can link the exact source chunk, so users can verify</li>
<li><strong>Cheap iteration</strong> — adding knowledge = adding documents. Compare: fine-tuning runs.</li></ul>
<p>Try the mini retrieval engine above — type different questions and watch chunks compete for relevance.</p>
<div class="callout"><div class="ct">Why this beats long context windows</div>"Just paste everything into the 128k window!" — tempting, but: companies have gigabytes (windows hold megabytes), you'd pay for 100k tokens per question, [[prefill]] latency grows with prompt length, and attention degrades over huge contexts. Retrieval sends the right 2k tokens instead of all 100k. Long windows and RAG are complements, not rivals.</div>`,
quiz:[
{q:"How does RAG reduce hallucination?",o:["It uses a bigger model","It changes the task from 'recall from parameters' to 'read and cite the provided text' — grounded generation","It sets temperature to zero"],a:1,e:"Models are much more reliable transforming text they can see than recalling facts from compressed weights (the Level 1 field guide!). RAG plays to the strength."},
{q:"Your RAG bot must answer from documents updated daily. Why is this trivially handled?",o:["Models retrain themselves nightly","New knowledge = new documents in the vector store — re-index the changes and every future answer can use them","It isn't — daily updates require fine-tuning"],a:1,e:"Knowledge lives in the retrieval store, not the model. This decoupling of knowledge from weights is RAG's superpower."}]},
{id:"l3b2",t:"Why RAG fails (and how to diagnose it)",min:5,body:`
<p>RAG demos take a day; reliable RAG takes engineering. When answers are bad, the cardinal rule is: <strong>find WHERE the pipeline failed before changing anything.</strong> Two failure families:</p>
<p><strong>Retrieval failures</strong> — the right chunks never reached the model:</p>
<ul>
<li>Query/document vocabulary mismatch too extreme even for embeddings</li>
<li>Bad chunking split the answer across pieces</li>
<li>The answer requires <em>combining</em> many chunks ("compare X across all 12 reports") — top-k retrieval fundamentally can't gather that</li>
<li>The answer simply isn't in the corpus (surprisingly common; nobody checked)</li></ul>
<p><strong>Generation failures</strong> — the right chunks arrived, the model still flubbed:</p>
<ul>
<li>Ignored context and answered from its own parameters anyway</li>
<li>Mashed contradictory chunks into a confident muddle</li>
<li>Answered beyond the context without flagging it (hallucination's sneaky return)</li></ul>
<p><strong>The diagnostic move:</strong> log retrieved chunks with every answer, and when an answer is wrong, look at them. Right chunks present → generation problem (fix the prompt, demand citations, try a stronger model). Right chunks absent → retrieval problem (fix chunking, embeddings, or query handling). This one habit turns RAG debugging from guesswork into procedure.</p>
<p>Evaluate the stages separately, too: <strong>retrieval</strong> (for test questions with known source chunks — did they rank in the top k?) and <strong>generation</strong> ([[llm-as-judge]] scoring <em>faithfulness</em>: is every claim supported by the retrieved context?).</p>
<div class="callout fail"><div class="ct">Real-world failure</div>Air Canada's support chatbot invented a bereavement-fare refund policy that didn't exist. A tribunal ruled the airline legally bound to honor what its bot promised. The cautionary detail: a faithfulness check — "is this claim supported by a retrieved policy document?" — is exactly the guardrail that was missing.</div>`,
quiz:[
{q:"A RAG answer is wrong. What's the FIRST diagnostic step?",o:["Switch to a bigger model","Inspect the retrieved chunks: did the right information reach the model at all?","Rewrite the system prompt"],a:1,e:"Retrieval failure and generation failure have completely different fixes. Looking at retrieved chunks tells you which problem you have. Diagnose, then treat."},
{q:"Test questions reveal the right chunks ARE retrieved, but answers contradict them. Where do you work?",o:["Chunking strategy","The generation side: prompt instructions, citation requirements, faithfulness checks, maybe model choice","The embedding model"],a:1,e:"Retrieval is doing its job. The model is ignoring or garbling context — a generation-side problem with generation-side fixes."}]},
{id:"l3b3",t:"Advanced RAG: the upgrade menu",min:5,body:`
<p>Once basic RAG works and is <em>measured</em>, these upgrades attack specific weaknesses. (Order matters: an unmeasured upgrade is just a guess with extra steps.)</p>
<ul>
<li><strong>Hybrid search</strong> — combine embedding similarity with classic keyword scoring (BM25). Embeddings catch meaning; keywords catch exact part numbers, names, error codes that embeddings blur. Most production systems run both and merge results.</li>
<li><strong>[[reranker|Reranking]]</strong> — vector search optimizes for speed over millions of chunks; rerankers optimize for accuracy over a few dozen. Retrieve 25 candidates fast, then a reranker model scores each (query, chunk) pair carefully and keeps the best 5. Often the single best quality-per-effort upgrade.</li>
<li><strong>Query rewriting</strong> — users type fragments, follow-ups ("what about for students?"), and typos. An LLM call first rewrites the query into a self-contained question using conversation history. Cheap, big gains in chat-based RAG.</li>
<li><strong>Metadata filtering</strong> — "only contracts," "only 2025," "only this customer's documents" — filter before/while searching. Also your <em>access-control</em> layer: never retrieve documents the asking user isn't allowed to see.</li>
<li><strong>Agentic RAG</strong> — for questions needing multiple lookups ("compare our parental-leave policy with the legal minimum"), let the model issue several searches, read, and search again — a preview of the next chapter.</li></ul>
<div class="callout tip"><div class="ct">Engineering discipline</div>This menu is where teams burn months adding complexity nobody measured. The rule: have a retrieval eval (recall@k on known-answer questions), add ONE upgrade, re-measure. Hybrid search and reranking usually pay first. Exotic techniques usually don't — but now you'd know.</div>`,
quiz:[
{q:"Searches for exact product codes like 'XR-2041b' keep failing in your embedding-based RAG. Best targeted fix?",o:["Bigger chunks","Hybrid search — add keyword matching, which handles exact identifiers that embeddings blur","Higher temperature"],a:1,e:"Embeddings encode meaning; an alphanumeric SKU has little 'meaning' to encode. Keyword/BM25 search nails exact strings — combine both."},
{q:"What's the right way to adopt advanced RAG techniques?",o:["Add them all upfront — more is better","One at a time, against a retrieval eval, keeping only what measurably helps","Wait for vendors to add them automatically"],a:1,e:"Each adds complexity, latency, and cost. Measurement separates upgrades from cargo cult. (Notice evaluation appearing in every chapter? That's the job.)"}]}
]},
{title:"Structure & tools",lessons:[
{id:"l3c1",t:"Structured outputs: making AI speak machine",min:4,body:`
<p>Chat is for humans. Software needs [[structured output|structured data]]. The moment your model's answer feeds another program — a database, a UI, an if-statement — free-text breaks: <em>"Sure! The sentiment seems mostly positive 😊"</em> is unparseable garbage to code expecting <code>{"sentiment": "positive"}</code>.</p>
<p>The modern fix is built into APIs: define a schema, and the API <strong>guarantees</strong> conforming [[json|JSON]] (under the hood, sampling is constrained so only schema-valid tokens can be generated):</p>
<pre><code>from pydantic import BaseModel

class Invoice(BaseModel):
    vendor: str
    total: float
    currency: str
    due_date: str | None      # None if absent — give uncertainty an exit!

r = client.chat.completions.parse(          # note: .parse
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": f"Extract the invoice data:\\n{text}"}],
    response_format=Invoice,
)
inv = r.choices[0].message.parsed
print(inv.total, inv.currency)              # real typed Python objects</code></pre>
<p>Design notes that separate clean systems from flaky ones:</p>
<ul>
<li><strong>Optional fields for uncertainty</strong> — a <code>None</code>-able field lets the model say "not present" instead of inventing a date (hallucination defense, again)</li>
<li><strong>Enums for categories</strong> — constrain <code>sentiment</code> to exactly <code>positive|negative|mixed</code> and typo-labels become impossible</li>
<li><strong>Schema validity ≠ correctness</strong> — the JSON will always parse; the <em>values</em> can still be wrong. Evaluation remains on duty.</li></ul>
<p>This pattern quietly powers half of "AI features" in real products: extraction, tagging, routing, form-filling — LLM in, clean typed data out.</p>`,
quiz:[
{q:"What does structured output mode guarantee — and not guarantee?",o:["Guarantees correct values","Guarantees schema-valid JSON; the values can still be wrong","Guarantees nothing"],a:1,e:"Constrained generation makes malformed output impossible — a huge reliability win. But a perfectly formatted wrong total is still wrong. Evals catch that."},
{q:"Why make due_date optional (None-able) in an extraction schema?",o:["To save tokens","If the field is required, a model facing an invoice without a due date is cornered into inventing one","Dates can't be required in JSON"],a:1,e:"Required fields force an answer. Optional fields give the model a legitimate 'absent' — structural hallucination defense."}]},
{id:"l3c2",t:"Function calling: giving the model hands",min:5,body:`
<p>Models can't browse, calculate reliably, check your database, or send email. [[function calling|Function calling]] fixes this — not by giving the model abilities, but by letting it <strong>ask your code</strong> to act.</p>
<p>The loop (your code is in charge at every step):</p>
<ol>
<li>You describe available tools — name, purpose, parameters: <code>get_weather(city)</code>, <code>search_orders(customer_id)</code></li>
<li>The model, when it decides a tool would help, replies not with prose but with a structured call: <code>{"name": "get_weather", "arguments": {"city": "Mumbai"}}</code></li>
<li><strong>Your code</strong> validates and executes the actual function</li>
<li>You send the result back; the model weaves it into its answer</li></ol>
<p>The model never runs anything. It <em>requests</em>; you <em>execute</em>. This boundary is exactly where safety lives:</p>
<ul>
<li><strong>Validate arguments</strong> — treat tool calls like user input: check IDs, ranges, permissions before executing</li>
<li><strong>Least privilege</strong> (Level 2's lesson, now concrete) — expose only the tools this feature needs; reading orders ≠ refunding orders</li>
<li><strong>Approval gates</strong> — consequential tools (send, pay, delete) return "pending human confirmation" instead of executing</li></ul>
<p>Tool descriptions are prompts, too: a vague description ("searches stuff") yields wrong tool choices; a precise one ("Search customer orders by ID. Returns the 10 most recent with status and totals.") yields good ones. The ecosystem is converging on standards for sharing tools across apps — MCP (Model Context Protocol) being the prominent one — but the mechanics are exactly what you just learned.</p>`,
quiz:[
{q:"In function calling, who actually executes the function?",o:["The model, inside the datacenter","Your code — the model only emits a structured request","The API provider's servers"],a:1,e:"The model proposes; your code disposes. That separation is the safety boundary: validation, permissions, and approval gates all live on your side."},
{q:"Your support bot needs to look up order status. Which toolset follows least privilege?",o:["get_order_status(order_id) only","Full database read/write access — flexibility for the future","get_order_status plus issue_refund, just in case"],a:0,e:"Grant the minimum capability for the feature. Every extra tool is attack surface — remember prompt injection: assume the model can be manipulated, and cap what manipulation can reach."}]},
{id:"l3c3",t:"Agents: models in loops",min:6,body:`
<p>One tool call answering one question is a workflow. An [[agent]] is what happens when you put the model in a <strong>loop</strong>: it chooses an action, observes the result, thinks, and acts again — until it decides the task is done.</p>
<pre><code># the agent loop, conceptually
while not done:
    decision = llm(history + tools)        # reason: what next?
    if decision.is_tool_call:
        result = execute(decision)          # act (your code!)
        history += [decision, result]       # observe
    else:
        done = True                         # final answer</code></pre>
<p>This reason→act→observe cycle (the "ReAct" pattern) lets agents handle tasks no single prompt can: "Find the three customers with the most late invoices and draft reminder emails for each" — requires queries, reading results, deciding, drafting, iterating.</p>
<p>Now the engineering reality check — agent failure modes are the field's running joke and budget sink:</p>
<ul>
<li><strong>Error compounding</strong> — a 95%-reliable step compounds to ~60% success over 10 steps (0.95<sup>10</sup>). Long chains need checkpoints, retries, and validation between steps.</li>
<li><strong>Loops and wandering</strong> — agents retry failed approaches forever or drift off-task. Always cap iterations and budget.</li>
<li><strong>Context bloat</strong> — every step's results pile into the window; long tasks drown. Summarize or prune as you go.</li>
<li><strong>Injection amplification</strong> — an agent that <em>reads</em> external content and <em>holds</em> tools is the maximum-risk configuration: a poisoned webpage can steer real actions. Least privilege + approval gates are non-negotiable here.</li></ul>
<div class="callout tip"><div class="ct">The autonomy dial</div>Treat autonomy as a dial, not a binary. Fixed workflow with LLM steps → model picks branches → full agent loop. Use the LEAST autonomy that solves the problem: more autonomy = more capability = less predictability = harder evaluation. Many "agent" products in production are mostly workflows — on purpose, and wisely.</div>`,
quiz:[
{q:"Why do long agent task chains fail so often even when each step is good?",o:["APIs limit chain length","Errors compound — 95% per-step reliability is only ~60% over ten dependent steps","Models refuse long tasks"],a:1,e:"Multiplication is brutal. Production agents fight it with validation between steps, retries, checkpoints — and by keeping chains short."},
{q:"Which configuration is the highest injection risk?",o:["A chatbot with no tools","An agent that reads external content AND holds consequential tools","A classifier with structured output"],a:1,e:"Reading external content = attacker input channel. Holding tools = attacker capabilities. Together they turn a hijacked model into a hijacked actor. Cap each side."}]}
]},
{title:"Guardrails & polish",lessons:[
{id:"l3d1",t:"Guardrails: the safety sandwich",min:4,body:`
<p>Production LLM systems wrap the model in checks on both sides — input [[guardrails]] before, output guardrails after. The "safety sandwich":</p>
<p><strong>Input side:</strong></p>
<ul>
<li><strong>Scope filter</strong> — your insurance bot shouldn't discuss elections; a tiny classifier (or cheap LLM call) deflects off-topic inputs before they reach your expensive model</li>
<li><strong>Injection screening</strong> — flag "ignore previous instructions"-shaped patterns in user input and retrieved content</li>
<li><strong>PII handling</strong> — detect and mask personal data you shouldn't process or forward to third-party APIs</li></ul>
<p><strong>Output side:</strong></p>
<ul>
<li><strong>Moderation</strong> — providers offer free moderation endpoints; toxic/unsafe outputs get blocked or replaced</li>
<li><strong>Faithfulness checks</strong> — for RAG: a verifier asks "is every claim supported by the retrieved context?" (the Air Canada vaccine)</li>
<li><strong>Format/business validation</strong> — schema-valid? Discount within allowed range? Refund under the bot's limit? Plain old code, doing what code does best</li>
<li><strong>Secret scanning</strong> — nothing in the output that looks like a key, internal URL, or system prompt leak</li></ul>
<p>Each check adds latency and cost — run them in parallel where possible, and size them to stakes: a brainstorming toy needs little; a bot that can promise customers money needs the full sandwich.</p>
<div class="callout"><div class="ct">Design stance</div>Guardrails assume the model WILL sometimes misbehave — through attack, hallucination, or bad luck — and make the <em>system</em> safe anyway. Hope is not a control. Layers are.</div>`,
quiz:[
{q:"Why are output guardrails needed even with a great system prompt?",o:["They aren't, if the prompt is good","Prompts are instructions, not enforcement — injection, hallucination, and sampling randomness can all break them","Output checks make responses faster"],a:1,e:"A prompt is a polite request to a statistical process. Guardrails are enforcement. Production safety = layers, each assuming the previous can fail."},
{q:"Your RAG bot's answer claims a policy detail not present in any retrieved chunk. Which guardrail catches this?",o:["Input scope filter","A faithfulness verifier comparing output claims against retrieved context","PII masking"],a:1,e:"Faithfulness checking is the RAG-specific output guardrail — exactly what was missing in the Air Canada incident."}]},
{id:"l3d2",t:"Latency, cost, and caching: making it feel good",min:4,sim:"costcalc",body:`
<p>Users forgive a lot, but not waiting. And finance forgives nothing. The practical levers, in rough order of impact:</p>
<ul>
<li><strong>Stream everything user-facing</strong> — [[streaming]] cuts <em>perceived</em> latency from "10 seconds of spinner" to "instant start". The single cheapest UX win in AI.</li>
<li><strong>Right-size the model per step</strong> — classification, routing, query rewriting → mini models; final user-facing answers → big models. Pipelines mixing tiers cut cost 5–10× ([[model cascade|cascades]], formalized in Level 5).</li>
<li><strong>Cache aggressively</strong> — exact-match caching for repeated requests; provider-side <em>prompt caching</em> discounts re-sent identical prefixes (your long system prompt + few-shot examples!) by 50–90%. Structure prompts static-part-first to exploit it.</li>
<li><strong>Trim the prompt</strong> — every token costs money and prefill time on every call. That 2,000-token system prompt? It's billed per request, forever. Audit it.</li>
<li><strong>Cap outputs</strong> — verbose answers cost output tokens (the expensive kind) and reading time. Ask for concision; set max_tokens as a backstop.</li></ul>
<p>Play with the calculator above — especially the model-tier dropdown. The frontier-vs-mini gap at scale is the difference between a viable product and a dead one.</p>`,
quiz:[
{q:"What does streaming actually improve?",o:["Total generation time","Perceived latency — users see tokens immediately instead of waiting for the full answer","Token costs"],a:1,e:"Same total time, transformed experience. Time-to-first-token is the metric users feel — and you'll meet it again as TTFT in Level 6."},
{q:"Why structure prompts with the static parts (system prompt, examples) FIRST?",o:["Models read the beginning more carefully","Prompt caching discounts repeated identical prefixes — static-first maximizes the cacheable prefix","JSON requires it"],a:1,e:"Provider-side prefix caching can cut input costs dramatically, but only for the unchanged leading portion. Put the variable parts (user question, retrieved chunks) last."}]}
]}
],
project:{id:"l3gate",t:"Project Gate 3 — Chat with your documents",
body:`
<p>The flagship build: a complete RAG application over documents you choose — your notes, manuals, articles, anything you'd genuinely like to query. This project is the industry's bread and butter; build it well and you can describe a production-pattern system in any interview.</p>
<h2>Setup</h2>
<pre><code>pip install chromadb openai python-dotenv pypdf</code></pre>
<p>Gather 5–20 documents you actually care about (PDFs or .txt files) into a <code>docs/</code> folder.</p>
<h2>Part A — Indexing pipeline (<code>index_docs.py</code>)</h2>
<ul>
<li>Load each document's text (pypdf for PDFs)</li>
<li>Chunk: ~500 tokens (~2,000 characters) with ~15% overlap, splitting at paragraph boundaries where possible</li>
<li>Embed each chunk (<code>text-embedding-3-small</code>) and store in Chroma with metadata: source filename + chunk position</li>
<li>Print a summary: documents loaded, chunks created</li></ul>
<h2>Part B — Query loop (<code>ask_docs.py</code>)</h2>
<ul>
<li>Read a question, embed it, retrieve top-5 chunks</li>
<li>Build the prompt: system message demanding grounded answers with [source] citations and an explicit "If the context doesn't contain the answer, say so"; context block with the chunks (labeled by source); the question</li>
<li>Print the answer AND the retrieved chunk sources (your debugging window — the diagnostic lesson made real)</li></ul>
<h2>Part C — Evaluate it (<code>eval_rag.py</code>)</h2>
<ul>
<li>Write 10 test questions where YOU know which document holds the answer — include 2 questions whose answers are NOT in your documents at all</li>
<li>Retrieval score: was the correct source among the retrieved chunks? (x/8)</li>
<li>Behavior score: did the 2 impossible questions get honest "not in my documents" responses instead of hallucinations? (x/2)</li>
<li>Tune ONE thing (chunk size, k, prompt wording), re-run, document the change</li></ul>
<h2>Stretch</h2>
<p>Add conversation memory with query rewriting: resolve follow-up questions ("and what about X?") into self-contained queries before retrieval.</p>`,
checklist:[
"My indexing pipeline chunks, embeds, and stores my real documents in a vector database",
"My query loop retrieves top-k chunks and generates answers with [source] citations",
"Retrieved sources are printed with every answer, and I've used them to debug at least one bad answer",
"I measured retrieval accuracy on 8 known-answer questions",
"The 2 impossible questions get honest refusals, not hallucinations",
"I tuned one parameter, re-measured, and recorded the before/after scores"
]}
});
