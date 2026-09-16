
/* ===================== V64 · modes: hub, console, journey =====================
   journey (default): the eight steps as before, kept for the guided demo.
   hub:     Evaluations pages, no agent in sight.        ?mode=hub&page=datasets
   console: one agent version × one saved eval set.     ?mode=console&agent=v1.5.0&evalset=baseline-v1
   Rules: the console never edits datasets, metrics or eval sets and never creates a version;
   anything that would is redirected to the hub. The hub never starts a run. */
var APP_MODE='journey', HUB_PAGE='overview', CONSOLE_AGENT=null, CONSOLE_EMPTY=false;
var HUB_PAGES=[['overview','Overview','Datasets, metrics, eval sets, runs'],['datasets','Datasets','Cases and field mapping'],['metrics','Metrics','Library and builder'],['evalsets','Eval sets','Dataset + metrics + settings'],['runs','Runs','Every run, every agent']];
var CONSOLE_PAGES=[['run','Run','Version × eval set'],['results','Results','Flagged cases, review'],['compare','Compare','Run against run'],['evidence','Evidence','What the reviewer sees'],['submit','Send for review','Hand to the verifier']];
var HUB_TITLES={overview:['Evaluations',''],datasets:['Datasets','Attach sources, confirm what the agent receives, and keep every version.'],metrics:['Metrics','Reuse a saved metric, a team metric or a HUMAIN template, or create one.'],evalsets:['Eval sets','Pin a dataset version to a set of metric versions and run settings. Runs start from an agent\'s page.'],runs:['Runs','']};
function shellPost(type,extra){try{if(window.parent!==window)window.parent.postMessage(Object.assign({type:type,source:'humain-eval',version:'V64'},extra||{}),'*');}catch(_e){}}
function modeUrl(mode,params){var u=new URL(location.href);['mode','page','screen','setup','view','case','run','agent','evalset','fresh'].forEach(function(k){u.searchParams.delete(k)});u.searchParams.set('mode',mode);Object.keys(params||{}).forEach(function(k){if(params[k]!=null&&params[k]!=='')u.searchParams.set(k,params[k])});return u.toString();}
function openHub(page){shellPost('humain-eval-open-hub',{page:page||'overview'});if(window.parent===window)location.href=modeUrl('hub',{page:page||'overview'});}
function openConsole(params){shellPost('humain-eval-open-console',params||{});if(window.parent===window)location.href=modeUrl('console',params||{});}
function evalSetSummaries(){return BASELINES.map(function(b){return {id:b.id,version:b.version,name:b.name||b.reason||('Eval set '+b.version),cases:b.count,metrics:b.metrics.length,metricNames:(b.metrics||[]).map(function(m){var d=(b.setup&&(b.setup.cat||[]).concat(b.setup.ext||[],b.setup.user||[])).filter(function(x){return x.k===m.key})[0];return d?d.n:m.key}),sources:(b.sources||[]).map(function(x){return x.name}),created:b.created,runs:BASE_RUNS.filter(function(r){return r.receipt&&r.receipt.baseline&&r.receipt.baseline.id===b.id}).length};});}
function lastEvalSetFor(agent){for(var i=BASE_RUNS.length-1;i>=0;i--){var r=BASE_RUNS[i].receipt;if(!agent||!r.agent||String(r.agent).indexOf(String(agent).replace(/^v/,''))>-1)return r.baseline&&r.baseline.id;}return (!BASELINE_DRAFT&&ACTIVE_BASELINE)||(BASELINES.length?BASELINES[BASELINES.length-1].id:null);}
function shellState(){return {evalsets:evalSetSummaries(),datasets:SOURCE_ATTACHMENTS.map(function(x){return {id:x.id,name:x.name,provider:x.provider,cases:x.count,confirmed:!!x.confirmed}}),metrics:allMetrics().concat(EXTRA_METRICS).map(function(m){return {key:m.k,name:m.n,scope:m.scope,version:m.ver||'v1.0.0',attached:!!m.on}}),runs:BASE_RUNS.map(function(r){return {number:r.number,agent:r.receipt.agent,evalset:r.receipt.baseline.id,cases:r.receipt.coverage.attempted}}),lastEvalSet:lastEvalSetFor(CONSOLE_AGENT||AGENT_VERSION),agent:AGENT_VERSION,submitted:!!(SNAP&&SUBMISSIONS[SNAP.id])};}
function goToSubmitAgent(){shellPost('humain-eval-update-agent',{agent:AGENT_VERSION});if(window.parent===window){toast('Opening Submit Agent.');setTimeout(function(){location.href='Agent_Lifecycle_V13.html';},400);}}
function modeNavHTML(){
  if(APP_MODE==='hub')return '<div class="nav-context"><button class="nav-close" id="workflowMenuClose" aria-label="Close navigation">&times;</button><span>Evaluations</span><b>alnoor-tenant</b><small>Prepared once, reused across agents</small></div><div class="sgrp">Evaluations</div>'+HUB_PAGES.map(function(p,i){return '<button class="snav" data-hub-page="'+p[0]+'"><span class="n">'+(i+1)+'</span><span class="nav-copy"><b>'+p[1]+'</b><small>'+p[2]+'</small></span></button>';}).join('');
  return '<div class="nav-context"><button class="nav-close" id="workflowMenuClose" aria-label="Close navigation">&times;</button><span>Agent evaluations</span><b>Al Noor Services Agent · <span id="consoleAgentLabel">'+esc(AGENT_VERSION)+'</span></b><small id="consoleRunLabel">No run yet</small></div><div class="sgrp">Run and review</div>'+CONSOLE_PAGES.map(function(p,i){return '<button class="snav" data-console-page="'+p[0]+'"><span class="n">'+(i+1)+'</span><span class="nav-copy"><b>'+p[1]+'</b><small>'+p[2]+'</small></span></button>';}).join('')+'<div class="sgrp">Elsewhere</div><button class="snav" id="consoleUpdateAgent"><span class="n">↑</span><span class="nav-copy"><b>Update agent</b><small>Opens Submit Agent in the lifecycle</small></span></button><button class="snav" data-open-hub="overview"><span class="n">⇱</span><span class="nav-copy"><b>Evaluations</b><small>Datasets, metrics, eval sets</small></span></button>';
}
function ensureHubSections(){
  if(document.getElementById('hubOverview'))return;
  var main=document.querySelector('main');
  var ov=document.createElement('section');ov.id='hubOverview';ov.className='screen';main.appendChild(ov);
  var runs=document.createElement('section');runs.id='hubRuns';runs.className='screen';main.appendChild(runs);
}
function renderHubOverview(){
  var el=document.getElementById('hubOverview');if(!el)return;
  var sets=evalSetSummaries(),mets=allMetrics().concat(EXTRA_METRICS),ds=SOURCE_ATTACHMENTS;
  el.innerHTML='<p class="eyebrow">Evaluations · Overview</p><h2 class="h1">Evaluations</h2><p class="sub">Prepare datasets, metrics and eval sets here. Runs start from an agent\'s Evaluations page.</p>'
   +'<div class="hub-cards">'
   +'<button class="hub-card" data-hub-page="datasets"><b>'+ds.length+'</b><span>dataset source'+(ds.length===1?'':'s')+' · '+draftTotalCases()+' cases</span><small>'+(ds.length?ds.map(function(x){return esc(x.name)}).join(', '):'Add a dataset')+'</small></button>'
   +'<button class="hub-card" data-hub-page="metrics"><b>'+mets.length+'</b><span>metrics in the library</span><small>'+mets.filter(function(m){return m.scope==="personal"}).length+' yours · '+mets.filter(function(m){return m.scope==="workspace"}).length+' team · '+mets.filter(function(m){return m.scope==="template"}).length+' HUMAIN templates</small></button>'
   +'<button class="hub-card" data-hub-page="evalsets"><b>'+sets.length+'</b><span>eval set version'+(sets.length===1?'':'s')+'</span><small>'+(sets.length?sets.map(function(x){return esc(x.name)+' v'+x.version}).join(', '):'Compose one from a dataset and metrics')+'</small></button>'
   +'<button class="hub-card" data-hub-page="runs"><b>'+BASE_RUNS.length+'</b><span>run'+(BASE_RUNS.length===1?'':'s')+' across agents</span><small>'+(BASE_RUNS.length?'Latest: Run '+BASE_RUNS[BASE_RUNS.length-1].number:'None yet')+'</small></button>'
   +'</div>'
   +'<div class="card"><div class="bd"><h3>How this fits together</h3><p class="muted" style="margin:0">A dataset is the cases. A metric is one way of judging a response. An eval set pins a dataset version to a set of metric versions and run settings. A run is one agent version against one eval set version, started from the agent\'s page. There is no pass bar: developers iterate until satisfied, then send a run to the verifier.</p></div></div>';
}
function renderHubRuns(){
  var el=document.getElementById('hubRuns');if(!el)return;
  el.innerHTML='<p class="eyebrow">Evaluations · Runs</p><h2 class="h1">Runs</h2><p class="sub">Every run in this tenant. Open one to continue on the agent\'s Evaluations page.</p>'
   +(BASE_RUNS.length?'<div class="tscroll"><table><thead><tr><th>Run</th><th>Agent version</th><th>Eval set</th><th>Cases</th><th>Runs per case</th><th></th></tr></thead><tbody>'+BASE_RUNS.slice().reverse().map(function(r){var rc=r.receipt;return '<tr><td>Run '+r.number+'</td><td>'+esc(rc.agent)+'</td><td>'+esc(rc.baseline.id)+'</td><td>'+rc.coverage.attempted+'</td><td>'+(rc.settings&&rc.settings.repetitions?rc.settings.repetitions:'1')+'</td><td><button class="btn sm" data-open-run="'+r.number+'">Open on the agent page</button></td></tr>';}).join('')+'</tbody></table></div>'
   :'<div class="card"><div class="bd"><h3>No runs yet</h3><p class="muted" style="margin:0">Runs start from an agent\'s Evaluations page. Prepare a dataset and an eval set here first.</p></div></div>');
}
function renderDatasetVersions(){
  var host=document.getElementById('datasetVersions');if(!host)return;
  var rows=BASELINES.map(function(b){return '<div class="baseline-source"><div><b>Dataset v'+b.version+'</b><span>'+(b.sources||[]).map(function(x){return esc(x.name)}).join(', ')+' · '+b.count+' cases</span><small>Pinned by '+esc(b.name||b.reason||('Eval set '+b.version))+' · '+new Date(b.created).toLocaleDateString('en-GB',{day:'numeric',month:'short'})+'</small></div><span class="badge b-lock">v'+b.version+'</span></div>';});
  host.innerHTML='<div class="zone-head"><b>Versions</b><span>'+(BASELINES.length+(BASELINE_DRAFT&&SOURCE_ATTACHMENTS.length?1:0))+'</span></div>'+rows.join('')+(BASELINE_DRAFT&&SOURCE_ATTACHMENTS.length?'<div class="baseline-source"><div><b>Draft</b><span>'+SOURCE_ATTACHMENTS.map(function(x){return esc(x.name)}).join(', ')+' · '+draftTotalCases()+' cases</span><small>Becomes the next version when an eval set pins it</small></div><span class="badge b-pre">draft</span></div>':'');
  host.hidden=!BASELINES.length&&!SOURCE_ATTACHMENTS.length;
}
function renderHubEvalSets(){
  var host=document.getElementById('hubEvalSets');if(!host)return;
  var sets=evalSetSummaries();
  host.innerHTML='<div class="zone-head"><b>Eval set versions</b><span>'+sets.length+' saved'+(BASELINE_DRAFT?' · 1 draft':'')+'</span></div>'
   +sets.slice().reverse().map(function(x){return '<div class="baseline-source"><div><b>'+esc(x.name)+' · v'+x.version+'</b><span>'+esc(x.sources.join(', '))+' · '+x.cases+' cases · '+x.metrics+' metric'+(x.metrics===1?'':'s')+(x.metricNames.length?': '+esc(x.metricNames.join(', ')):'')+'</span><small>'+new Date(x.created).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+' · used by '+x.runs+' run'+(x.runs===1?'':'s')+'</small></div>'+(x.id===ACTIVE_BASELINE&&!BASELINE_DRAFT?'<span class="badge b-gov">pinned</span>':'<span class="badge b-lock">v'+x.version+'</span>')+'</div>';}).join('')
   +(BASELINE_DRAFT?'<div class="baseline-source"><div><b>Draft</b><span>'+(SOURCE_ATTACHMENTS.length?SOURCE_ATTACHMENTS.map(function(x){return esc(x.name)}).join(', ')+' · '+draftTotalCases()+' cases · '+allMetrics().concat(EXTRA_METRICS).filter(function(m){return m.on}).length+' metrics attached':'No dataset attached yet')+'</span><small>Save it below to create version '+(BASELINES.length+1)+'</small></div><span class="badge b-pre">draft</span></div>':'');
}
function hubPinnedNotice(){
  var notice=document.getElementById('baselineLockedNotice');if(!notice)return;
  if(BASELINE_DRAFT||!activeBaseline()){notice.hidden=true;return;}
  var b=activeBaseline(),what={datasets:'This dataset is pinned by',metrics:'These metrics are pinned by',evalsets:'Saved:'}[HUB_PAGE]||'Pinned by';
  notice.hidden=false;notice.innerHTML='<b>'+what+' '+esc(b.name||b.reason||'Eval set '+b.version)+' · v'+b.version+'.</b><span>'+b.count+' cases · '+b.metrics.length+' metrics. Read-only while pinned; create a new version to change '+(HUB_PAGE==='evalsets'?'it':'it and the eval set')+'.</span><button class="btn ghost" id="editBaselineFromSetup">Create new version</button>';
}
function showHubPage(page){
  HUB_PAGE=HUB_PAGES.some(function(p){return p[0]===page})?page:'overview';
  ensureHubSections();
  var panel={datasets:'dataSetup',metrics:'agentSetup',evalsets:'runSetup'}[HUB_PAGE];
  if(panel){show('s1');HUB_NAVIGATING=true;activateSetupPanel(panel);HUB_NAVIGATING=false;}
  else{document.querySelectorAll('.screen').forEach(function(x){x.classList.toggle('on',x.id===(HUB_PAGE==='runs'?'hubRuns':'hubOverview'))});if(HUB_PAGE==='runs')renderHubRuns();else renderHubOverview();}
  syncModeChrome();
  try{var u=new URL(location.href);u.searchParams.set('mode','hub');u.searchParams.set('page',HUB_PAGE);history.replaceState(null,'',u);}catch(_e){}
  window.scrollTo({top:0,behavior:'instant'});
}
var HUB_NAVIGATING=false;
function showConsolePage(page){
  var map={run:function(){show('s1');HUB_NAVIGATING=true;activateSetupPanel('runSetup');HUB_NAVIGATING=false;},results:function(){show('s2');},compare:function(){show('s6');},evidence:function(){show('s7');},submit:function(){show('s8');}};
  (map[page]||map.run)();syncModeChrome();
  try{var u=new URL(location.href);u.searchParams.set('mode','console');u.searchParams.set('page',page||'run');history.replaceState(null,'',u);}catch(_e){}
}
function consoleLoadEvalSet(id){
  var b=BASELINES.filter(function(x){return x.id===id})[0];if(!b)return false;
  if(BASELINE_DRAFT&&!LOAD_DRAFT_BACKUP)LOAD_DRAFT_BACKUP=baselineSetup();
  loadBaseline(b);ACTIVE_BASELINE=b.id;BASELINE_DRAFT=false;BASELINE_REASON='';persist();renderSetup();return true;
}
function consoleEnsureEvalSet(q){
  if(!BASELINES.length)return false;
  var want=(q&&q.get('evalset'))||null;
  if(want&&BASELINES.some(function(b){return b.id===want})){if(BASELINE_DRAFT||ACTIVE_BASELINE!==want)consoleLoadEvalSet(want);return true;}
  if(BASELINE_DRAFT||!activeBaseline())consoleLoadEvalSet(lastEvalSetFor(CONSOLE_AGENT||AGENT_VERSION)||BASELINES[BASELINES.length-1].id);
  return true;
}
function consoleEmptyState(){
  var pre=document.getElementById('runPrereqState'),work=document.getElementById('runWorkspace');if(!pre)return;
  if(BASELINES.length){CONSOLE_EMPTY=false;return;}
  CONSOLE_EMPTY=true;pre.hidden=false;if(work)work.hidden=true;
  pre.innerHTML='<div><span class="eyeline">Nothing to run yet</span><h3>No eval set for this agent</h3><p>An eval set pins a dataset version to the metrics and run settings. Prepare one in Evaluations, then come back here to run it against '+esc(AGENT_VERSION)+'.</p><div class="readiness-list"><span class="readiness-item">Attach a dataset and confirm its mapping</span><span class="readiness-item">Attach metrics</span><span class="readiness-item">Save as an eval set</span></div></div><div class="friendly-actions"><button class="btn" data-open-hub="evalsets">Open Evaluations</button></div>';
}
function consoleRunBar(){
  var host=document.getElementById('consoleRunBar');if(!host)return;
  var sets=evalSetSummaries();
  var setOpts=sets.length?sets.map(function(x){return '<option value="'+esc(x.id)+'"'+(ACTIVE_BASELINE===x.id?' selected':'')+'>'+esc(x.name)+' · v'+x.version+' · '+x.cases+' cases · '+x.metrics+' metric'+(x.metrics===1?'':'s')+'</option>';}).join(''):'<option value="">No eval set yet</option>';
  var live=/^v?1\.5/.test(AGENT_VERSION)?'v1.4.0':AGENT_VERSION,agents=[[live,'current, live']];if(AGENT_DRAFT_READY||/^v?1\.5/.test(AGENT_VERSION))agents.push(['v1.5.0','draft, unpublished']);
  host.innerHTML='<div class="console-bar"><label>Agent version<select id="consoleAgentSel">'+agents.map(function(a){return '<option value="'+a[0]+'"'+(a[0]===AGENT_VERSION?' selected':'')+'>'+a[0]+' · '+a[1]+'</option>';}).join('')+'</select></label><label>Eval set<select id="consoleSetSel"'+(sets.length?'':' disabled')+'>'+setOpts+'</select></label><span class="muted">'+(sets.length?'Default is the last eval set run on this agent. Change what is in an eval set in Evaluations.':'')+'</span></div>';
  host.hidden=CONSOLE_EMPTY;
}
function syncModeChrome(){
  if(APP_MODE==='journey')return;
  document.body.classList.toggle('mode-hub',APP_MODE==='hub');document.body.classList.toggle('mode-console',APP_MODE==='console');
  var nav=document.getElementById('workflowNav');if(nav&&nav.dataset.modeNav!==APP_MODE){nav.innerHTML=modeNavHTML();nav.dataset.modeNav=APP_MODE;}
  var product=document.querySelector('.product-name');if(product)product.innerHTML=APP_MODE==='hub'?'Evaluations <span>powered by Prism</span>':'Agent evaluations <span>powered by Prism</span>';
  var phase=document.getElementById('topPhase'),step=document.getElementById('topStep');
  if(APP_MODE==='hub'){
    var pg=HUB_PAGES.filter(function(p){return p[0]===HUB_PAGE})[0];if(phase)phase.textContent='Evaluations';if(step)step.textContent=pg?pg[1]:'Overview';
    document.title='Evaluations · '+((pg&&pg[1])||'Overview')+' · HUMAIN ONE';
    document.querySelectorAll('[data-hub-page].snav').forEach(function(b){var on=b.dataset.hubPage===HUB_PAGE;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    if(HUB_TITLES[HUB_PAGE]&&HUB_TITLES[HUB_PAGE][1]){var h=document.getElementById('setupTitle'),sb=document.getElementById('setupSub'),ey=document.getElementById('setupEyebrow');if(h)h.textContent=HUB_TITLES[HUB_PAGE][0];if(sb)sb.textContent=HUB_TITLES[HUB_PAGE][1];if(ey)ey.textContent='Evaluations · '+HUB_TITLES[HUB_PAGE][0];}
    hubPinnedNotice();
    var body=document.querySelector('#dataSetup .bd');if(body&&!document.getElementById('datasetVersions')){var dv=document.createElement('div');dv.id='datasetVersions';dv.className='dataset-versions';body.insertBefore(dv,body.firstChild);}renderDatasetVersions();
    var zh=document.querySelector('#baselineSources .zone-head b');if(zh)zh.textContent='Sources in this dataset';
    var rbd=document.querySelector('#runSetup .bd');if(rbd&&!document.getElementById('hubEvalSets')){var hv=document.createElement('div');hv.id='hubEvalSets';hv.className='dataset-versions';rbd.insertBefore(hv,rbd.firstChild);}renderHubEvalSets();
    document.querySelectorAll('#dataSetup .panel-next span, #agentSetup .panel-next span').forEach(function(x){x.textContent=x.closest('#dataSetup')?'Saved as the draft dataset. Next: choose metrics.':'Saved. Next: pin these in an eval set.';});
    document.querySelectorAll('#dataSetup .panel-next button, #agentSetup .panel-next button').forEach(function(b){b.textContent=b.closest('#dataSetup')?'Go to Metrics →':'Go to Eval sets →';b.removeAttribute('data-nav-dest');b.dataset.hubPage=b.closest('#dataSetup')?'metrics':'evalsets';});
    var ctl=document.getElementById('baselineControl');if(ctl&&!document.getElementById('hubSaveEvalSet'))ctl.insertAdjacentHTML('afterend','<div class="hub-save"><button class="btn" id="hubSaveEvalSet">Save as Eval set</button><span class="muted" id="hubSaveHint"></span></div>');
    var sv=document.getElementById('hubSaveEvalSet'),hint=document.getElementById('hubSaveHint');if(sv){var canSave=BASELINE_DRAFT&&draftTotalCases()>0&&SOURCE_ATTACHMENTS.length&&SOURCE_ATTACHMENTS.every(function(x){return x.confirmed});sv.parentElement.hidden=!BASELINE_DRAFT;sv.disabled=!canSave;sv.textContent='Save as Eval set '+(BASELINES.length+1);if(hint)hint.textContent=canSave?'Pins the dataset draft as v'+(BASELINES.length+1)+' with the attached metrics and these settings.':'Attach a dataset and confirm its mapping first.';}
    var rp=document.getElementById('runPrereqState');if(rp&&HUB_PAGE==='evalsets'){var pb=rp.querySelector('.friendly-actions .btn');if(pb){pb.textContent=DATA_ATTACHED?'Review the dataset mapping':'Add a dataset';pb.removeAttribute('data-nav-dest');pb.dataset.hubPage='datasets';}}
  }else{
    var pageKey=ACTIVE_SCREEN==='s1'?'run':({s2:'results',s3:'results',s6:'compare',s7:'evidence',s8:'submit'})[ACTIVE_SCREEN]||'run';
    var cp=CONSOLE_PAGES.filter(function(p){return p[0]===pageKey})[0];
    if(phase)phase.textContent='Agent evaluations';if(step)step.textContent=ACTIVE_SCREEN==='s3'?'Case review':(cp?cp[1]:'Run');
    document.title='Agent evaluations · '+(ACTIVE_SCREEN==='s3'?'Case review':(cp?cp[1]:'Run'))+' · '+AGENT_VERSION+' · HUMAIN ONE';
    document.querySelectorAll('[data-console-page].snav').forEach(function(b){var on=b.dataset.consolePage===pageKey;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    var lbl=document.getElementById('consoleAgentLabel');if(lbl)lbl.textContent=AGENT_VERSION;var rl=document.getElementById('consoleRunLabel');if(rl)rl.textContent=RUNS_DONE?'Run '+RUNS_DONE+' complete · '+reviewProgress().reviewed+' of '+reviewProgress().total+' reviewed':'No run yet';
    var sec=document.getElementById(ACTIVE_SCREEN),eb=sec&&sec.querySelector(':scope > .eyebrow');if(eb&&ACTIVE_SCREEN!=='s1')eb.textContent='Agent evaluations · '+AGENT_VERSION+' · '+(ACTIVE_SCREEN==='s3'?'Case review':(cp?cp[1]:''));
    document.querySelectorAll('.page-back-navigation button').forEach(function(b){if(/Evaluation Setup/.test(b.textContent))b.textContent='← Back to Run';});
    document.querySelectorAll('.workflow-footer button').forEach(function(b){if(b.dataset.navDest==='run')b.textContent='← Run';});
    if(ACTIVE_SCREEN==='s1'){var h2=document.getElementById('setupTitle'),sb2=document.getElementById('setupSub'),ey2=document.getElementById('setupEyebrow');if(h2)h2.textContent='Run an evaluation';if(sb2)sb2.textContent=CONSOLE_EMPTY?'':'Pick the agent version and the eval set, then start. Everything else is pinned by the eval set.';if(ey2)ey2.textContent='Agent evaluations · '+AGENT_VERSION+' · Run';
      var bd=document.querySelector('#runSetup .bd');if(bd&&!document.getElementById('consoleRunBar')){var cb=document.createElement('div');cb.id='consoleRunBar';bd.insertBefore(cb,bd.firstChild);}
      consoleEmptyState();consoleRunBar();
      var hist=document.getElementById('baselineHistory');if(hist){var hh=hist.querySelector('h3');if(hh)hh.textContent='Runs for this agent';}}
  }
}
function installModes(){
  var q=new URLSearchParams(location.search);APP_MODE=['hub','console'].indexOf(q.get('mode'))>-1?q.get('mode'):'journey';
  if(APP_MODE==='journey')return;
  if(q.get('agent'))CONSOLE_AGENT=q.get('agent');
  if(APP_MODE==='console'&&CONSOLE_AGENT&&/^v?\d+\.\d+\.\d+$/.test(CONSOLE_AGENT))AGENT_VERSION=CONSOLE_AGENT.replace(/^v?/,'v');
  var _sync=syncNavigation;syncNavigation=function(){_sync.apply(this,arguments);syncModeChrome();};
  var _capture=captureBaselineRun;captureBaselineRun=function(){_capture.apply(this,arguments);shellPost('humain-eval-run-finished',{run:RUNS_DONE,agent:AGENT_VERSION,evalset:ACTIVE_BASELINE,state:shellState()});};
  var _navSetup=navigateSetup;navigateSetup=function(panel,mode){
    if(HUB_NAVIGATING)return _navSetup.apply(this,arguments);
    if(APP_MODE==='hub'){var pg={dataSetup:'datasets',agentSetup:'metrics',runSetup:'evalsets',mapBox:'datasets',fieldMappingArea:'datasets',importSources:'datasets',calibrationSetup:'metrics'}[panel]||'datasets';var nested=['mapBox','fieldMappingArea','importSources','calibrationSetup'].indexOf(panel)>-1;showHubPage(pg);if(nested){HUB_NAVIGATING=true;_navSetup.apply(this,arguments);HUB_NAVIGATING=false;}return;}
    if(panel==='runSetup')return showConsolePage('run');
    openHub(panel==='agentSetup'||panel==='calibrationSetup'?'metrics':'datasets');
  };
  var _navScreen=navigateScreen;navigateScreen=function(screen,mode){
    if(APP_MODE==='console'&&(screen==='s4'||screen==='s5'))return showConsolePage('results');
    if(APP_MODE==='console'&&screen==='s9')return goToSubmitAgent();
    if(APP_MODE==='hub'&&['s2','s3','s4','s5','s6','s7','s8','s9'].indexOf(screen)>-1)return openConsole({page:'results'});
    return _navScreen.apply(this,arguments);
  };
  var _revise=beginBaselineRevision;beginBaselineRevision=function(){if(APP_MODE==='console')return openHub('evalsets');_revise.apply(this,arguments);if(APP_MODE==='hub')showHubPage('datasets');};
  var _save=saveBaseline;saveBaseline=function(runAfterSave){if(APP_MODE==='console')return toast('Eval sets are saved in Evaluations.');return _save.apply(this,arguments);};
  if(APP_MODE==='console'){NAV_STEPS.run.label='Run';NAV_STEPS.run.title='Run an evaluation';WORKFLOW_ORDER=['run','results','compare','evidence','submit'];}
  document.addEventListener('click',function(e){
    var hb=e.target.closest('[data-hub-page]');if(hb&&APP_MODE==='hub'){e.preventDefault();e.stopImmediatePropagation();showHubPage(hb.dataset.hubPage);return;}
    var cp=e.target.closest('[data-console-page]');if(cp&&APP_MODE==='console'){e.preventDefault();e.stopImmediatePropagation();showConsolePage(cp.dataset.consolePage);return;}
    var oh=e.target.closest('[data-open-hub]');if(oh){e.preventDefault();e.stopImmediatePropagation();openHub(oh.dataset.openHub);return;}
    var orun=e.target.closest('[data-open-run]');if(orun){e.preventDefault();e.stopImmediatePropagation();var r=BASELINES&&BASE_RUNS.filter(function(x){return String(x.number)===orun.dataset.openRun})[0];openConsole({page:'results',run:orun.dataset.openRun,evalset:r&&r.receipt.baseline.id});return;}
    if(e.target.id==='hubSaveEvalSet'){e.preventDefault();e.stopImmediatePropagation();saveBaseline(false);showHubPage('evalsets');return;}
    if(APP_MODE==='console'){
      var toHub=e.target.closest('#reviseFromResults, #dupEval, [data-setup-target="dataSetup"], [data-setup-target="agentSetup"], [data-nav-dest="data"], [data-nav-dest="quality"], [data-setup-target="mapBox"]');
      if(toHub){e.preventDefault();e.stopImmediatePropagation();openHub(/agentSetup|quality/.test(toHub.dataset.setupTarget||toHub.dataset.navDest||'')?'metrics':'evalsets');return;}
      var toResults=e.target.closest('[data-go="s4"], [data-go="s5"], [data-nav-dest="improve"], [data-nav-dest="regression"]');
      if(toResults){e.preventDefault();e.stopImmediatePropagation();showConsolePage('results');return;}
      var upd=e.target.closest('[data-update-case], #updateAgentFromCase, #consoleUpdateAgent, [data-go="s9"], #improveFromCase, [data-nav-key="agentSubmit"]');
      if(upd){e.preventDefault();e.stopImmediatePropagation();goToSubmitAgent();return;}
    }
    if(APP_MODE==='hub'){
      var hupd=e.target.closest('[data-update-case], #updateAgentFromCase, [data-go="s9"], [data-nav-key="agentSubmit"]');if(hupd){e.preventDefault();e.stopImmediatePropagation();toast('Agents are updated from Submit Agent in the lifecycle.');return;}
      var hrun=e.target.closest('#runBtn, [data-nav-dest="run"], [data-go="s2"], [data-nav-dest="results"]');if(hrun){e.preventDefault();e.stopImmediatePropagation();toast('Runs start from an agent\'s Evaluations page.');return;}
    }
  },true);
  document.addEventListener('change',function(e){
    if(e.target.id==='consoleAgentSel'){AGENT_VERSION=e.target.value;var tv=document.getElementById('topAgentVersion');if(tv)tv.textContent=AGENT_VERSION;persist();syncModeChrome();return;}
    if(e.target.id==='consoleSetSel'){e.stopImmediatePropagation();consoleLoadEvalSet(e.target.value);syncModeChrome();return;}
  },true);
  window.addEventListener('message',function(ev){var d=ev.data||{};if(!d||typeof d.type!=='string')return;
    if(d.type==='humain-eval-state')shellPost('humain-eval-state-reply',{state:shellState()});
    if(d.type==='humain-eval-open'){var nav=document.getElementById('workflowNav');if(nav)nav.dataset.modeNav='';if(d.mode==='hub'){APP_MODE='hub';showHubPage(d.page||'overview');}else if(d.mode==='console'){APP_MODE='console';if(d.agent)AGENT_VERSION=String(d.agent).replace(/^v?/,'v');consoleEnsureEvalSet(new URLSearchParams(d.evalset?'evalset='+d.evalset:''));showConsolePage(d.page||'run');}}
  });
  if(APP_MODE==='hub')showHubPage(q.get('page')||'overview');
  else{consoleEnsureEvalSet(q);showConsolePage(q.get('page')||(q.get('run')?'results':'run'));}
  shellPost('humain-eval-ready',{mode:APP_MODE,state:shellState()});
}
installModes();
