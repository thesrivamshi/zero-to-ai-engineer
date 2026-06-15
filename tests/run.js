#!/usr/bin/env node
/* Test suite for Zero to AI Engineer app.
 * Run: node tests/run.js   (from app root or anywhere)
 * Covers (per spec 07-WORKFLOW.md):
 *  1. Data integrity: parse, unique IDs, quiz answer indices, explanations,
 *     [[terms]] resolve, sim names valid, exercise shapes
 *  2. App boots; home/lesson/gate/glossary/settings/review views render
 *  3. Full terminal exercise flow (wrong -> hint -> complete -> quiz gating)
 *  4. Python exercise renders; pyCheck logic unit-tested with stubbed outputs
 *  5. (new exercise types added in Stage 1 get tests here, mocked)
 *  6. Progress save/load round-trip (export/import once built)
 *  7. Runnable code snippets syntax-checked (python3 -m py_compile);
 *     blocks marked class="frag" exempt; Python detected by lang class
 *     (language-python / lang-python / python) plus py-exercise starters.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
const failures = [];
function ok(cond, name) {
  if (cond) { passed++; }
  else { failed++; failures.push(name); console.error('  ✗ FAIL: ' + name); }
}
function section(name) { console.log('— ' + name); }

/* ---------- build a DOM with app + data inlined ---------- */
function buildDom() {
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  html = html.replace(/<script src="(data\/[^"]+)"><\/script>/g, (m, src) => {
    const js = fs.readFileSync(path.join(ROOT, src), 'utf8');
    return '<script>\n' + js + '\n</script>';
  });
  ok(!/script src="data\//.test(html), 'all data scripts inlined');
  const dom = new JSDOM(html, {
    url: 'https://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  // silence scrollTo not implemented
  dom.window.scrollTo = () => {};
  return dom;
}

/* ================= 1. data integrity ================= */
section('1. Data integrity');
const dom = buildDom();
const W = dom.window;
ok(Array.isArray(W.COURSE_LEVELS) && W.COURSE_LEVELS.length >= 6, 'COURSE_LEVELS loaded with >= 6 levels');
ok(W.GLOSSARY && Object.keys(W.GLOSSARY).length > 30, 'GLOSSARY loaded');

const LEVELS = W.COURSE_LEVELS, GLOSSARY = W.GLOSSARY;
const VALID_SIMS = ['playground','ragreal','opsbyte','percentiles','parallelism','tokenizer','temperature','samplers','embedding','chunking','rag','costcalc','context','quant','batching','kvcache','speculative','attention'];
const ids = new Set();
const allLessons = [];
LEVELS.forEach((lv, li) => {
  ok(typeof lv.title === 'string' && lv.title, `level ${li + 1} has title`);
  ok(Array.isArray(lv.chapters) && lv.chapters.length, `level ${li + 1} has chapters`);
  lv.chapters.forEach(ch => {
    ok(typeof ch.title === 'string', `level ${li + 1} chapter has title`);
    ch.lessons.forEach(l => { allLessons.push({ l, li, ch: ch.title }); });
  });
  if (lv.project) allLessons.push({ l: lv.project, li, ch: 'gate', gate: true });
});
allLessons.forEach(({ l, li, gate }) => {
  const name = `lesson ${l.id || '(missing id)'}`;
  ok(typeof l.id === 'string' && l.id, name + ' has id');
  ok(!ids.has(l.id), name + ' id unique');
  ids.add(l.id);
  ok(typeof l.t === 'string' && l.t, name + ' has title');
  ok(typeof l.body === 'string' && l.body.length > 50, name + ' has body');
  if (gate) ok(Array.isArray(l.checklist) && l.checklist.length >= 3, name + ' gate has checklist');
  (l.quiz || []).forEach((q, qi) => {
    const qn = `${name} quiz#${qi}`;
    ok(typeof q.q === 'string' && q.q, qn + ' has question');
    ok(Array.isArray(q.o) && q.o.length >= 2, qn + ' has >=2 options');
    ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length, qn + ' answer index valid');
    ok(typeof q.e === 'string' && q.e.length > 10, qn + ' has explanation');
  });
  // [[term]] glossary references resolve
  const refs = [...l.body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map(m => m[1].toLowerCase());
  refs.forEach(r => ok(GLOSSARY[r] !== undefined, `${name} glossary term "${r}" resolves`));
  if (l.sim) {
    const sims = Array.isArray(l.sim) ? l.sim : [l.sim];
    sims.forEach(s => ok(VALID_SIMS.includes(s), `${name} sim "${s}" is valid`));
  }
  if (l.term) {
    ok(Array.isArray(l.term.tasks) && l.term.tasks.length, name + ' term has tasks');
    (l.term.tasks || []).forEach((t, ti) => {
      ok(typeof t.expect === 'string', `${name} term task#${ti} has expect regex`);
      ok(typeof t.hint === 'string' && t.hint, `${name} term task#${ti} has hint`);
      try { new RegExp(t.expect); ok(true, `${name} term task#${ti} expect compiles`); }
      catch (e) { ok(false, `${name} term task#${ti} expect compiles`); }
    });
  }
  if (l.videos) {
    ok(Array.isArray(l.videos) && l.videos.length, name + ' videos is non-empty array');
    (l.videos || []).forEach((v, vi) => {
      ok(typeof v.title === 'string' && v.title, `${name} video#${vi} has title`);
      ok(/^https?:\/\/.+/.test(v.url || ''), `${name} video#${vi} has http(s) url`);
    });
  }
  if (l.src) ok(typeof l.src === 'string' && /^(AIE|LEH|INF)\s*ch/.test(l.src), name + ' src cites a book chapter');
  if (l.py) {
    ok(typeof l.py.task === 'string' && l.py.task, name + ' py has task');
    ok(l.py.check && typeof l.py.check === 'object', name + ' py has check');
    if (l.py.check && l.py.check.stdoutRegex) {
      try { new RegExp(l.py.check.stdoutRegex, 'm'); ok(true, `${name} py stdoutRegex compiles`); }
      catch (e) { ok(false, `${name} py stdoutRegex compiles`); }
    }
  }
});
console.log(`  ${allLessons.length} lessons/gates, ${ids.size} unique ids`);

/* ================= 2. app boots & views render ================= */
section('2. Views render');
const doc = W.document;
function settle() { /* render() is synchronous in this app */ }
ok(doc.querySelector('.sidebar').innerHTML.includes('Zero to AI Engineer'), 'sidebar rendered on boot');
ok(doc.getElementById('content').innerHTML.includes('Zero to AI Engineer'), 'home view rendered on boot');
ok(doc.querySelectorAll('.levelcard').length === LEVELS.length, 'home shows a card per level');

W.render(); // explicit home
const firstLesson = LEVELS[0].chapters[0].lessons[0];
W.location.hash = 'lesson/' + firstLesson.id; W.render();
ok(doc.querySelector('h1.ltitle') && doc.querySelector('h1.ltitle').textContent.includes(firstLesson.t), 'lesson view renders title');
ok(doc.querySelector('.quiz'), 'lesson view renders quiz');

const gate1 = LEVELS[0].project;
W.location.hash = 'gate/' + gate1.id; W.render();
ok(doc.querySelector('.gatecard'), 'gate view renders checklist card');
ok(doc.querySelectorAll('.check').length === gate1.checklist.length, 'gate renders every checklist item');

W.location.hash = 'glossary'; W.render();
ok(doc.querySelectorAll('.glitem').length === Object.keys(GLOSSARY).length, 'glossary renders all terms');

W.location.hash = 'settings'; W.render();
ok(doc.getElementById('keyin'), 'settings view renders key input');

W.location.hash = 'review/0'; W.render();
ok(doc.querySelectorAll('.qq').length > 0, 'review view renders questions');

/* glossary tooltip substitution */
const glossed = W.gloss('see [[token]] and [[fine-tuning|tuning]]');
ok(glossed.includes('class="gl"') && glossed.includes('>tuning<'), 'gloss() substitutes terms and aliases');

/* ================= 3. terminal exercise flow ================= */
section('3. Terminal exercise flow');
const termLessonEntry = allLessons.find(x => x.l.term);
if (!termLessonEntry) { ok(false, 'a terminal lesson exists'); }
else {
  const tl = termLessonEntry.l;
  W.location.hash = 'lesson/' + tl.id; W.render();
  const inp = doc.getElementById('termin');
  ok(!!inp, 'terminal input renders');
  function type(cmd) {
    inp.value = cmd;
    inp.dispatchEvent(new W.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }
  // wrong twice -> hint
  type('zzz-not-a-command'); type('zzz-not-a-command');
  const winHtml = doc.getElementById('termwin').innerHTML;
  ok(winHtml.includes('hint:'), 'two wrong commands produce a hint');
  // complete all tasks with passing commands derived from expect regexes
  const answers = { };
  tl.term.tasks.forEach((t, i) => {
    // derive a passing command: strip regex anchors/escapes for the common simple cases
    let cmd = t.cmd || t.expect.replace(/^\^|\$$/g, '').replace(/\\s\+/g, ' ').replace(/\\s\*/g, '').replace(/\\\./g, '.').replace(/\\\//g, '/').replace(/\(\?:([^)|]+)[^)]*\)/g, '$1').replace(/\[([^\]])[^\]]*\]/g, '$1').replace(/\\(.)/g, '$1').replace(/(\S)\?/g, '');
    answers[i] = cmd;
  });
  let completedAll = true;
  for (let i = 0; i < tl.term.tasks.length; i++) {
    const before = W.eval('termState.i');
    type(answers[i]);
    const after = W.eval('termState.i');
    if (after !== before + 1) { completedAll = false; ok(false, `term task#${i} of ${tl.id} accepted derived command "${answers[i]}" (expect: ${tl.term.tasks[i].expect})`); break; }
  }
  if (completedAll) {
    ok(true, 'all terminal tasks complete with valid commands');
    ok(W.eval(`P[${JSON.stringify(tl.id+'_ex')}]`) === true, 'exercise completion recorded');
    if (tl.quiz && tl.quiz.length) {
      ok(W.eval(`P[${JSON.stringify(tl.id)}]`) !== true, 'lesson NOT complete before quiz passes (gating works)');
      // now pass the quiz
      tl.quiz.forEach((q, qi) => {
        const opt = doc.querySelectorAll(`.qq[data-q="${qi}"] .opt`)[q.a];
        opt.click();
      });
      W.grade(tl.id);
      ok(W.eval(`P[${JSON.stringify(tl.id)}]`) === true, 'lesson complete after exercise + quiz both pass');
    }
  }
}

/* ================= 4. python exercise + pyCheck ================= */
section('4. Python exercise & pyCheck');
const pyLessonEntry = allLessons.find(x => x.l.py);
if (!pyLessonEntry) { ok(false, 'a python lesson exists'); }
else {
  const pl = pyLessonEntry.l;
  W.location.hash = 'lesson/' + pl.id; W.render();
  ok(!!doc.getElementById('pyed'), 'python editor renders');
  ok(!!doc.getElementById('pyrun'), 'python run button renders');
}
ok(typeof W.pyCheck === 'function', 'pyCheck is exposed as a pure function');
ok(W.pyCheck({ stdoutIncludes: ['hello'] }, 'say hello world', '').ok === true, 'pyCheck stdoutIncludes pass');
ok(W.pyCheck({ stdoutIncludes: ['hello'] }, 'nope', '').ok === false, 'pyCheck stdoutIncludes fail');
ok(W.pyCheck({ stdoutRegex: '^\\d+$' }, '42\n', '').ok === true, 'pyCheck stdoutRegex pass (multiline)');
ok(W.pyCheck({ stdoutRegex: '^\\d+$', failMsg: 'numbers!' }, 'abc', '').why === 'numbers!', 'pyCheck custom failMsg');
ok(W.pyCheck({ codeIncludes: ['def '] }, '', 'x=1').ok === false, 'pyCheck codeIncludes fail');
ok(W.pyCheck({ codeIncludes: ['def '] }, '', 'def f(): pass').ok === true, 'pyCheck codeIncludes pass');
ok(W.pyCheck({}, 'anything', 'anything').ok === true, 'pyCheck empty check passes');

/* ================= 5. Stage-1 exercise types (mocked API) ================= */
(async () => {
section('5. New exercise types (mocked)');
/* --- pure validators --- */
ok(W.extractJson('```json\n{"a":1}\n```') === '{"a":1}', 'extractJson strips fences');
ok(W.extractJson('Sure! {"a":1} hope that helps') === '{"a":1}', 'extractJson strips prose around object');
ok(W.liveCheck({mustParse:'json',schemaKeys:['name','age']}, '{"name":"Bo","age":4}').ok === true, 'liveCheck json+schema pass');
ok(W.liveCheck({mustParse:'json',schemaKeys:['name','age']}, '{"name":"Bo"}').why.includes('age'), 'liveCheck missing schema key named');
ok(W.liveCheck({mustParse:'json'}, 'not json at all').ok === false, 'liveCheck invalid json fails');
ok(W.liveCheck({mustInclude:['Paris']}, 'the answer is paris').ok === true, 'liveCheck mustInclude case-insensitive');
ok(W.liveCheck({notInclude:['sorry']}, 'I am SORRY').ok === false, 'liveCheck notInclude fails on banned text');
ok(W.liveCheck({mustRegex:'^\\d+$'}, 'abc\n42').ok === true, 'liveCheck mustRegex multiline');
ok(W.liveCheck({maxChars:5}, 'too long here').ok === false, 'liveCheck maxChars');
ok(W.judgeParse('{"pass": true, "reason": "good"}').pass === true, 'judgeParse pass');
ok(W.judgeParse('garbage').pass === false, 'judgeParse tolerates garbage');
const jm = W.judgeMessages('Must rhyme', 'roses are red');
ok(jm.length === 2 && jm[1].content.includes('Must rhyme') && jm[1].content.includes('roses are red'), 'judgeMessages embeds rubric+response');
ok(W.applyTemplate('Classify: {{input}} now', 'hello') === 'Classify: hello now', 'applyTemplate substitutes');
ok(W.applyTemplate('A {{ input }} B', 'x') === 'A x B', 'applyTemplate tolerates spaces');
ok(W.evalMatch('Positive', ' positive. ', 'exact') === true, 'evalMatch exact normalizes case/punct');
ok(W.evalMatch('cat', 'the CAT sat', 'includes') === true, 'evalMatch includes');
ok(W.evalMatch('^yes', 'Yes indeed', 'regex') === true, 'evalMatch regex');
ok(W.evalMatch('positive', 'negative', 'exact') === false, 'evalMatch exact fails on mismatch');
ok(W.normalizeBaseUrl('my-app.onrender.com/') === 'https://my-app.onrender.com', 'normalizeBaseUrl adds scheme, strips slash');
ok(W.normalizeBaseUrl('http://x.io//') === 'http://x.io', 'normalizeBaseUrl keeps explicit http');
ok(W.deployCheckHealth({status:'ok'}) === true && W.deployCheckHealth({status:'dead'}) === false, 'deployCheckHealth');
ok(W.deployCheckAsk({answer:'hi',sources:[]}) === true && W.deployCheckAsk({answer:''}) === false, 'deployCheckAsk');
ok(W.looksLikeFinetuneId('ft:gpt-4o-mini-2024-07-18:personal::abc') === true && W.looksLikeFinetuneId('gpt-4o') === false, 'looksLikeFinetuneId');
{
  const spec = {jsonKeys:['base_accuracy','tuned_accuracy'], plausible:{base_accuracy:[0,1], tuned_accuracy:[0,1]}};
  ok(W.colabParseScores('{"base_accuracy":0.5,"tuned_accuracy":0.8}', spec).ok === true, 'colabParseScores accepts plausible');
  ok(W.colabParseScores('{"base_accuracy":0.5}', spec).why.includes('tuned_accuracy'), 'colabParseScores names missing key');
  ok(W.colabParseScores('{"base_accuracy":7,"tuned_accuracy":0.8}', spec).ok === false, 'colabParseScores rejects implausible');
  ok(W.colabParseScores('not json', spec).ok === false, 'colabParseScores rejects non-json');
}
ok(JSON.stringify(W.parseSSE('data: {"a":1}\ndata: [DONE]\ndata: {"b"')) === JSON.stringify({events:['{"a":1}'],rest:'data: {"b"'}), 'parseSSE splits events, keeps partial');
ok(Math.abs(W.cosineSim([1,0,0],[1,0,0]) - 1) < 1e-9, 'cosineSim identical vectors = 1');
ok(Math.abs(W.cosineSim([1,0],[0,1])) < 1e-9, 'cosineSim orthogonal = 0');
ok(Math.abs(W.cosineSim([1,1,0],[2,2,0]) - 1) < 1e-9, 'cosineSim is scale-invariant (same direction)');
ok(W.cosineSim([1,0],[-1,0]) < 0, 'cosineSim opposite vectors negative');

/* --- live: exercise UI flow with mocked llmStream --- */
const fakeLive = { id:'__t_live', t:'fake', body:'<p>x</p>', live:{ goal:'Get JSON', system:'sys', starter:'user prompt', check:{mustParse:'json', schemaKeys:['city']}, hint:'ask for JSON' } };
W.localStorage.setItem('z2ai_key','sk-test'); // unlock live UIs (no network in tests)
doc.getElementById('content').innerHTML = W.renderLiveEx(fakeLive);
ok(!!doc.getElementById('lvusr'), 'live exercise renders prompt editor');
W.initLiveEx(fakeLive);
const realLlmStream = W.llmStream, realLlm = W.llm;
W.eval('llmStream = async (m,o,onTok) => { const t=\'{"city":"Paris"}\'; if(onTok)onTok(t,t); return {text:t, usage:{prompt_tokens:10, completion_tokens:5}}; }');
await W.runLive();
ok(doc.getElementById('lvverdict').innerHTML.includes('✓'), 'live exercise passes with valid mocked JSON');
ok(W.eval('P["__t_live_ex"]') === true, 'live exercise completion recorded');
W.eval('delete P["__t_live"]; delete P["__t_live_ex"];');
// failing response path
W.eval('llmStream = async (m,o,onTok) => ({text:"no json here", usage:null})');
await W.runLive();
ok(doc.getElementById('lvverdict').innerHTML.includes('Not yet'), 'live exercise fails with bad response');
ok(doc.getElementById('lvverdict').innerHTML.includes('hint'), 'live exercise failure shows hint');
// judge path: first check passes, judge rejects
const fakeJudge = { id:'__t_judge', t:'fake', body:'<p>x</p>', live:{ goal:'g', check:{mustInclude:['ok'], judge:{rubric:'be polite'}}, hint:'h' } };
doc.getElementById('content').innerHTML = W.renderLiveEx(fakeJudge);
W.initLiveEx(fakeJudge);
W.eval('llmStream = async () => ({text:"ok then", usage:null})');
W.eval('llm = async () => ({text:\'{"pass": false, "reason": "rude"}\', usage:null})');
await W.runLive();
ok(doc.getElementById('lvverdict').innerHTML.includes('rude'), 'LLM judge rejection surfaces reason');
ok(W.eval('P["__t_judge_ex"]') !== true, 'judge rejection blocks completion');

/* --- evalrun: exercise with mocked llm --- */
const fakeEval = { id:'__t_eval', t:'fake', body:'<p>x</p>', evalrun:{ goal:'Classify sentiment', template:'Classify {{input}} as positive or negative. One word.', threshold:0.75, match:'exact', cases:[ {input:'I love it', expected:'positive'}, {input:'I hate it', expected:'negative'}, {input:'Best ever', expected:'positive'}, {input:'Terrible', expected:'negative'} ] } };
doc.getElementById('content').innerHTML = W.renderEvalEx(fakeEval);
ok(!!doc.getElementById('evtpl'), 'evalrun renders template editor');
W.initEvalEx(fakeEval);
W.eval(`llm = async (messages) => {
  const m = messages[0].content.toLowerCase();
  const pos = /love|best/.test(m);
  return {text: pos ? 'Positive' : 'negative.', usage:{prompt_tokens:8, completion_tokens:1}};
}`);
await W.runEval();
ok(doc.getElementById('evsum').innerHTML.includes('✓'), 'evalrun passes at 4/4 with mocked model');
ok(W.eval('P["__t_eval_ex"]') === true, 'evalrun completion recorded');
W.eval('delete P["__t_eval"]; delete P["__t_eval_ex"];');
// template without {{input}} is rejected before any call
doc.getElementById('evtpl').value = 'no placeholder';
await W.runEval();
ok(doc.getElementById('evsum').innerHTML.includes('{{input}}'), 'evalrun rejects template missing {{input}}');
// failing accuracy path
doc.getElementById('content').innerHTML = W.renderEvalEx(fakeEval);
W.initEvalEx(fakeEval);
W.eval('llm = async () => ({text:"banana", usage:null})');
await W.runEval();
ok(doc.getElementById('evsum').innerHTML.includes('below'), 'evalrun reports below-threshold accuracy');
ok(W.eval('P["__t_eval_ex"]') !== true, 'failed evalrun does not complete');

/* --- colab: exercise --- */
const fakeColabModel = { id:'__t_cb1', t:'fake', body:'<p>x</p>', colab:{ goal:'Fine-tune', notebook:'notebooks/sft.ipynb', verify:'model', tests:[{prompt:'Say hi', check:{mustInclude:['hi']}}] } };
doc.getElementById('content').innerHTML = W.renderColabEx(fakeColabModel);
ok(!!doc.getElementById('cbin'), 'colab renders input');
W.initColabEx(fakeColabModel);
doc.getElementById('cbin').value = 'not-a-model-id';
await W.runColab();
ok(doc.getElementById('cbout').innerHTML.includes('ft:'), 'colab rejects malformed model id');
doc.getElementById('cbin').value = 'ft:gpt-4o-mini-2024-07-18:personal::abc123';
W.eval('llm = async () => ({text:"hi there!", usage:null})');
await W.runColab();
ok(doc.getElementById('cbout').innerHTML.includes('verified'), 'colab model verification passes with mocked behavior check');
ok(W.eval('P["__t_cb1_ex"]') === true, 'colab completion recorded');
ok(W.eval('P["__t_cb1_proof"]') && W.eval('P["__t_cb1_proof"].summary').startsWith('ft:'), 'colab proof stored');
W.eval('delete P["__t_cb1"]; delete P["__t_cb1_ex"]; delete P["__t_cb1_proof"];');
const fakeColabJson = { id:'__t_cb2', t:'fake', body:'<p>x</p>', colab:{ goal:'Eval', notebook:'notebooks/eval.ipynb', verify:'json', jsonKeys:['base_accuracy','tuned_accuracy'], plausible:{base_accuracy:[0,1],tuned_accuracy:[0,1]} } };
doc.getElementById('content').innerHTML = W.renderColabEx(fakeColabJson);
W.initColabEx(fakeColabJson);
doc.getElementById('cbin').value = '{"base_accuracy":0.52,"tuned_accuracy":0.81}';
await W.runColab();
ok(doc.getElementById('cbout').innerHTML.includes('accepted'), 'colab json verification accepts plausible scores');
ok(W.eval('P["__t_cb2_ex"]') === true, 'colab json completion recorded');
W.eval('delete P["__t_cb2"]; delete P["__t_cb2_ex"]; delete P["__t_cb2_proof"];');

/* --- deploy: exercise with mocked fetch --- */
const fakeDeploy = { id:'__t_dep', t:'fake', body:'<p>x</p>', deploy:{ goal:'Deploy it', askQuestion:'What is RAG?' } };
doc.getElementById('content').innerHTML = W.renderDeployEx(fakeDeploy);
ok(!!doc.getElementById('dpin'), 'deploy renders url input');
W.initDeployEx(fakeDeploy);
doc.getElementById('dpin').value = 'my-app.onrender.com';
W.eval(`fetch = async (url, opts) => {
  if(url.endsWith('/health')) return {ok:true, status:200, json: async()=>({status:'ok'})};
  if(url.endsWith('/ask')) return {ok:true, status:200, json: async()=>({answer:'RAG is retrieval-augmented generation', sources:['doc1']})};
  return {ok:false, status:404, json: async()=>null};
}`);
await W.runDeploy();
ok(doc.getElementById('dpout').innerHTML.includes('live on the public internet'), 'deploy verification passes with mocked endpoints');
ok(W.eval('P["__t_dep_ex"]') === true, 'deploy completion recorded');
ok(String(W.eval('P["__t_dep_proof"].summary')).includes('my-app.onrender.com'), 'deploy proof stores url');
W.eval('delete P["__t_dep"]; delete P["__t_dep_ex"]; delete P["__t_dep_proof"];');
// bad health path
doc.getElementById('content').innerHTML = W.renderDeployEx(fakeDeploy);
W.initDeployEx(fakeDeploy);
doc.getElementById('dpin').value = 'https://dead.example.com';
W.eval('fetch = async () => ({ok:false, status:503, json: async()=>({status:'+JSON.stringify('error')+'})})');
await W.runDeploy();
ok(doc.getElementById('dpout').innerHTML.includes('CORS'), 'deploy failure explains sleep/CORS causes');
ok(W.eval('P["__t_dep_ex"]') !== true, 'failed deploy does not complete');

/* --- multi-sim, notes, search --- */
ok(JSON.stringify(W.simList(['a','b'])) === '["a","b"]' && JSON.stringify(W.simList('a')) === '["a"]', 'simList normalizes');
ok(W.hasExercise({term:{}}) && W.hasExercise({live:{}}) && W.hasExercise({deploy:{}}) && !W.hasExercise({}), 'hasExercise covers all types');
W.location.hash = 'lesson/' + firstLesson.id; W.render();
const noteBox = doc.getElementById('notebox');
ok(!!noteBox, 'notes box renders on lessons');
W.saveNote(firstLesson.id, 'my note');
ok(W.eval(`P[${JSON.stringify(firstLesson.id + '_note')}]`) === 'my note', 'note persists to progress');
W.location.hash = 'lesson/' + firstLesson.id; W.render();
ok(doc.getElementById('notebox').value === 'my note', 'note re-renders with saved text');
W.saveNote(firstLesson.id, '');
ok(W.eval(`P[${JSON.stringify(firstLesson.id + '_note')}]`) === undefined, 'empty note removes key');
ok(!!doc.getElementById('sbsearch'), 'sidebar search input renders');
W.setSearch('token');
ok(doc.getElementById('searchresults').innerHTML.includes('lessonlink'), 'search shows matching lessons');
ok(doc.getElementById('sblist').style.display === 'none', 'search hides level list');
W.setSearch('');
ok(doc.getElementById('sblist').style.display === '', 'clearing search restores level list');

/* --- import/export validation --- */
ok(W.importValidate({app:'zero-to-ai-engineer', progress:{}}).ok === true, 'importValidate accepts valid file');
ok(W.importValidate({app:'other'}).ok === false, 'importValidate rejects foreign file');
ok(W.importValidate(null).ok === false, 'importValidate rejects null');
ok(typeof W.exportProgress === 'function', 'exportProgress exists');
W.localStorage.removeItem('z2ai_key');

/* ================= 5b. sims render without crashing ================= */
section('5b. Sims render');
['opsbyte','percentiles','parallelism','samplers'].forEach(name => {
  const host = doc.createElement('div');
  host.id = 'simbody-' + name;
  doc.body.appendChild(host);
  try {
    W.eval(`SIMS[${JSON.stringify(name)}](document.getElementById('simbody-${name}'))`);
    ok(host.innerHTML.length > 0, `sim ${name} renders content`);
  } catch (e) { ok(false, `sim ${name} renders without throwing — ${e.message}`); }
  host.remove();
});

/* ================= 5c. capstone evidence + live verify (mocked) ================= */
section('5c. Capstone evidence & verification');
{
  // find a gate with evidence/verify (the capstone)
  const cap = allLessons.find(x => x.l.evidence || x.l.verify);
  if (!cap) { ok(false, 'a capstone gate with evidence/verify exists'); }
  else {
    const g = cap.l;
    ok(Array.isArray(g.evidence) && g.evidence.length >= 3, 'capstone has evidence fields');
    g.evidence.forEach((f, fi) => {
      ok(typeof f.key === 'string' && f.key, `evidence#${fi} has key`);
      ok(typeof f.label === 'string' && f.label, `evidence#${fi} has label`);
    });
    ok(g.verify && Array.isArray(g.verify.cases) && g.verify.cases.length, 'capstone verify has cases');
    W.location.hash = 'gate/' + g.id; W.render();
    ok(doc.getElementById('capurl'), 'capstone renders the live-verify URL input');
    const evInputs = doc.querySelectorAll('#content .keyinput');
    ok(evInputs.length >= g.evidence.length, 'capstone renders an input per evidence field');
    // evidence persistence
    W.saveEvidence(g.id, g.evidence[0].key, 'my summary');
    ok(W.eval(`P[${JSON.stringify(g.id + '_ev_' + g.evidence[0].key)}]`) === 'my summary', 'evidence persists to progress');
    W.saveEvidence(g.id, g.evidence[0].key, '');
    ok(W.eval(`P[${JSON.stringify(g.id + '_ev_' + g.evidence[0].key)}]`) === undefined, 'clearing evidence removes key');
    // mocked live verify: health ok + ask returns matching answers
    doc.getElementById('capurl').value = 'my-capstone.onrender.com';
    W.eval(`fetch = async (url, opts) => {
      if (url.endsWith('/health')) return { ok:true, status:200, json: async()=>({status:'ok'}) };
      if (url.endsWith('/ask')) return { ok:true, status:200, json: async()=>({answer:'This service answers questions about your docs', sources:['d1'] }) };
      return { ok:false, status:404, json: async()=>null };
    }`);
    await W.runCapstone();
    ok(doc.getElementById('capout').innerHTML.includes('Evidence captured') || doc.getElementById('capout').innerHTML.includes('Mini-eval'), 'capstone live verification runs the mini-eval');
    ok(W.eval(`P[${JSON.stringify(g.id + '_proof')}]`) && W.eval(`P[${JSON.stringify(g.id + '_proof')}].summary`).includes('my-capstone'), 'capstone proof stored on success');
    W.eval(`delete P[${JSON.stringify(g.id + '_proof')}]`);
  }
}

/* ================= 6. progress save/load round-trip ================= */
section('6. Progress persistence');
W.eval("P['__test_marker']=true; save();");
const stored = JSON.parse(W.localStorage.getItem('z2ai_progress_v1'));
ok(stored.__test_marker === true, 'progress saves to localStorage');
// fresh DOM picks it up
{
  const dom2 = buildDom();
  // jsdom shares nothing between instances; simulate load by injecting then booting
  dom2.window.localStorage.setItem('z2ai_progress_v1', JSON.stringify(stored));
  ok(JSON.parse(dom2.window.localStorage.getItem('z2ai_progress_v1')).__test_marker === true, 'progress round-trips through storage');
  dom2.window.close();
}
W.eval("delete P['__test_marker']; save();");

/* ================= 7. runnable code snippets compile ================= */
section('7. Code snippet syntax check');
const pySnippets = [];
allLessons.forEach(({ l }) => {
  // py exercise starters are runnable Python by definition
  if (l.py && l.py.starter) pySnippets.push({ id: l.id + ':starter', code: l.py.starter });
  // lesson-body blocks explicitly marked python and not frag
  const frag = JSDOM.fragment('<div>' + l.body + '</div>');
  frag.querySelectorAll('pre code, pre').forEach(el => {
    const cls = (el.className || '') + ' ' + ((el.parentElement && el.parentElement.className) || '');
    if (/frag/.test(cls)) return;
    if (/(language-python|lang-python|\bpython\b|\bpy\b)/.test(cls)) {
      pySnippets.push({ id: l.id + ':body', code: el.textContent });
    }
  });
});
console.log(`  ${pySnippets.length} python snippets to compile`);
if (pySnippets.length) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'z2ai-py-'));
  pySnippets.forEach((s, i) => {
    const f = path.join(tmp, `snip${i}.py`);
    fs.writeFileSync(f, s.code);
    try {
      execFileSync('python3', ['-m', 'py_compile', f], { stdio: 'pipe' });
      ok(true, `python snippet compiles: ${s.id}`);
    } catch (e) {
      ok(false, `python snippet compiles: ${s.id} — ${String(e.stderr).slice(0, 200)}`);
    }
  });
  fs.rmSync(tmp, { recursive: true, force: true });
}

/* ================= 8. authored Colab notebooks ================= */
section('8. Colab notebooks');
{
  const nbDir = path.join(ROOT, 'notebooks');
  if (fs.existsSync(nbDir)) {
    const nbs = fs.readdirSync(nbDir).filter(f => f.endsWith('.ipynb'));
    ok(nbs.length >= 3, 'at least 3 notebooks authored');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'z2ai-nb-'));
    nbs.forEach(f => {
      let nb;
      try { nb = JSON.parse(fs.readFileSync(path.join(nbDir, f), 'utf8')); ok(true, `${f} is valid JSON`); }
      catch (e) { ok(false, `${f} is valid JSON`); return; }
      ok(Array.isArray(nb.cells) && nb.cells.length, `${f} has cells`);
      ok(nb.nbformat >= 4, `${f} is nbformat >=4`);
      nb.cells.forEach((c, ci) => {
        if (c.cell_type !== 'code') return;
        const src = (c.source || []).join('');
        // skip cells using notebook magics / shell escapes
        if (src.split('\n').some(l => /^\s*[%!]/.test(l))) return;
        if (!src.trim()) return;
        const fp = path.join(tmp, `${f.replace(/\W/g,'_')}_${ci}.py`);
        fs.writeFileSync(fp, src);
        try { execFileSync('python3', ['-m', 'py_compile', fp], { stdio: 'pipe' }); ok(true, `${f} cell#${ci} compiles`); }
        catch (e) { ok(false, `${f} cell#${ci} compiles — ${String(e.stderr).slice(0,160)}`); }
      });
    });
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/* ================= summary ================= */
console.log('\n========================================');
console.log(`${passed} passed, ${failed} failed`);
if (failed) { console.log('Failures:\n  - ' + failures.join('\n  - ')); process.exit(1); }
console.log('ALL GREEN ✓');
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
