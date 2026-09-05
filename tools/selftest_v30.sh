#!/bin/bash
# V30 acceptance gate: outcome-first end-to-end evaluation journey.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$SCRIPT_DIR/../Eval_Journey_V30.html}"
echo "V30 acceptance gate: current progressive-disclosure contracts"

python3 - "$TARGET" <<'PY'
import re, sys
page=open(sys.argv[1],encoding='utf-8').read()
checks={
  'V30 is a separate versioned artifact':'Evaluate V30' in page,
  'setup opens as one three-step decision flow':all(x in page for x in ('<div class="sgrp">Setup evaluation</div>','id="setupTitle">Connect your data','class="setup-progress"','id="dataSetup" open','id="agentSetup"','id="runSetup"')),
  'global navigation exposes six stable destinations':all(x in page for x in ('Setup evaluation','Review results','Improve agent','Compare runs','Evidence','Submit')),
  'context views are branches rather than peer destinations':'data-nav-key="results"' in page and 'data-nav-key="regression"' in page and 'data-nav-key="case"' not in page,
  'every content screen has a generated local section map':'var SECTION_MAPS=' in page and "Object.keys(SECTION_MAPS)" in page,
  'navigation state is shareable and browser-back aware':all(x in page for x in ('writeNavigationHistory',"history[mode==='replace'?'replaceState':'pushState']",'window.addEventListener(\'popstate\'')),
  'quality subviews are shareable and browser-back aware':all(x in page for x in ("u.searchParams.set('view',ACTIVE_QUALITY_VIEW)","openQualityView(q.get('view')||'attached',true)")),
  'mobile navigation uses a keyboard-safe current-page drawer':all(x in page for x in ('id="workflowMenuToggle"','body.nav-open','id="navScrim"','function trapWorkflowNav','workflowMenuClose')),
  'local maps reveal collapsed destinations before moving focus':'function revealSectionTarget' in page and 'disclosure.open=true' in page and "heading.focus({preventScroll:true})" in page,
  'data connection wizard uses labeled steps':all(x in page for x in ("['Source','Access','Select data','Map fields']",'Step \'+n+\' of 4','aria-current="step"')),
  'quality areas remain one click away':all(x in page for x in ('data-quality-view="attached"','data-quality-view="library"','data-quality-view="create"','data-quality-view="platform"')),
  'metric builder no longer shows false all-active progress':'builder-decision-map' in page and '<div class="builder-progress"><span class="on">' not in page,
  'default taxonomy wall is removed':'<div class="metric-taxonomy"' not in page,
  'one outcome-first metric card contains platform evidence':page.index('id="agentSetup"') < page.index('id="metricSetup"') < page.index('id="integritySetup"') < page.index('id="runSetup"'),
  'security and integrity are separate from run health':all(x in page for x in ('<b>Security and integrity</b>','controlled by policy','Sensitive data in the output','Harmful content','Prompt injection','Output language')),
  'truthfulness is explicitly source-backed':all(x in page for x in ('Truth needs evidence.','A truthfulness check needs a reference','Without one, Prism can judge qualities such as usefulness, but not factual truth')),
  'misleading system-worked sentence is absent':'tells you whether the system worked' not in page,
  'decision-first metric UX is present':all(x in page for x in ('What should this agent be good at?','Add quality check','Quality checks in this evaluation','Platform evidence','Prompt · judge meaning','Code · enforce an exact rule')),
  'every results row exposes an explicit trace action':'function traceCell(index)' in page and 'Open trace' in page and '<th>Trace</th>' in page,
  'all 380 datapoints can open an inspector':'materializeTraceCase(index)' in page and 'data-trace-index' in page,
  'trace IDs and span IDs are generated at required widths':"stableHex('trace:'+SNAP.id+':'+index,32)" in page and "stableHex('root:'+SNAP.id+':'+index,16)" in page,
  'W3C traceparent is visible':'W3C traceparent' in page and "'00-'+o.traceId+'-'+o.root.id+'-01'" in page,
  'OpenTelemetry span contract is represented':all(x in page for x in ('parentSpanId','SPAN_KIND_','startTimeUnixNano','endTimeUnixNano','STATUS_CODE_')),
  'resource and instrumentation scope are represented':all(x in page for x in ("'service.name'","'service.version'","'deployment.environment.name'","io.humain.prism.eval")),
  'GenAI semantic convention attributes are represented':all(x in page for x in ("'gen_ai.operation.name'","'gen_ai.provider.name'","'gen_ai.request.model'","'gen_ai.usage.input_tokens'","'gen_ai.tool.name'")),
  'errors use attributes and timestamped exception events':"'error.type'" in page and "name:'exception'" in page and "'exception.type'" in page,
  'OTLP HTTP export contract is visible':all(x in page for x in ('OTLP/HTTP','ExportTraceServiceRequest','4318/v1/traces','resourceSpans','scopeSpans')),
  'direct datapoint navigation exists':all(x in page for x in ('id="caseJump"','id="goCaseNumber"','goTrace(caseNumber-1)')),
  'trace status is not misrepresented as answer quality':'Span status reports execution errors, not answer quality.' in page,
  'private reasoning is not exposed':'no private chain-of-thought is captured or displayed' in page,
  'V22 OpenTelemetry hook is preserved':'window.__V22_TEST_HOOKS' in page,
  'V23 evaluation-agent hook is exposed':'window.__V23_TEST_HOOKS' in page,
  'Claude Code CLI is the recommended runner':'<span class="status-tag recommended">Recommended</span>Claude Code CLI' in page and "MB.agent||'Claude Code CLI'" in page,
  'Codex CLI is the primary alternative':'Primary alternative with ephemeral execution' in page,
  'runner is not confused with evaluated agent':'An Evaluation agent is a metric runner, not the agent being tested.' in page,
  'per-case isolation and no cross-case memory are explicit':'Fresh per case' in page and 'No memory from earlier cases.' in page,
  'strict machine result schema is defined':all(x in page for x in ("required:['score','label','explanation','evidence']","enum:['pass','fail','uncertain']",'prism-evaluator-result@1')),
  'Claude adapter uses unattended least privilege flags':all(x in page for x in ('claude -p --safe-mode','--permission-mode dontAsk','--no-session-persistence','--max-turns','--max-budget-usd','--json-schema')),
  'Codex adapter uses ephemeral read-only structured execution':all(x in page for x in ('codex exec --ephemeral','--ignore-user-config --ignore-rules','--sandbox read-only','--output-schema','--json -C /case')),
  'failure does not become an agent verdict':'A failed evaluator is never converted into a failed agent verdict.' in page and '"score": null' in page,
  'reproducibility receipt freezes the execution contract':all(x in page for x in ('SHA-256 pinned','dataset snapshot IDs','tools + network policy')),
  'Prompt and Code are primary creation choices':'<span class="status-tag recommended">Recommended</span><span>Prompt · judge meaning</span>' in page and 'Code · enforce an exact rule' in page,
  'phased metric methods retain clear labels':all(x in page for x in ('REST API · reuse an external evaluator','Evaluation agent · investigate with Claude Code or Codex')),
  'old fused metric labels are absent':not any(x in page for x in ('Prompt · recommended','Code · launch','REST API · phased','Evaluation agent · phased','Best starting point')),
  'advanced types carry honest launch phases':'Phased after the external-evaluator use case is validated' in page,
  'REST is explicitly an evaluator rather than the agent endpoint':'REST evaluates the response; it does not invoke the agent.' in page,
  'JSONL supports the no-mapping whole-record path':all(x in page for x in ('Send the whole object','No field mapping required','Fast path active · each JSONL object is one agent input')),
  'model gateway covers discovery credentials pinning and deprecation':all(x in page for x in ('LiteLLM-backed registry','Tenant policy chooses','exact provider/model ID','Old versions remain visible')),
  'custom models have an admin path':'Custom provider / model' in page and 'Tenant admin configures gateway route' in page,
  'case title metadata cannot collide':all(x in page for x in ('id="caseMeta"','document.getElementById(\'caseMeta\').innerHTML','case-meta')) and "caseTitle').innerHTML=(c.inp" not in page,
  'primary actions use outcome language':all(x in page for x in ('Continue to verification','Open datapoint','Next unreviewed','No agent-quality issue','Edit evaluation','Run evaluation')),
  'results lead with explicit attention decisions':all(x in page for x in ('id="resDecision"','Attention is a review queue, not a pre-decided failure list','id="reviewNext"','id="reasonFilter"')),
  'attention reasons are explicit and reproducible':all(x in page for x in ('function attentionReasons','Healthy control · deterministic sample','Expected-output match · review rule triggered')),
  'unavailable traces are honest':'No agent trace received' in page and 'production Prism never fabricates agent-internal spans' in page,
  'agent versions advance dynamically':'function nextMinorVersion' in page and "AGENT_VERSION=nextMinorVersion(AGENT_VERSION)" in page,
  'submission is scoped to an immutable job':'SUBMISSIONS[SNAP.id]' in page and 'Draft changes excluded.' in page,
  'completed jobs freeze metric data separately from the draft':all(x in page for x in ('function freezeMetricData','function jobMetrics','SNAP.metricData=freezeMetricData()','var DRAFT_CASES=')),
  'production failures stay draft-only until rerun':all(x in page for x in ("attentionSource='production'","noteState='pending-run'",'Run it before it appears in Results','Reviewer-added · production failure')),
  'telemetry promise preserves missing state':'Received telemetry stays standard, and missing telemetry stays visible' in page and 'Prism never fabricates them' in page,
  'generated controls expose accessible state and labels':all(x in page for x in ('aria-label="Metric aggregation"','aria-label="Model for evaluation summary"','aria-label="Use \'+esc(f.k)+\' as"','aria-pressed="\'+m.on+\'"')),
  'compact controls meet the prototype touch target':'.why{width:36px;height:36px' in page and '.trace-tab{min-height:38px' in page and '.trace-open{min-height:36px' in page,
}
failed=[]
for name,ok in checks.items():
  print(('PASS ' if ok else 'FAIL ')+name)
  if not ok: failed.append(name)
print(f'V30 static contract: {len(checks)-len(failed)} of {len(checks)} passed')
raise SystemExit(1 if failed else 0)
PY

node - "$TARGET" "$SCRIPT_DIR/../../../forge-humain-mock/node_modules/jsdom" <<'JS'
const fs=require('fs');
const {JSDOM,VirtualConsole}=require(process.argv[3]);
const page=fs.readFileSync(process.argv[2],'utf8');
const vc=new VirtualConsole(),runtime=[];
vc.on('jsdomError',e=>{if(!/scrollTo/.test(String(e.message)))runtime.push(String(e.message));});
const dom=new JSDOM(page,{runScripts:'dangerously',url:'https://v30.test',pretendToBeVisual:true,virtualConsole:vc});
setTimeout(async()=>{
  const w=dom.window,out=[];
  w.Element.prototype.scrollIntoView=function(){};
  function test(name,fn){try{out.push({name,ok:!!fn()});}catch(e){out.push({name,ok:false,error:String(e.message||e)});}}
  test('setup opens with one three-step decision flow',()=>w.document.querySelector('#s1 .h1').textContent.trim()==='Connect your data'&&w.document.getElementById('dataSetup').open&&!w.document.getElementById('agentSetup').open&&w.document.querySelectorAll('.setup-progress button').length===3&&w.document.querySelectorAll('.setup-progress [aria-current="step"]').length===1);
  test('default metric surface has one obvious action and no taxonomy wall',()=>!w.document.querySelector('.metric-taxonomy')&&w.document.querySelectorAll('#agentSetup #newMetric').length===1&&w.document.getElementById('qualityCheckPicker').hidden);
  test('selected checks are visible before platform evidence',()=>{const q=w.document.getElementById('attachedRows'),h=w.document.getElementById('metricSetup');return !!(q.compareDocumentPosition(h)&w.Node.DOCUMENT_POSITION_FOLLOWING);});
  test('baseline run health is independently collapsed with four observations',()=>!w.document.getElementById('metricSetup').open&&w.document.querySelectorAll('#metricSetup .signal-card').length===4&&!/Sensitive data in the output/.test(w.document.getElementById('metricSetup').textContent));
  test('security and integrity is independently collapsed with four policy checks',()=>!w.document.getElementById('integritySetup').open&&w.document.querySelectorAll('#integritySetup .signal-card.security').length===4&&/Marketplace guarantee rule/.test(w.document.getElementById('integritySetup').textContent));
  test('platform evidence does not claim answer quality or truth',()=>/Neither tells you whether the answer was good or truthful/.test(w.document.querySelector('.platform-evidence').textContent));
  test('truthfulness boundary names evidence and reference-free limit',()=>/truthfulness check needs a reference/i.test(w.document.querySelector('.truth-boundary').textContent)&&/not factual truth/i.test(w.document.querySelector('.truth-boundary').textContent));
  test('Add quality check opens the library in context',()=>{w.document.getElementById('newMetric').click();return !w.document.getElementById('qualityCheckPicker').hidden&&!w.document.getElementById('qualityLibraryPane').hidden&&w.document.getElementById('qualityCreatePane').hidden;});
  test('every major screen has one compact local map',()=>['s2','s3','s4','s5','s6','s7','s8'].every(id=>{const n=w.document.querySelectorAll('#'+id+' .section-map');return n.length===1&&n[0].querySelectorAll('button').length>=2;}));
  test('setup navigation changes title panel and current step together',()=>{w.navigateSetup('agentSetup','replace');return w.document.getElementById('setupTitle').textContent==='Define what good means'&&w.document.getElementById('agentSetup').open&&!w.document.getElementById('dataSetup').open&&w.document.querySelectorAll('.snav[aria-current="step"]').length===1&&w.document.querySelector('.snav[aria-current="step"]').dataset.navKey==='quality'&&/setup=agentSetup/.test(w.location.search);});
  test('setup has only one forward action and no competing footer or draft CTA',()=>!w.document.querySelector('#s1>.workflow-footer')&&w.document.querySelectorAll('#agentSetup .panel-next').length===1&&w.document.getElementById('draftSummary').hidden);
  test('quality subnavigation exposes all four exclusive areas in one click',()=>{w.openQualityView('platform',true,'push');const active=w.document.querySelector('.quality-nav [aria-current="location"]'),p=w.document.getElementById('platformEvidenceView');return active&&active.dataset.qualityView==='platform'&&!p.hidden&&w.document.getElementById('qualityAttachedView').hidden&&w.document.getElementById('qualityCheckPicker').hidden&&/view=platform/.test(w.location.search);});
  test('quality library is exclusive and restores a shareable view',()=>{w.openQualityView('library',true,'push');return !w.document.getElementById('qualityCheckPicker').hidden&&!w.document.getElementById('qualityLibraryPane').hidden&&w.document.getElementById('qualityCreatePane').hidden&&w.document.getElementById('qualityAttachedView').hidden&&w.document.getElementById('platformEvidenceView').hidden&&/view=library/.test(w.location.search);});
  test('data replacement is visible and opens the source chooser directly',()=>{w.navigateSetup('dataSetup','replace');w.document.getElementById('replaceSource').click();return w.document.getElementById('importSources').open&&/Upload CSV/.test(w.document.getElementById('importSources').textContent)&&/Connect to Data Warehouse/.test(w.document.getElementById('importSources').textContent);});
  test('warehouse connection has named current and future steps',()=>{w.document.getElementById('connectWarehouse').click();const labels=[...w.document.querySelectorAll('.wizard-steps li')].map(x=>x.textContent.trim());return labels.join('|')==='Source|Access|Select data|Map fields'&&w.document.querySelectorAll('.wizard-steps [aria-current="step"]').length===1&&/Step 1 of 4/.test(w.document.querySelector('.wizard-progress-head').textContent);});
  test('global destinations expose one semantic current location',()=>{w.navigateScreen('s2','replace');const current=[...w.document.querySelectorAll('.snav[aria-current]')];return current.length===1&&current[0].dataset.navKey==='results'&&w.document.getElementById('topPhase').textContent==='Review'&&w.document.getElementById('topStep').textContent==='Review results';});
  test('case inspector is contextual to results',()=>{w.goCase(2);const current=w.document.querySelector('.snav[aria-current="page"]');return current&&current.dataset.navKey==='results'&&/Review results/.test(w.document.querySelector('#s3 .page-route').textContent)&&/Case 3 of/.test(w.document.getElementById('caseRoute').textContent);});
  test('regression metric is contextual beneath Improve',()=>{w.navigateScreen('s5','replace');const current=w.document.querySelector('.snav[aria-current="page"]');return current&&current.dataset.navKey==='regression'&&current.classList.contains('snav-branch')&&/Improve agent/.test(w.document.querySelector('#s5 .page-route').textContent);});
  test('browser location preserves the active product destination',()=>{w.navigateScreen('s7','replace');return /screen=s7/.test(w.location.search)&&w.document.title==='Evidence · HUMAIN ONE Evaluate';});
  test('local map opens and focuses a collapsed destination in one click',()=>{w.navigateScreen('s2','replace');const d=w.document.getElementById('resultsDiagnostics');d.open=false;w.document.querySelector('#s2 [data-section-target="resultsDiagnostics"]').click();return d.open&&w.document.activeElement===d.querySelector(':scope > summary');});
  test('tablet and mobile workflow drawer focuses, traps, and closes on Escape',()=>{Object.defineProperty(w,'innerWidth',{value:768,configurable:true});const toggle=w.document.getElementById('workflowMenuToggle');toggle.focus();toggle.click();const close=w.document.getElementById('workflowMenuClose'),opened=w.document.body.classList.contains('nav-open')&&w.document.activeElement===close;close.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return opened&&!w.document.body.classList.contains('nav-open')&&w.document.activeElement===toggle;});
  Object.defineProperty(w,'innerWidth',{value:1440,configurable:true});w.navigateSetup('agentSetup','replace');w.openQualityView('create',true);
  test('initial trace id is 32 lowercase hex',()=>/^[0-9a-f]{32}$/.test(w.__V22_TEST_HOOKS.trace().traceId));
  test('root and child span ids are 16 lowercase hex',()=>{const t=w.__V22_TEST_HOOKS.trace();return /^[0-9a-f]{16}$/.test(t.rootSpanId)&&t.spanIds.every(x=>/^[0-9a-f]{16}$/.test(x));});
  test('un-instrumented datapoint shows honest trace unavailability',()=>{w.__V22_TEST_HOOKS.goTrace(379);return /datapoint 380 of 380/i.test(w.document.getElementById('casePos').textContent)&&/No agent trace received/.test(w.document.getElementById('caseTrace').textContent);});
  test('generated datapoint trace hides failure-note review',()=>!w.document.getElementById('noteReviewCard'));
  test('OTel contract tab renders context, resource and semantics',()=>{w.__V22_TEST_HOOKS.goTrace(2);w.TRACE_TAB='contract';w.renderCase();const x=w.document.getElementById('caseTrace').textContent;return /trace_flags/.test(x)&&/service\.name/.test(x)&&/gen_ai\.operation\.name/.test(x)&&/Simulated OTel demo trace/.test(x);});
  test('OTLP tab renders a valid export envelope',()=>{w.TRACE_TAB='otlp';w.renderCase();const x=w.document.querySelector('.otel-payload').textContent;JSON.parse(x);return /resourceSpans/.test(x)&&/scopeSpans/.test(x)&&/SPAN_KIND_SERVER/.test(x);});
  test('attention datapoint restores note review',()=>{w.__V22_TEST_HOOKS.goTrace(1);return !!w.document.getElementById('noteReviewCard');});
  test('evaluation agent opens with Claude Code selected',()=>{w.__V23_TEST_HOOKS.openEvaluationAgent();return w.document.getElementById('mbAgent').value==='Claude Code CLI'&&/Claude Code CLI/.test(w.document.getElementById('mbuild').textContent);});
  test('Claude command is non-interactive, bounded and schema constrained',()=>{const c=w.__V23_TEST_HOOKS.command();return /claude -p/.test(c)&&/permission-mode dontAsk/.test(c)&&/no-session-persistence/.test(c)&&/json-schema/.test(c)&&/max-budget-usd/.test(c);});
  test('Codex runner changes command and keeps least privilege',()=>{w.__V23_TEST_HOOKS.selectRunner('Codex CLI');const c=w.__V23_TEST_HOOKS.command();return /codex exec --ephemeral/.test(c)&&/sandbox read-only/.test(c)&&/output-schema/.test(c)&&w.document.getElementById('mbAgent').value==='Codex CLI';});
  test('result schema requires score, label, explanation and evidence',()=>{const s=w.__V23_TEST_HOOKS.schema;return ['score','label','explanation','evidence'].every(k=>s.required.includes(k))&&s.additionalProperties===false;});
  w.document.getElementById('mbAgentTest').click();await new Promise(resolve=>setTimeout(resolve,720));
  test('successful adapter test reports exits, schema checks and frozen contract',()=>{const x=w.document.getElementById('mbOut').textContent;return /Adapter test passed/.test(x)&&/schema-valid/.test(x)&&/prism-evaluator-result@1/.test(x)&&/secret redacted/.test(x);});
  test('failure preview writes no score and preserves agent verdict semantics',()=>{w.document.getElementById('mbAgentTestFailure').click();const x=w.document.getElementById('mbOut').textContent;return /score.*null/.test(x)&&/never converted into a failed agent verdict/.test(x);});
  test('metric builder starts with criterion, evidence, then method',()=>{w.MB={type:'judge'};w.document.getElementById('mbuild').hidden=false;w.renderBuilder();const b=w.document.getElementById('mbuild'),txt=b.textContent;return txt.indexOf('What should Prism check?')<txt.indexOf('What evidence should it use?')&&txt.indexOf('What evidence should it use?')<txt.indexOf('How should Prism decide?');});
  test('Recommended tag precedes Prompt and Code is a primary method',()=>{const b=w.document.getElementById('mbuild'),p=b.querySelector('[data-mtype="judge"]'),c=b.querySelector('[data-mtype="code"]');return p.firstElementChild.textContent==='Recommended'&&/Prompt · judge meaning/.test(p.textContent)&&/Code · enforce an exact rule/.test(c.textContent);});
  test('advanced metric statuses lead REST and Evaluation agent',()=>{const p=w.document.querySelector('.metric-advanced-picker');p.open=true;return ['endpoint','agentic'].every(k=>{const b=p.querySelector('[data-mtype="'+k+'"]');return b&&b.firstElementChild.classList.contains('status-tag')&&b.getAttribute('aria-pressed')==='false';});});
  test('no-reference choice disclaims factual truth',()=>{w.MB.reference='none';w.renderBuilder();return /quality, not factual truth/i.test(w.document.querySelector('.reference-choice').textContent);});
  test('metric attachment controls expose pressed state',()=>[...w.document.querySelectorAll('[data-metric]')].every(b=>b.hasAttribute('aria-pressed')));
  test('completed-job metrics do not drift when the next-run draft changes',()=>{const frozen=w.document.querySelectorAll('#scoreBox .result-metric').length;w.CAT_METRICS[0].on=false;w.CONFIG_DIRTY=true;w.renderSetup();w.renderResultsCopy();const after=w.document.querySelectorAll('#scoreBox .result-metric').length,identity=w.document.getElementById('runIdentity').textContent;w.CAT_METRICS[0].on=true;w.renderSetup();w.renderResultsCopy();return frozen===4&&after===4&&/4 definitions/.test(identity);});
  test('reviewer-added production failures remain draft-only before rerun',()=>{const resultCount=w.CASES.length,draftCount=w.DRAFT_CASES.length;w.addProdCase();const added=w.DRAFT_CASES[w.DRAFT_CASES.length-1],ok=w.CASES.length===resultCount&&w.DRAFT_CASES.length===draftCount+1&&added.attentionSource==='production'&&added.noteState==='pending-run';w.DRAFT_CASES.pop();return ok;});
  test('case inspector separates the long title from shape metadata',()=>{w.__V22_TEST_HOOKS.goTrace(0);return !w.document.getElementById('caseTitle').querySelector('.shape')&&!!w.document.getElementById('caseMeta').querySelector('.shape');});
  test('case inspector separates reasons, evidence, Prism draft, and human verdict',()=>/Healthy control/.test(w.document.getElementById('caseWhy').textContent)&&!!w.document.getElementById('caseMetricEvidence')&&/Observed evidence/.test(w.document.getElementById('noteReviewCard').textContent));
  test('trace tabs expose selected state',()=>{w.TRACE_TAB='timeline';w.renderCase();const tabs=[...w.document.querySelectorAll('#caseTrace [role="tab"]')];return tabs.length===3&&tabs.filter(x=>x.getAttribute('aria-selected')==='true').length===1;});
  test('model catalog selects a model and preserves pinning explanation',()=>{w.document.getElementById('mbModelCatalog').click();const b=w.document.querySelector('[data-model-choice="anthropic/claude-sonnet-4"]');b.click();return w.MB.promptModel==='anthropic/claude-sonnet-4'&&/exact provider\/model version/.test(w.document.getElementById('mbuild').textContent);});
  test('JSONL preview defaults to whole-record fast path',()=>{w.document.querySelector('[data-source-type="json"]').click();w.document.getElementById('srcValidate').click();w.WAREHOUSE.sourceStep='preview';w.renderWarehouse();return w.INPUT_MODE==='record'&&/Send the whole object/.test(w.document.getElementById('warehouseFlow').textContent);});
  test('whole-record selection can be switched to explicit field mapping',()=>{w.document.querySelector('[data-record-mode="fields"]').click();return w.INPUT_MODE==='fields'&&/Map individual fields/.test(w.document.getElementById('warehouseFlow').textContent);});
  w.document.querySelector('[data-record-mode="record"]').click();w.document.getElementById('srcAdd').click();await new Promise(resolve=>setTimeout(resolve,720));
  test('whole-record import reaches a runnable evaluation without mapping',()=>w.document.getElementById('runBtn').disabled===false&&/no mapping is required/i.test(w.document.getElementById('warehouseFlow').textContent));
  w.document.getElementById('newEvalBlank').click();
  test('a new evaluation starts with zero attached domain metrics',()=>{const on=w.allMetrics().concat(w.EXTRA_METRICS).filter(m=>m.on).map(m=>m.n);const txt=w.document.getElementById('metricContext').textContent;if(on.length||!/0/.test(txt))throw new Error('on='+on.join(',')+' text='+txt);return true;});
  w.document.getElementById('newEvalBlank').click();
  test('the saved evaluation restores without losing library definitions',()=>w.allMetrics().length+w.EXTRA_METRICS.length>=7&&w.allMetrics().filter(m=>m.on).length===4);
  w.show('s4');w.document.getElementById('agentChange').value='Read every requested field before writing the answer.';w.document.getElementById('agentChange').dispatchEvent(new w.Event('input',{bubbles:true}));w.document.getElementById('previewAgentChange').click();
  test('agent improvement shows the exact proposed change before deploy',()=>/Read every requested field/.test(w.document.getElementById('agentDiff').textContent)&&w.AGENT_DEPLOYED===false);
  w.document.getElementById('deployAgent').click();
  test('deploy creates a new immutable agent version and unlocks rerun',()=>w.AGENT_VERSION==='v1.5.0'&&w.AGENT_DEPLOYED===true&&w.document.getElementById('runDeployed').disabled===false);
  w.show('s6');
  test('comparison exposes like-for-like basis and keeps invalid deltas out',()=>/like for like/i.test(w.document.getElementById('s6').textContent)&&/metric versions/i.test(w.document.getElementById('s6').textContent));
  w.show('s7');
  test('evidence keeps receipt omissions and open issues visible',()=>{const txt=w.document.getElementById('evBox').textContent;if(!/Reproducibility snapshot/.test(txt)||!/Current draft differs/.test(txt)||!/Note unavailable/.test(txt))throw new Error(txt.slice(0,600));return true;});
  w.show('s8');
  test('dirty draft can submit the named completed job without including draft changes',()=>{const b=w.document.getElementById('doSubmit'),txt=w.document.getElementById('s8').textContent;return !b.disabled&&new RegExp('Submit job').test(b.textContent)&&/Draft changes excluded/.test(txt);});
  test('runtime completed without product errors',()=>{if(runtime.length)throw new Error(runtime.join(' | '));return true;});
  const failed=out.filter(x=>!x.ok);out.forEach(x=>console.log((x.ok?'PASS ':'FAIL ')+x.name+(x.error?' — '+x.error:'')));
  console.log(`V30 DOM contract: ${out.length-failed.length} of ${out.length} passed`);
  dom.window.close();process.exit(failed.length?1:0);
},100);
JS
