// Build Agent_Lifecycle_V14.html from V13. Scope: Quick Start "Evaluate" page embeds the V64 console,
// plus the two things it needs: an Evaluations entry (hub) to create experiment sets, and the engine message bridge.
// Developer mode and every other V13 screen stay as they were.
const fs = require('fs');
const path = require('path');
const REPO = '/Users/ritwikmac/Documents/GitHub/humain-one';
const SRC = path.join(REPO, 'Agent_Lifecycle_V13.html');
const OUT = path.join(REPO, 'Agent_Lifecycle_V45.html');
const ENGINE = 'Eval_Journey_V95.html';

let s = fs.readFileSync(SRC, 'utf8');
const fails = [];
function rep(src, oldS, newS, n, tag) {
  const c = src.split(oldS).length - 1;
  if (c !== n) { fails.push(`${tag}: expected ${n}, found ${c}`); return src; }
  return src.split(oldS).join(newS);
}
function literalEnd(str, start) {
  let i = start + 1;
  while (i < str.length) { const ch = str[i]; if (ch === '\\') { i += 2; continue; } if (ch === '"') return i; i++; }
  throw new Error('unterminated literal');
}
const iLJ = s.indexOf('var __LJ="');
if (iLJ < 0) throw new Error('no __LJ');
const qLJ = iLJ + 'var __LJ='.length;
const eLJ = literalEnd(s, qLJ);
let H = s.slice(0, qLJ), T = s.slice(eLJ + 1);
let LJ = JSON.parse(s.slice(qLJ, eLJ + 1));
if (LJ.length < 90000) throw new Error('LJ too short ' + LJ.length);

// ---------------- console (__LJ): Quick Start Evaluate page ----------------
LJ = rep(LJ, '{id:"evaluate",n:"Evaluate",          sub:"Evidence & Prism",   status:["Evaluated","st-eval"]},',
             '{id:"evaluate",n:"Evaluate",          sub:"Run evaluations on this version",   status:["Evaluated","st-eval"]},', 1, 'stage evaluate');
LJ = rep(LJ, 'p:"HUMAIN runs its own tests over the live agent and hands you a signed evidence pack you can open and audit. A company that only hosts agents can\'t give you this. We can.",chips:["Prism evidence","Audit-ready","Run by HUMAIN"]',
             'p:"Every evaluation runs an experiment set against this exact version. You read every case, compare evaluations, and send it for review when you are satisfied. There is no pass bar and nothing is decided for you.",chips:["Evaluations on this version","Case-level evidence","Send when ready"]', 1, 'usp leap evaluate');
LJ = rep(LJ, '"leap:evaluate":{n:91, unit:"/ 100 HUMAIN Safety", label:"Earned on 380 real cases against HUMAIN Safety presets. Evidence you can export and audit."}',
             '"leap:evaluate":{n:4, unit:"experiment sets ready to run", label:"Every evaluation is readable case by case and comparable with the last one. Evidence you can export and audit."}', 1, 'vstat evaluate');

// the HUMAIN Safety preset card is only used by the old Evaluate page
const hsStart = LJ.indexOf('function humainSafeCard(){');
const hsEnd = LJ.indexOf('function evalSetup(){');
if (hsStart < 0 || hsEnd < hsStart) fails.push('humainSafeCard bounds');
else LJ = LJ.slice(0, hsStart) + LJ.slice(hsEnd);

const HELPERS = `
/* ---- Evaluate page: embeds the Evaluations console for this agent version ---- */
function evalHub(){ return (window.__evalHub && window.__evalHub.read()) || {experimentsets:[],lastFor:function(){return null;}}; }
function agentMeta(){ var a=(typeof agentById==='function'&&agentById(state.agentId))||{}; return {slug:a.slug||'al-noor-services',ver:a.ver||'v1.4.0'}; }
function agentVersionFor(){ return agentMeta().ver; }
function openEvaluations(page){ try{ if(window.__evalHub) window.__evalHub.open(page||'overview'); }catch(e){} }
function esc_(t){ return String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function evalConsoleFrame(){
  const h=evalHub();
  const src=window.__evalHub ? window.__evalHub.url('hub',{page:'evaluations',scope:'agent',agent:agentMeta().ver,agentslug:agentMeta().slug,experimentset:(h.preferFor?h.preferFor(agentMeta().slug):null)||h.lastFor(agentMeta().ver)||''}) : '${ENGINE}?mode=hub&page=evaluations&scope=agent';
  return \`<iframe id="evalConsoleFrame" title="Evaluation console" src="\${esc_(src)}" style="display:block;width:100%;height:calc(100vh - 250px);min-height:640px;border:1px solid var(--line);border-radius:12px;background:white" allow="fullscreen"></iframe>\`;
}

`;
LJ = LJ.replace(/const AGENTS = \[[\s\S]*?\n\];/, "const AGENTS = [\n  {id:\"csg\", name:\"Citizen Services Guide\", av:\"CS\", owner:\"Ministry of Digital Services\", aid:\"agt_ksa_csg_014\", slug:\"al-noor-services\", ver:\"v1.4.0\",\n   snap:{idx:0,published:false,_certApplied:false,evalDone:false,suspended:false}},\n  {id:\"inv\", name:\"Invoice Processing Agent\", av:\"IP\", owner:\"Ministry of Finance\", aid:\"agt_ksa_inv_003\", slug:\"invoice-processing\", ver:\"v0.9.0\",\n   snap:{idx:0,published:false,_certApplied:false,evalDone:false,suspended:false}},\n  {id:\"doc\", name:\"Document Analysis Agent\", av:\"DA\", owner:\"Ministry of Justice\", aid:\"agt_ksa_doc_011\", slug:\"document-analysis\", ver:\"v2.3.0\",\n   snap:{idx:2,published:false,_certApplied:false,evalDone:true,suspended:false}},\n  {id:\"pra\", name:\"Permit Renewal Assistant\", av:\"PR\", owner:\"Ministry of Municipal Affairs\", aid:\"agt_ksa_pra_007\", slug:\"permit-renewal\", ver:\"v2.0.1\",\n   snap:{idx:3,published:true,_certApplied:true,evalDone:true,suspended:false}},\n  {id:\"tcc\", name:\"Tourism Concierge\", av:\"TC\", owner:\"Ministry of Tourism\", aid:\"agt_ksa_tcc_021\", slug:\"tourism-concierge\", ver:\"v0.9.0\",\n   snap:{idx:2,published:false,_certApplied:false,evalDone:false,suspended:false}}\n];");
if(!/invoice-processing/.test(LJ)) fails.push('agents list');
LJ = rep(LJ, '/* ---- LEAP 3: EVALUATE ---- */\n', '/* ---- LEAP 3: EVALUATE ---- */\n' + HELPERS, 1, 'insert helpers');

const evStart = LJ.indexOf('P.evaluate = ()=> panelHeader(');
const evEnd = LJ.indexOf('/* ---- LEAP 4: CERT & PUBLISH ---- */');
if (evStart < 0 || evEnd < evStart) fails.push('P.evaluate bounds');
else LJ = LJ.slice(0, evStart) + `P.evaluate = ()=> panelHeader("🔬","Evaluate","Run evaluations on the version you uploaded. Pick an experiment set, start the evaluation, read every case, compare with earlier evaluations, and send it for review when you are satisfied. There is no pass bar.","Step 3 of 4 · evidence")
+ evalConsoleFrame()
+ \`<div class="actions">
   <button class="btn btn-ghost" onclick="LEAP.prev()">← Back</button>
   <button class="btn btn-primary" onclick="LEAP.next()">Continue to verify & publish →</button>
   <span class="note">Send for review lives inside the console · the verifier reads the same run</span>
 </div>\`;

` + LJ.slice(evEnd);

// wide layout for the embedded console, no observability strip on that stage (Quick Start only)
LJ = rep(LJ, "function renderObsStrip(){if(typeof MODES==='undefined')return;if(state.mode==='dev'&&MODES.dev.stages[state.idx].id==='eval')return;",
             "function renderObsStrip(){if(typeof MODES==='undefined')return;if(state.mode==='dev'&&MODES.dev.stages[state.idx].id==='eval')return;if(state.mode==='leap'&&MODES.leap.stages[state.idx].id==='evaluate'){Array.prototype.slice.call(document.querySelectorAll('.obs-inline')).forEach(function(n){if(n.parentNode)n.parentNode.removeChild(n);});return;}", 1, 'obs strip skip');
LJ = rep(LJ, "  const embeddedEval=state.mode==='dev'&&MODES.dev.stages[state.idx].id==='eval';",
             "  const _sid=MODES[state.mode].stages[state.idx].id;const embeddedEval=(state.mode==='dev'&&_sid==='eval')||(state.mode==='leap'&&_sid==='evaluate');", 1, 'embedded eval class');

// guided demo beat for the Evaluate page
LJ = rep(LJ, "{idx:2,kind:'auto',title:'3. Prism evaluates the live agent',body:'HUMAIN runs its own tests over the agent, scores accuracy, safety and coverage, then builds the signed evidence pack.',doit:'Prism scores the agent and builds the evidence',focus:'.prism-hero',tour:true,dwell:6600}",
             "{idx:2,kind:'manual',title:'3. The experiment set runs against the live agent',body:'Your experiment set runs in the console. You read the cases, improve, compare runs, and send for review when satisfied.',doit:'Run the experiment set and review the cases',focus:'#evalConsoleFrame',dwell:6600}", 1, 'demo evaluate');

// public API: open Evaluations, jump to a stage
LJ = rep(LJ, 'toast:(typeof toast!=="undefined"?toast:void 0)};',
             'toast:(typeof toast!=="undefined"?toast:void 0),openEvaluations:(typeof openEvaluations!=="undefined"?openEvaluations:void 0),goStage:(typeof go!=="undefined"?go:void 0)};', 1, 'LEAP api');

// ---------------- shell ----------------
H = rep(H, '<title>HUMAIN ONE — Agent Lifecycle V13</title>', '<title>HUMAIN ONE — Agent Lifecycle V45</title>', 1, 'title');
H = rep(H, `      <a data-go="agents" title="Agent Lifecycle"><i data-lucide="bot"></i><span class="navlbl">Agent Lifecycle</span></a>`,
           `      <a data-go="agents" title="Agent Lifecycle"><i data-lucide="bot"></i><span class="navlbl">Agent Lifecycle</span></a>
      <a data-go="evaluations" title="Evaluations"><i data-lucide="flask-conical"></i><span class="navlbl">Evaluations</span></a>`, 1, 'sidebar');
H = rep(H, 'evals:"Evaluations",data:"Data Catalog",', 'evals:"Evaluations",evaluations:"Evaluations",data:"Data Catalog",', 1, 'titles');
H = rep(H, 'evals:scrEvals,data:scrData,', 'evals:scrEvals,evaluations:scrEvaluations,data:scrData,', 1, 'router');
H = rep(H, "(g==='market')?(state.screen==='listing'||state.screen==='scenario'):(g===state.screen)",
           "(g==='market')?(state.screen==='listing'||state.screen==='scenario'):(g==='evaluations')?(state.screen==='evaluations'):(g===state.screen)", 1, 'nav highlight');

const SCREENS = `
/* ---------- EVALUATIONS (embedded engine) ---------- */
window.__evalHub=(function(){
  var ENGINE='${ENGINE}',KEYS=['eval_journey_v95:final','eval_journey_v94:final'];
  function raw(){for(var i=0;i<KEYS.length;i++){try{var r=localStorage.getItem(KEYS[i]);if(r)return JSON.parse(r);}catch(e){}}return null;}
  function read(){var d=raw(),b=(d&&d.baselineState)||{},vs=b.versions||[],runs=b.runs||[];
    var experimentsets=vs.map(function(x){return {id:x.id,version:x.version,name:x.name||x.reason||('Experiment set '+x.version),cases:x.count||0,metrics:(x.metrics||[]).length};});
    function lastEvaluationFor(agent){for(var i=runs.length-1;i>=0;i--){var r=runs[i].receipt||{};if(!agent||!r.agent||String(r.agent).indexOf(String(agent).replace(/^v/,''))>-1)return r.baseline&&r.baseline.id;}return null;}
    function lastFor(agent){return lastEvaluationFor(agent)||(!b.draft&&b.active)||(vs.length?vs[vs.length-1].id:null);}
    function preferFor(slug){var kw={'invoice-processing':/invoice/i,'document-analysis':/document/i,'al-noor-services':/permits|baseline/i,'permit-renewal':/safety|permit/i}[slug];if(!kw)return null;var hit=vs.filter(function(x){return kw.test(x.name||x.reason||'')});return hit.length?hit[hit.length-1].id:null;}
    return {experimentsets:experimentsets,lastFor:lastFor,lastEvaluationFor:lastEvaluationFor,preferFor:preferFor};}
  function url(mode,params){var q=new URLSearchParams();q.set('mode',mode);Object.keys(params||{}).forEach(function(k){if(params[k]!=null&&params[k]!=='')q.set(k,params[k]);});return ENGINE+'?'+q.toString();}
  function open(page){state.evalPage=page||'overview';go('evaluations');}
  function toEvaluate(){go('submit');setTimeout(function(){try{if(window.LEAP&&LEAP.goStage)LEAP.goStage(2);}catch(e){}},120);}
  window.addEventListener('message',function(ev){var d=ev.data||{};if(!d||d.source!=='humain-eval')return;
    if(d.type==='humain-eval-update-agent'){go('submit');setTimeout(function(){try{if(window.LEAP&&LEAP.resetFlow)LEAP.resetFlow();}catch(e){}},80);}
    else if(d.type==='humain-eval-open-hub'){open(d.page||'overview');}
    else if(d.type==='humain-eval-open-console'){if(state.screen!=='submit')toEvaluate();}
  });
  return {read:read,url:url,open:open,toEvaluate:toEvaluate,ENGINE:ENGINE};
})();
function scrEvaluations(){var page=state.evalPage||'overview';state.evalPage=null;
  return '<div class="evalhub-wrap"><iframe class="evalhub-frame" id="evalHubFrame" title="Evaluations" src="'+__evalHub.url('hub',{page:page})+'" allow="fullscreen"></iframe></div>';}
`;
H = rep(H, '/* ---------- ROUTER ---------- */', SCREENS + '/* ---------- ROUTER ---------- */', 1, 'screens');
H = rep(H, '  .guideframe{width:100%;height:100%;border:none;display:block;background:var(--bg)}',
           '  .guideframe{width:100%;height:100%;border:none;display:block;background:var(--bg)}\n  .evalhub-wrap{height:calc(100vh - 118px);min-height:560px;margin:0 -8px}.evalhub-frame{width:100%;height:100%;border:1px solid var(--line);border-radius:12px;display:block;background:#fff}', 1, 'hub css');

// deep links: ?screen=evaluations[&page=…] · ?screen=submit[&stage=2]
H = rep(H, "  var lf=document.getElementById('loginForm');if(lf)lf.addEventListener('submit',function(e){e.preventDefault();doLogin();});",
`  var lf=document.getElementById('loginForm');if(lf)lf.addEventListener('submit',function(e){e.preventDefault();doLogin();});
  document.addEventListener('DOMContentLoaded',function(){try{var _q=new URLSearchParams(location.search);var _sc=_q.get('screen');if(_sc&&RENDER[_sc]){var _ls=document.getElementById('loginScreen');if(_ls)_ls.classList.add('hidden');if(_q.get('page'))state.evalPage=_q.get('page');go(_sc);if(_sc==='submit'&&_q.get('stage'))setTimeout(function(){try{LEAP.goStage(+_q.get('stage'));}catch(e){}},120);}}catch(e){}});`, 1, 'deep links');

if (fails.length) { console.error('FAILED:\n' + fails.join('\n')); process.exit(1); }
const lit = JSON.stringify(LJ).replace(/<\/script/g, '<\\/script');
const out = H + lit + T;
fs.writeFileSync(OUT, out);
console.log('wrote', OUT, out.length, 'bytes; LJ', LJ.length);
