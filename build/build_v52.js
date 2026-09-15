// Build Agent_Lifecycle_V14.html from V13. Scope: Quick Start "Evaluate" page embeds the V64 console,
// plus the two things it needs: an Evaluations entry (hub) to create experiment sets, and the engine message bridge.
// Developer mode and every other V13 screen stay as they were.
const fs = require('fs');
const path = require('path');
const REPO = '/Users/ritwikmac/Documents/GitHub/humain-one';
const SRC = path.join(REPO, 'Agent_Lifecycle_V13.html');
const OUT = path.join(REPO, 'Agent_Lifecycle_V52.html');
const ENGINE = 'Eval_Journey_V102.html';

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
LJ = LJ.replace(/const AGENTS = \[[\s\S]*?\n\];/, "const AGENTS = [\n  {id:\"inv\", name:\"Invoice Processing Agent\", av:\"IP\", owner:\"Ministry of Finance\", aid:\"agt_ksa_inv_003\", slug:\"agentic-invoice-processing\", ver:\"v4.1.4\",\n   snap:{idx:0,published:false,_certApplied:false,evalDone:false,suspended:false}},\n  {id:\"csg\", name:\"Citizen Services Guide\", av:\"CS\", owner:\"Ministry of Digital Services\", aid:\"agt_ksa_csg_014\", slug:\"al-noor-services\", ver:\"v1.4.0\",\n   snap:{idx:0,published:false,_certApplied:false,evalDone:false,suspended:false}},\n  {id:\"doc\", name:\"Document Analysis Agent\", av:\"DA\", owner:\"Ministry of Justice\", aid:\"agt_ksa_doc_011\", slug:\"document-analysis\", ver:\"v2.3.0\",\n   snap:{idx:2,published:false,_certApplied:false,evalDone:true,suspended:false}},\n  {id:\"pra\", name:\"Permit Renewal Assistant\", av:\"PR\", owner:\"Ministry of Municipal Affairs\", aid:\"agt_ksa_pra_007\", slug:\"permit-renewal\", ver:\"v2.0.1\",\n   snap:{idx:3,published:true,_certApplied:true,evalDone:true,suspended:false}},\n  {id:\"tcc\", name:\"Tourism Concierge\", av:\"TC\", owner:\"Ministry of Tourism\", aid:\"agt_ksa_tcc_021\", slug:\"tourism-concierge\", ver:\"v0.9.0\",\n   snap:{idx:2,published:false,_certApplied:false,evalDone:false,suspended:false}}\n];");
if(!/invoice-processing/.test(LJ)) fails.push('agents list');
LJ = rep(LJ, '/* ---- LEAP 3: EVALUATE ---- */\n', '/* ---- LEAP 3: EVALUATE ---- */\n' + HELPERS, 1, 'insert helpers');
// ---- V52: Submit Agent flow is the Invoice Processing Agent end to end ----
LJ = rep(LJ, 'let state = { mode:"leap", idx:0, published:false, agentId:"csg" };', 'let state = { mode:"leap", idx:0, published:false, agentId:"inv" };', 1, 'default agent');
LJ = rep(LJ, "return {slug:a.slug||'al-noor-services',ver:a.ver||'v1.4.0'}; }", "return {slug:a.slug||'agentic-invoice-processing',ver:a.ver||'v4.1.4',name:a.name||'Invoice Processing Agent',av:a.av||'IP',owner:a.owner||'Ministry of Finance',id:a.id||'inv'}; }", 1, 'agentMeta defaults');
LJ = rep(LJ, '<b>citizen-services-guide.yaml</b><span class="dz-status">Uploading… 617 KB</span>', '<b>${agentMeta().slug}.yaml</b><span class="dz-status">Uploading… 412 KB</span>', 1, 'upload name');
LJ = rep(LJ, '<b>citizen-services-guide.yaml</b><span>617 KB · manifest v3 · <span class="tag">valid</span></span>', '<b>${agentMeta().slug}.yaml</b><span>412 KB · manifest v3 · vision input · <span class="tag">valid</span></span>', 1, 'upload done name');
LJ = rep(LJ, '<option>gov-services-eval · 380 cases</option><option>permits-and-licences · 210 cases</option><option>absher-flows · 145 cases</option><option>Upload a custom dataset…</option></select></div>\n    <div class="field" style="margin-top:10px"><label>Metrics preset</label>\n      <select class="inp" id="presetSelect"><option>HumainSafety · provided by HUMAIN</option><option disabled>More presets coming soon</option></select></div>\n    <div class="ch-sub" style="margin-top:10px">HumainSafety is the only preset available right now — accuracy, trustworthiness, security and latency, with thresholds set by HUMAIN.</div>',
             '<option>invoices-2026-q3 · 26 invoice images · S3 bucket + CSV</option><option>invoices-2026-q2 · 31 invoice images · S3 bucket</option><option>Upload a custom dataset…</option></select></div>\n    <div class="field" style="margin-top:10px"><label>Experiment set</label>\n      <select class="inp" id="presetSelect"><option>Invoice extraction v1 · 4 metrics · 1 run per case</option><option>HumainSafety · provided by HUMAIN</option></select></div>\n    <div class="ch-sub" style="margin-top:10px">Invoice extraction v1 checks the extracted fields against the reference, the total within 1% tolerance, the vendor name and HUMAIN Safety. You can change it in the Evaluate step.</div>', 1, 'step 1 dataset and set');
LJ = rep(LJ, '<div class="ch-sub">Used by PRISM in the Evaluate step. Pick the dataset and the metrics preset — presets and pass thresholds are defined by HUMAIN.</div>', '<div class="ch-sub">Used in the Evaluate step. The experiment set pins the dataset, the metrics and the run settings. There is no pass bar.</div>', 1, 'step 1 sub');
LJ = rep(LJ, '<b>gov-services-eval.jsonl</b><span class="dz-status">Uploading… 4.2 MB</span>', '<b>invoices-2026-q3.csv</b><span class="dz-status">Uploading… 1.1 MB</span>', 1, 'dataset upload');
LJ = rep(LJ, '<b>gov-services-eval.jsonl</b><span>380 cases · AR + EN · <span class="tag">valid</span></span>', '<b>invoices-2026-q3.csv</b><span>26 cases · image refs on S3 · <span class="tag">valid</span></span>', 1, 'dataset done');
LJ = rep(LJ, "toast('Evaluation dataset uploaded · 380 cases');", "toast('Evaluation dataset uploaded · 26 invoice cases');", 1, 'dataset toast');
LJ = rep(LJ, '<span class="dchip live">● Citizen Services <small style="opacity:.7;margin-left:2px">(this demo)</small></span>\n  <span class="dchip">Enterprise Ops</span><span class="dchip">Healthcare</span>\n  <span class="dchip">Finance</span><span class="dchip">Education</span>',
             '<span class="dchip live">● Finance · invoice processing <small style="opacity:.7;margin-left:2px">(this demo)</small></span>\n  <span class="dchip">Citizen Services</span><span class="dchip">Enterprise Ops</span>\n  <span class="dchip">Healthcare</span><span class="dchip">Education</span>', 1, 'domain chip');
LJ = rep(LJ, '          <div class="bav">CS</div>\n          <div><div class="bt">Citizen Services Guide</div><div class="bm">Ministry of Digital Services</div></div>',
             '          <div class="bav">${agentMeta().av}</div>\n          <div><div class="bt">${agentMeta().name}</div><div class="bm">${agentMeta().owner}</div></div>', 1, 'listing header');
LJ = rep(LJ, '<div class="bdesc">Trusted assistant for permits, IDs and government services. Arabic and English, with human handoff.</div>\n        <div class="bsig">',
             '<div class="bdesc">${LISTING_DESC[agentMeta().id]||LISTING_DESC.inv}</div>\n        <div class="bsig">', 1, 'listing desc');

LJ = rep(LJ, '      <a onclick="LEAP.uploadYaml()">Use the example</a>\n    </div>\n  </div>', '      <a onclick="LEAP.uploadYaml()">Use the example</a>\n    </div>\n    ${state.obsUploaded?manifestCardHTML():\'\'}\n  </div>', 1, 'manifest card in step 1');
LJ = rep(LJ, "toast('agent.yaml uploaded and validated');", "if(!document.getElementById('manifestCard')&&manifestCardHTML())dz.parentNode.insertAdjacentHTML('beforeend',manifestCardHTML());toast('agent.yaml uploaded and validated · '+(mf()?mf().agents.length+' agents declared':''));", 1, 'manifest card after upload');
LJ = rep(LJ, '<span class="dz-status">Uploading… 412 KB</span>', '<span class="dz-status">Uploading… 1.6 KB</span>', 1, 'upload size');
LJ = rep(LJ, '<span>412 KB · manifest v3 · vision input · <span class="tag">valid</span></span>', '<span>1.6 KB · manifest v3 · ${mf()?mf().agents.length+" agents · ":""}<span class="tag">valid</span></span>', 1, 'upload done size');
LJ = rep(LJ, 'Standard-CPU · 2 vCPU / 4 GB <span class="tag b">right-sized</span>', '${mf()?mf().runtime+" runtime · "+mf().cpu+" vCPU / "+mf().mem+" <span class=\\"tag b\\">from manifest</span>":"Standard-CPU · 2 vCPU / 4 GB <span class=\\"tag b\\">right-sized</span>"}', 1, 'resolve runtime');
LJ = rep(LJ, 'Cap 4 vCPU · auto-scale 1–3', '${mf()?"Cap "+(mf().cpu*2)+" vCPU · auto-scale 1–3 · secrets "+mf().secrets.join(", ")+" mounted from the tenant vault":"Cap 4 vCPU · auto-scale 1–3"}', 1, 'resolve guardrail');
LJ = rep(LJ, 'Endpoint live · health checks green', '${mf()?mf().agents.map(function(a){return "POST "+a.path}).join(", ")+" live · health checks green":"Endpoint live · health checks green"}', 1, 'resolve endpoints');
LJ = rep(LJ, '<span class="v mono">cert_csg_2291</span>', '<span class="v mono">cert_${agentMeta().id}_2291</span>', 1, 'cert id');
LJ = rep(LJ, '/* ---- LEAP 3: EVALUATE ---- */\n', '/* ---- LEAP 3: EVALUATE ---- */\n'+"const MANIFESTS={inv:{name:'agentic-invoice-processing',version:'4.1.4',entry:'main',runtime:'python',cpu:1,mem:'4 GB',commit:'0a36a1b4a7a2b8c6e24fce82715723452335678a',repo:'https://goat-advertisers-plot-turning.trycloudflare.com',secrets:['GEMINI_API_KEY','OPENAI_API_KEY'],nodes:['main','extract_invoice','vendor_reconciliation'],agents:[{name:'Invoice Orchestrator',entry:'main',path:'/api/research',role:'orchestrator',input:'query',output:'answer'},{name:'Invoice Extractor',entry:'extract_invoice',path:'/api/extract',role:'sub_agent',input:'document',output:'fields'},{name:'Vendor Reconciler',entry:'vendor_reconciliation',path:'/api/reconcile',role:'sub_agent',input:'query',output:'answer'}],yaml:\"name: agentic-invoice-processing\\nversion: 4.1.4\\nentry: main\\nnodes:\\n  - name: main\\n    type: action\\n  - name: extract_invoice\\n    type: action\\n  - name: vendor_reconciliation\\n    type: action\\nedges:\\n  - from: main\\n    to: extract_invoice\\n  - from: extract_invoice\\n    to: vendor_reconciliation\\ndeployment:\\n  runtime: python\\n  source_commit: \\\"0a36a1b4a7a2b8c6e24fce82715723452335678a\\\"\\n  source_repo: \\\"https://goat-advertisers-plot-turning.trycloudflare.com\\\"\\n  resources:\\n    cpu: \\\"1\\\"\\n    memory: 4Gi\\n  secrets:\\n    - GEMINI_API_KEY\\n    - OPENAI_API_KEY\\n  agents:\\n    - key: orchestrator\\n      name: Invoice Orchestrator\\n      entry: main\\n      path: /api/research\\n      role: orchestrator\\n      input_field: query\\n      output_field: answer\\n    - key: invoice-extractor\\n      name: Invoice Extractor\\n      entry: extract_invoice\\n      path: /api/extract\\n      role: sub_agent\\n      input_field: document\\n      output_field: fields\\n    - key: reconciler\\n      name: Vendor Reconciler\\n      entry: vendor_reconciliation\\n      path: /api/reconcile\\n      role: sub_agent\\n      input_field: query\\n      output_field: answer\\n\"}};\nfunction mf(){return MANIFESTS[state.agentId]||null;}\nfunction manifestCardHTML(){var m=mf();if(!m)return '';return '<div class=\"card\" id=\"manifestCard\" style=\"margin-top:12px\"><h4><span class=\"ic\">\ud83e\uddfe</span> Manifest \u00b7 '+m.name+' v'+m.version+'</h4><div class=\"ch-sub\">Read from '+m.name+'.yaml. '+m.nodes.length+' nodes, '+m.agents.length+' declared HTTP agents, '+m.runtime+' runtime.</div>'+'<div class=\"check\"><span class=\"ck\">\u2713</span><div><div class=\"ct\">Graph</div><div class=\"cd\">entry '+m.nodes.join(' \u2192 ')+'</div></div></div>'+'<div class=\"check\"><span class=\"ck\">\u2713</span><div><div class=\"ct\">Agents</div><div class=\"cd\">'+m.agents.map(function(a){return a.name+' \u00b7 POST '+a.path+' \u00b7 '+a.input+' \u2192 '+a.output+' \u00b7 '+a.role.replace('_',' ')}).join('<br>')+'</div></div></div>'+'<div class=\"check\"><span class=\"ck\">\u2713</span><div><div class=\"ct\">Runtime</div><div class=\"cd\">'+m.runtime+' \u00b7 cpu '+m.cpu+' \u00b7 memory '+m.mem+' \u00b7 commit '+m.commit.slice(0,7)+'</div></div></div>'+'<div class=\"check\"><span class=\"ck\">\u2713</span><div><div class=\"ct\">Secrets</div><div class=\"cd\">'+m.secrets.join(', ')+' declared by name. Values come from the tenant vault, never from the manifest.</div></div></div>'+'<details style=\"margin-top:8px\"><summary style=\"cursor:pointer;font-size:12px;color:var(--ink3)\">Show agent.yaml</summary><pre style=\"margin:8px 0 0;padding:10px 12px;background:#f6f8f7;border:1px solid var(--line);border-radius:8px;font:11.5px/1.5 ui-monospace,Menlo,monospace;white-space:pre;overflow-x:auto\">'+m.yaml.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</pre></details></div>';}\n"+'const LISTING_DESC={inv:"Extracts vendor, invoice number, date and totals from scanned and photographed invoices. Arabic and English, with human handoff on low confidence.",csg:"Trusted assistant for permits, IDs and government services. Arabic and English, with human handoff.",doc:"Reads contracts and legal scans, summarises obligations and flags clauses for review. Arabic and English.",pra:"Renews permits end to end with document checks and a payment handoff.",tcc:"Plans trips and answers visitor questions in Arabic and English."};\n', 1, 'listing descriptions');


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
H = rep(H, '<title>HUMAIN ONE — Agent Lifecycle V13</title>', '<title>HUMAIN ONE — Agent Lifecycle V52</title>', 1, 'title');
H = rep(H, `      <a data-go="agents" title="Agent Lifecycle"><i data-lucide="bot"></i><span class="navlbl">Agent Lifecycle</span></a>`,
           `      <a data-go="agents" title="Agent Lifecycle"><i data-lucide="bot"></i><span class="navlbl">Agent Lifecycle</span></a>
      <a data-go="evaluations" title="Evaluations"><i data-lucide="flask-conical"></i><span class="navlbl">Evaluations</span></a>`, 1, 'sidebar');
H = rep(H, 'evals:"Evaluations",data:"Data Catalog",', 'evals:"Evaluations",evaluations:"Evaluations",data:"Data Catalog",', 1, 'titles');
H = rep(H, 'evals:scrEvals,data:scrData,', 'evals:scrEvals,evaluations:scrEvaluations,data:scrData,', 1, 'router');
H = rep(H, "(g==='market')?(state.screen==='listing'||state.screen==='scenario'):(g===state.screen)",
           "(g==='market')?(state.screen==='listing'||state.screen==='scenario'):(g==='evaluations')?(state.screen==='evaluations'):(g===state.screen)", 1, 'nav highlight');

const SCREENS = `

/* ---------- REVIEW SUBMISSIONS (Agent Lifecycle) ---------- */
window.__reviews=(function(){
  var KEY='humain.reviews.v1',REVIEWER='Tenant verifier · Tenant admin team',IDS={'al-noor-services':'csg','invoice-processing':'inv','agentic-invoice-processing':'inv','document-analysis':'doc','permit-renewal':'pra','tourism-concierge':'tcc'},NAMES={csg:'Citizen Services Guide',inv:'Invoice Processing Agent',doc:'Document Analysis Agent',pra:'Permit Renewal Assistant',tcc:'Tourism Concierge'};
  var PILL={queued:['Queued for review','rv-queued'],inreview:['In review','rv-inreview'],passed:['Review passed','rv-passed'],failed:['Review failed','rv-failed']};
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
  function seed(){var now=Date.now(),list=[
    {id:'rev-seed-1',agentId:'doc',slug:'document-analysis',name:'Document Analysis Agent',ver:'v2.2.0',evaluation:4,experimentset:'Document analysis baseline · v4',cases:22,avg:70,metrics:[{name:'HUMAIN Safety',score:61},{name:'Layout check via vision API',score:76},{name:'Clause audit agent',score:72}],flagged:[],submittedAt:now-3*864e5,status:'passed',updatedAt:now-3*864e5+9e5,feedback:{summary:'Average 70 across 3 metrics on 22 cases. No blocking finding. Cleared for certification.',checklist:[]}},
    {id:'rev-seed-2',agentId:'csg',slug:'al-noor-services',name:'Citizen Services Guide',ver:'v1.5.0',evaluation:2,experimentset:'Permits baseline · v1',cases:38,avg:60,metrics:[{name:'Expected-output match - Al Noor',score:59},{name:'HUMAIN Safety',score:61}],flagged:[{id:'',title:'Repeat contact',tag:'multi'},{id:'',title:'Parking violation',tag:'misread'}],submittedAt:now-864e5,status:'failed',updatedAt:now-864e5+12e5,feedback:{summary:'Expected-output match - Al Noor sits at 59. Average 60 is under the 65 line. 2 cases flagged: Repeat contact, Parking violation. Fix and resubmit as a new version.',checklist:['Raise Expected-output match - Al Noor above 65 (now 59)','Re-check case: Repeat contact (multi)','Re-check case: Parking violation (misread)']}}];
    save(list);return list;}
  function load(){try{var v=JSON.parse(localStorage.getItem(KEY)||'null');return v||seed();}catch(e){return seed();}}
  function save(list){try{localStorage.setItem(KEY,JSON.stringify(list));}catch(e){}}
  function verdict(r){var ms=(r.metrics||[]).slice().sort(function(a,b){return a.score-b.score}),low=ms[0];var pass=r.avg>=65&&(!low||low.score>=50);
    if(pass)return {status:'passed',feedback:{summary:'Average '+r.avg+' across '+ms.length+' metrics on '+r.cases+' cases. No blocking finding. Cleared for certification.',checklist:[]}};
    var fl=(r.flagged||[]);return {status:'failed',feedback:{summary:(low?low.name+' sits at '+low.score+'. ':'')+'Average '+r.avg+' is under the 65 line. '+(fl.length?fl.length+' case'+(fl.length===1?'':'s')+' flagged: '+fl.map(function(f){return f.title}).join(', ')+'. ':'')+'Fix and resubmit as a new version.',checklist:(low?['Raise '+low.name+' above 65 (now '+low.score+')']:[]).concat(fl.map(function(f){return 'Re-check case: '+f.title+(f.tag?' ('+f.tag+')':'')}))}};}
  function resolve(){var list=load(),now=Date.now(),changed=false;list.forEach(function(r){if(r.status==='passed'||r.status==='failed')return;var el=now-r.submittedAt,st=el<7000?'queued':el<17000?'inreview':null;
    if(!st){var v=verdict(r);r.status=v.status;r.feedback=v.feedback;r.updatedAt=now;changed=true;}else if(st!==r.status){r.status=st;r.updatedAt=now;changed=true;}});if(changed)save(list);return changed;}
  function when(ts){var d=Date.now()-ts;if(d<6e4)return 'just now';if(d<36e5)return Math.round(d/6e4)+' min ago';if(d<864e5)return Math.round(d/36e5)+' h ago';return Math.round(d/864e5)+' d ago';}
  function submit(p){var list=load();var open=list.filter(function(r){return r.slug===p.slug&&(r.status==='queued'||r.status==='inreview')})[0];
    if(open){try{LEAP.toast(p.name+' '+open.ver+' is already in review. Wait for the judgement.');}catch(e){}go('agents');return;}
    var aid=IDS[p.slug]||'csg';list.push({id:'rev-'+Date.now().toString(36),agentId:aid,slug:p.slug,name:NAMES[aid]||p.name,ver:p.ver,evaluation:p.evaluation,runId:p.runId,experimentset:p.experimentset,cases:p.cases,avg:p.avg,metrics:p.metrics||[],flagged:p.flagged||[],submittedAt:Date.now(),status:'queued',updatedAt:Date.now(),feedback:null,packet:p.packet||null});
    save(list);go('agents');try{LEAP.toast((NAMES[aid]||p.name)+' '+p.ver+' submitted. Queued for review.');}catch(e){}}
  function panel(){resolve();var list=load().slice().sort(function(a,b){return b.submittedAt-a.submittedAt});
    var rows=list.map(function(r){var p=PILL[r.status]||PILL.queued,fb='';
      if(r.status==='passed')fb='<div class="rv-fb"><p>'+esc(r.feedback.summary)+'</p><button class="btn sm" data-review-act="publish" data-review-id="'+r.id+'">Continue to verify &amp; publish</button></div>';
      else if(r.status==='failed')fb='<div class="rv-fb"><p>'+esc(r.feedback.summary)+'</p>'+(r.feedback.checklist.length?'<ul>'+r.feedback.checklist.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>':'')+'<button class="btn sm" data-review-act="update" data-review-id="'+r.id+'">Update agent</button><span class="rv-note">A new version goes through evaluate and review again.</span></div>';
      else fb='<div class="rv-fb rv-muted">'+(r.status==='queued'?'Waiting for the verifier to pick it up.':'The verifier is reading Evaluation '+r.evaluation+' case by case.')+'</div>';
      return '<tr class="rv-'+r.status+'-row"><td><b>'+esc(r.name)+'</b><span class="rv-sub">'+esc(r.ver)+'</span></td><td>Evaluation '+r.evaluation+'<span class="rv-sub">'+esc(r.experimentset)+' · '+r.cases+' cases · average '+r.avg+'</span></td><td class="rv-when">'+when(r.submittedAt)+(r.packet?'<span class="rv-sub">Packet '+esc(r.packet.id)+(r.packet.flagged!=null?' · '+r.packet.flagged+' flagged, '+r.packet.reviewed+' reviewed':'')+'</span>':'')+'</td><td><span class="rv-pill '+p[1]+'">'+p[0]+'</span><span class="rv-sub">'+REVIEWER+'</span></td><td class="rv-fbcell">'+fb+'</td></tr>';}).join('');
    return '<section class="rv-panel" id="reviewPanel"><div class="rv-head"><h3>Submissions for review</h3><p class="lede">Every version sent from Submit Agent. The tenant verifier reads the attached evaluation and returns a judgement here.</p></div>'+(list.length?'<div class="rv-wrap"><table class="rv-table"><thead><tr><th>Agent version</th><th>Attached evaluation</th><th>Submitted</th><th>Reviewer judgement</th><th>Feedback</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<p class="rv-muted">Nothing submitted yet. Run an evaluation in Submit Agent and choose Submit for review.</p>')+'</section>';}
  document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-review-act]');if(!t)return;e.preventDefault();var r=load().filter(function(x){return x.id===t.dataset.reviewId})[0];if(!r)return;
    if(t.dataset.reviewAct==='publish'){go('submit');setTimeout(function(){try{LEAP.selectAgent(r.agentId);LEAP.goStage(3);}catch(_){}},150);}
    else if(t.dataset.reviewAct==='update'){go('submit');setTimeout(function(){var nv=null;try{nv=LEAP.bumpVersion(r.agentId);LEAP.selectAgent(r.agentId);LEAP.resetFlow();LEAP.toast(r.name+(nv?' is now '+nv:'')+'. Upload the updated package, evaluate it, then submit again.');}catch(_){}},150);}});
  window.addEventListener('message',function(ev){var d=ev.data||{};if(d&&d.source==='humain-eval'&&d.type==='humain-eval-submit-review')submit(d);});
  setInterval(function(){if(state.screen!=='agents')return;var el=document.getElementById('reviewPanel');if(el&&resolve())el.outerHTML=panel();},1500);
  return {panel:panel,resolve:resolve,load:load,submit:submit};
})();
/* ---------- EVALUATIONS (embedded engine) ---------- */
window.__evalHub=(function(){
  var ENGINE='${ENGINE}',KEYS=['eval_journey_v102:final','eval_journey_v101:final'];
  function raw(){for(var i=0;i<KEYS.length;i++){try{var r=localStorage.getItem(KEYS[i]);if(r)return JSON.parse(r);}catch(e){}}return null;}
  function read(){var d=raw(),b=(d&&d.baselineState)||{},vs=b.versions||[],runs=b.runs||[];
    var experimentsets=vs.map(function(x){return {id:x.id,version:x.version,name:x.name||x.reason||('Experiment set '+x.version),cases:x.count||0,metrics:(x.metrics||[]).length};});
    function lastEvaluationFor(agent){for(var i=runs.length-1;i>=0;i--){var r=runs[i].receipt||{};if(!agent||!r.agent||String(r.agent).indexOf(String(agent).replace(/^v/,''))>-1)return r.baseline&&r.baseline.id;}return null;}
    function lastFor(agent){return lastEvaluationFor(agent)||(!b.draft&&b.active)||(vs.length?vs[vs.length-1].id:null);}
    function preferFor(slug){var kw={'invoice-processing':/invoice/i,'agentic-invoice-processing':/invoice/i,'document-analysis':/document/i,'al-noor-services':/permits|baseline/i,'permit-renewal':/safety|permit/i}[slug];if(!kw)return null;var hit=vs.filter(function(x){return kw.test(x.name||x.reason||'')});return hit.length?hit[hit.length-1].id:null;}
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
H = rep(H, 'agents:scrAgents,', 'agents:function(){return __reviews.panel()+scrAgents();},', 1, 'agents screen with reviews');
LJ = rep(LJ, 'window.LEAP={obsPick:', 'window.LEAP={bumpVersion:function(id){var a=agentById(id);if(!a)return null;a.ver=String(a.ver).replace(/(\\d+)$/,function(m){return String(+m+1);});return a.ver;},obsPick:', 1, 'leap bumpVersion');
H = rep(H, '  .guideframe{width:100%;height:100%;border:none;display:block;background:var(--bg)}',
           '  .guideframe{width:100%;height:100%;border:none;display:block;background:var(--bg)}\n  .rv-panel{margin:0 0 22px;padding:16px 18px;border:1px solid var(--line);border-radius:12px;background:var(--panel,#fff)}.rv-head h3{margin:0;font-size:16px}.rv-head .lede{margin:4px 0 0}.rv-wrap{overflow-x:auto;margin-top:12px}.rv-table{width:100%;border-collapse:collapse;font-size:13px}.rv-table th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:8px 10px;border-bottom:1px solid var(--line)}.rv-table td{padding:10px;border-bottom:1px solid var(--line);vertical-align:top}.rv-sub{display:block;font-size:12px;color:var(--muted);margin-top:2px}.rv-when{white-space:nowrap;color:var(--muted)}.rv-pill{display:inline-block;padding:3px 9px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}.rv-queued{background:#eef1f0;color:#4b5854}.rv-inreview{background:#fdf1d6;color:#8a5a0b}.rv-passed{background:#dff3e8;color:#176a44}.rv-failed{background:#fbe1dd;color:#9e2b1c}.rv-fb p{margin:0 0 6px;max-width:52ch}.rv-fb ul{margin:0 0 8px;padding-left:18px}.rv-fb li{margin:2px 0}.rv-muted{color:var(--muted)}.rv-note{display:inline-block;margin-left:8px;font-size:12px;color:var(--muted)}.rv-fbcell{min-width:280px}\n  .evalhub-wrap{height:calc(100vh - 118px);min-height:560px;margin:0 -8px}.evalhub-frame{width:100%;height:100%;border:1px solid var(--line);border-radius:12px;display:block;background:#fff}', 1, 'hub css');

// deep links: ?screen=evaluations[&page=…] · ?screen=submit[&stage=2]
H = rep(H, "  var lf=document.getElementById('loginForm');if(lf)lf.addEventListener('submit',function(e){e.preventDefault();doLogin();});",
`  var lf=document.getElementById('loginForm');if(lf)lf.addEventListener('submit',function(e){e.preventDefault();doLogin();});
  document.addEventListener('DOMContentLoaded',function(){try{var _q=new URLSearchParams(location.search);var _sc=_q.get('screen');if(_sc&&RENDER[_sc]){var _ls=document.getElementById('loginScreen');if(_ls)_ls.classList.add('hidden');if(_q.get('page'))state.evalPage=_q.get('page');go(_sc);if(_sc==='submit'&&_q.get('stage'))setTimeout(function(){try{LEAP.goStage(+_q.get('stage'));}catch(e){}},120);}}catch(e){}});`, 1, 'deep links');

if (fails.length) { console.error('FAILED:\n' + fails.join('\n')); process.exit(1); }
const lit = JSON.stringify(LJ).replace(/<\/script/g, '<\\/script');
const out = H + lit + T;
fs.writeFileSync(OUT, out);
console.log('wrote', OUT, out.length, 'bytes; LJ', LJ.length);
