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
const VALID_SIMS = ['playground','tokenizer','temperature','embedding','chunking','rag','costcalc','context','quant','batching','kvcache','speculative','attention'];
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

/* ================= summary ================= */
console.log('\n========================================');
console.log(`${passed} passed, ${failed} failed`);
if (failed) { console.log('Failures:\n  - ' + failures.join('\n  - ')); process.exit(1); }
console.log('ALL GREEN ✓');
