/* Curated YouTube videos attached to lessons, MERGED with any inline lesson.videos at render time.
   Keyed by lesson id. Each: { title, url, why }. All IDs verified live via the YouTube Data API
   (Composio) on 2026-06-15. Tuned to the learner's agent-first, build-not-courses style. */
window.VIDEOS = {
/* JSON for the agent's I/O */
"l2b6":[{title:"Corey Schafer — Working with JSON Data using the json Module",url:"https://www.youtube.com/watch?v=9N6a-VLBa2I",why:"JSON is how your agent's tools talk. The clearest 20-minute treatment of parsing and producing it in Python."}],
/* Embeddings / vector search */
"l3a2":[{title:"AssemblyAI — Vector Databases simply explained (Embeddings & Indexes)",url:"https://www.youtube.com/watch?v=dN0lsF2cvm4",why:"What a vector DB actually does and why nearest-neighbor search is fast — the engine under your RAG."}],
/* Function calling / agents — the learner's core style */
"l3c2":[
 {title:"Dave Ebbelaar — OpenAI Function Calling, Full Beginner Tutorial",url:"https://www.youtube.com/watch?v=aqdWSYWC_LI",why:"The tool-call loop end to end: describe a tool, let the model request it, run it, feed the result back."},
 {title:"Alejandro AO — Intro to Agents: Create an Agent from Scratch (No Frameworks)",url:"https://www.youtube.com/watch?v=vHDwpoSFdQY",why:"Builds the agent loop by hand with zero frameworks — exactly your learn-by-building style."}],
"l3c3":[{title:"Tech With Tim — Build an AI Agent From Scratch in Python (Beginners)",url:"https://www.youtube.com/watch?v=bTMPwUgLZf0",why:"A gentle, full walk-through of an agent loop you type yourself."}],
/* Fine-tuning / alignment */
"l4c2":[{title:"Mark Hennings — LoRA & QLoRA Fine-tuning Explained In-Depth",url:"https://www.youtube.com/watch?v=t1caDsMzWBk",why:"Why LoRA works and how QLoRA squeezes a fine-tune onto one GPU — the memory math made visual."}],
"l4c4":[
 {title:"Luis Serrano — Direct Preference Optimization (DPO)",url:"https://www.youtube.com/watch?v=k2pD3k1485A",why:"The most beginner-friendly DPO explainer; no RL background needed."},
 {title:"AI Coffee Break — DPO paper explained",url:"https://www.youtube.com/watch?v=XZLc09hkMwA",why:"A tighter, paper-level pass once the intuition has landed."}],
/* Building APIs + deploy */
"l5a3":[
 {title:"Traversy Media — FastAPI Crash Course (2026)",url:"https://www.youtube.com/watch?v=8TMQcRcBnW8",why:"Build a real API: routes, request/response models, the bones of serving your agent."},
 {title:"pixegami — FastAPI REST API in 15 Minutes",url:"https://www.youtube.com/watch?v=iWS9ogMPOI0",why:"The fastest path to a running endpoint when you just want it working."}],
"l5a4":[{title:"TechWorld with Nana — Docker Crash Course for Absolute Beginners",url:"https://www.youtube.com/watch?v=pg19Z8LL06w",why:"Images, containers, volumes — everything you need to ship the agent in a box."}],
/* MCP */
"l5d1":[
 {title:"codebasics — Model Context Protocol Clearly Explained (MCP Beyond the Hype)",url:"https://www.youtube.com/watch?v=tzrwxLNHtRY",why:"What MCP is and why it exists, without the hype."},
 {title:"IBM Technology — What is MCP? Integrate AI Agents with Databases & APIs",url:"https://www.youtube.com/watch?v=eur8dUO9mvE",why:"A clean conceptual picture of the client/server model."}],
"l5d2":[{title:"Tech With Tim — Build Anything With a CUSTOM MCP Server (Python Tutorial)",url:"https://www.youtube.com/watch?v=-8k9lGpGQ6g",why:"The same list/call mechanic you built by hand, now with the real MCP SDK over stdio."}],
"l5d3":[{title:"Tech With Tim — Build an Advanced MCP Server (Auth, Databases & More)",url:"https://www.youtube.com/watch?v=j5f2EQf5hkw",why:"Remote transport, authentication, and databases — production-shaped MCP."}],
/* Inference engines / scale */
"l6b3":[
 {title:"IBM Technology — What is vLLM? Efficient AI Inference for LLMs",url:"https://www.youtube.com/watch?v=McLdlg5Gc9s",why:"What a serving engine does and why it beats a naive loop."},
 {title:"The Cef Experience — vLLM, KV Cache, PagedAttention, Continuous Batching",url:"https://www.youtube.com/watch?v=DNrIu_EZz5k",why:"A deeper dive into the techniques that make high-throughput serving possible."}]
};
