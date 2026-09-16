"""V110: datasets as named, versioned tables in the hub. Built from V64 by exact-match edits."""
ROOT='/Users/ritwikmac/Documents/GitHub/humain-one/'
SP='/private/tmp/claude-501/-Users-ritwikmac-Cl-HG/3cdeb67e-51ef-45c3-8245-79c3f421143f/scratchpad/'
s=open(ROOT+'Eval_Journey_V64.html',encoding='utf-8').read()
fails=[]
def rep(old,new,n=1,tag=''):
    global s
    c=s.count(old)
    if c!=n: fails.append(f'{tag}: expected {n}, found {c}'); return
    s=s.replace(old,new)
rep('HUMAIN ONE Evaluate - V64','HUMAIN ONE Evaluate - V110',1,'wm')
rep("var KEY='eval_journey_v64';","var KEY='eval_journey_v110';",1,'key')
rep("skey().replace('eval_journey_v64','eval_journey_v63')","skey().replace('eval_journey_v110','eval_journey_v109')",2,'fallback key')
rep("version:'V64'","version:'V110'",1,'shell version')
rep("var ready=DATA_ATTACHED&&MAP_CONFIRMED&&mapHas('input'),browse=","var ready=metricsReady(),browse=",1,'gate sync')
rep("var qualityReady=DATA_ATTACHED&&MAP_CONFIRMED&&mapHas('input');","var qualityReady=metricsReady();",2,'gate cards/view')
rep("  if(!(DATA_ATTACHED&&MAP_CONFIRMED&&mapHas('input')))view='attached';","  if(!metricsReady())view='attached';",1,'gate open view')
rep("if(panel&&!BASELINE_DRAFT&&!t.closest('.setup-progress')&&t.tagName!=='SUMMARY'){","if(panel&&!BASELINE_DRAFT&&!t.closest('.setup-progress')&&t.tagName!=='SUMMARY'&&!(typeof APP_MODE!=='undefined'&&APP_MODE==='hub'&&t.closest('#agentSetup'))){",1,'hub metrics guard')
rep("['dataSetup','agentSetup'].forEach(function(id){var x=document.querySelector('#'+id+' .setup-step-body');if(x)x.inert=!BASELINE_DRAFT;});","['dataSetup','agentSetup'].forEach(function(id){var x=document.querySelector('#'+id+' .setup-step-body');if(x)x.inert=!BASELINE_DRAFT&&!(typeof APP_MODE!=='undefined'&&APP_MODE==='hub');});",1,'hub inert')
rep("'gen_ai.agent.name':'Al Noor Services Agent'","'gen_ai.agent.name':(typeof AGENT_NAME!=='undefined'?AGENT_NAME:'Al Noor Services Agent')",2,'otel agent name')
rep("'service.name':'al-noor-services-agent'","'service.name':(typeof AGENT_SLUG!=='undefined'?AGENT_SLUG:'al-noor-services')+'-agent'",2,'otel service name')
rep("SNAP.agent='al-noor-services@'+AGENT_VERSION.replace(/^v/,'');","SNAP.agent=(typeof AGENT_SLUG!=='undefined'?AGENT_SLUG:'al-noor-services')+'@'+AGENT_VERSION.replace(/^v/,'');",1,'snap agent')
rep("return 'Agent al-noor-services@'+AGENT_VERSION.replace(/^v/,'')+'; dataset '","return 'Agent '+(typeof AGENT_SLUG!=='undefined'?AGENT_SLUG:'al-noor-services')+'@'+AGENT_VERSION.replace(/^v/,'')+'; dataset '",1,'contract agent')
rep("<b>Al Noor Services Agent '+AGENT_VERSION+'</b> · invocation","<b>'+(typeof AGENT_NAME!=='undefined'?AGENT_NAME:'Al Noor Services Agent')+' '+AGENT_VERSION+'</b> · invocation",1,'receipt agent')
rep('<b>Al Noor Services Agent · <span id="consoleAgentLabel">','<b>\'+esc(typeof AGENT_NAME!==\'undefined\'?AGENT_NAME:\'Al Noor Services Agent\')+\' · <span id="consoleAgentLabel">',1,'console nav agent')
rep("var label=contract.mode==='list'?contract.responses[i%contract.responses.length].label:Math.round((contract.minimum+(contract.maximum-contract.minimum)*((i%11)/10))*100)/100;","var label=contractResultFor(contract,m,i);",1,'contract results')
rep("var value=contract?(r?r.result:'Not scored'):","var value=contract?(r?fmtContractResult(m,r.result):'Not scored'):",1,'case cell')
rep("value=metricResponseContract(m)?esc(resultLabel(m,traceGlobal)):","value=metricResponseContract(m)?esc(fmtContractResult(m,resultLabel(m,traceGlobal))):",1,'review cell')
rep("if(!na){if(metricResponseContract(m))v=Object.keys(m._counts||{}).map(function(label){return esc(label)+': '+m._counts[label]}).join('<br>');","if(!na){if(metricResponseContract(m))v=contractSummaryHTML(m);",1,'card summary')
JS=open(SP+'datasets_v110.js',encoding='utf-8').read()
rep("installModes();\n\n</script>\n</body>", JS+"\ninstallModes();\ndsAfterModes();\n</script>\n</body>",1,'datasets script')
CSS=open(SP+'datasets_v110.css',encoding='utf-8').read()
rep("\n</style>",CSS+"\n</style>",1,'datasets css')
if fails: raise SystemExit('FAILED: '+'; '.join(fails))

# ---- visible-text rename: Eval sets -> Experiment sets, Runs page -> Evaluations ----
import re
pairs=[("Eval sets","Experiment sets"),("Eval set","Experiment set"),("eval sets","experiment sets"),("eval set","experiment set"),
 ("'Run '+","'Evaluation '+"),("Start Run ","Start Evaluation "),("'Runs'","'Evaluations'"),("Every run, every agent","Every evaluation, every agent"),
 ("Runs for this agent","Evaluations for this agent"),("runs across agents","evaluations across agents"),
 ("<b>Runs · '","<b>Evaluations · '"),("Evaluations · Runs","Evaluations · Evaluations"),('<h2 class="h1">Runs</h2>','<h2 class="h1">Evaluations</h2>'),
 ("New run","New evaluation"),("Start run","Start evaluation"),("Select a run","Select an evaluation"),("No runs yet","No evaluations yet"),
 ("'← Runs'","'← Evaluations'"),("'← Back to Runs'","'← Back to Evaluations'"),("<th>Run</th>","<th>Evaluation</th>"),('<th class="ds-num">Runs</th>','<th class="ds-num">Evaluations</th>'),
 ("Select run ","Select evaluation "),("Compare Run ","Compare Evaluation "),(" with Run "," with Evaluation "),
 ("Every run in this tenant. Start one here, then select it to view results, review cases, compare or update the agent.","Every evaluation in this tenant. Start one here, then select it to view results, review cases, compare or update the agent."),
 ("A run evaluates one agent version against one experiment set. The entry stays here with its evidence.","An evaluation runs one agent version against one experiment set. The entry stays here with its evidence."),
 ("New evaluation: choose the agent, its version and an experiment set. The run appears here with its results and evidence.","New evaluation: choose the agent, its version and an experiment set. It appears here with its results and evidence."),
 ("Choose the agent, its version and the experiment set. The run creates an entry below and evaluates every case.","Choose the agent, its version and the experiment set. The evaluation creates an entry below and scores every case."),
 ("Used by a run. Runs keep their experiment set.","Used by an evaluation. Evaluations keep their experiment set."),("' run'+(runs===1?'':'s')","' evaluation'+(runs===1?'':'s')"),
 ("Wait for the current run to finish.","Wait for the current evaluation to finish."),("Showing the latest run. Older runs open their evidence.","Showing the latest evaluation. Older ones open their evidence."),
 ("Update from the latest run","Update from the latest evaluation"),("Select two runs to compare","Select two evaluations to compare"),("Runs must share the same experiment set version","Evaluations must share the same experiment set version"),
 ("This prototype compares only the two latest runs","This prototype compares only the two latest evaluations"),("This prototype compares the two latest runs (","This prototype compares the two latest evaluations ("),
 ("Evaluations start from an agent\\'s page.","Evaluations start from the Evaluations page."),("Runs start from an agent\\'s Evaluations page.","Evaluations start from the Evaluations page."),("Runs start from an agent\\'s Evaluations page","Evaluations start from the Evaluations page"),
 ("Evaluations start from an agent\\'s Evaluations page.","Evaluations start from the Evaluations page."),("Pick a dataset for the draft experiment set on the Metrics or Experiment sets page.","Pick a dataset for the draft experiment set on the Experiment sets page.")]
pairs+=[("<span>run'+(BASE_RUNS.length===1?'':'s')+' across agents</span>","<span>evaluation'+(BASE_RUNS.length===1?'':'s')+' across agents</span>"),("'Latest: Run '+","'Latest: Evaluation '+"),("<b>Run '+r.number","<b>Evaluation '+r.number"),("Datasets, metrics, experiment sets, runs","Datasets, metrics, experiment sets, evaluations"),('<p class="eyebrow">Evaluations · Evaluations</p>','<p class="eyebrow">Evaluations</p>'),("document.title='Evaluations · '+((pg&&pg[1])||'Overview')+' · HUMAIN ONE'","document.title=(((pg&&pg[1])||'Overview')==='Evaluations'?'Evaluations':'Evaluations · '+((pg&&pg[1])||'Overview'))+' · HUMAIN ONE'")]
pairs+=[("' Run '+Math.min","' Evaluation '+Math.min")]
for a,c in pairs: s=s.replace(a,c)
for a,c in [('Experiment sets','Experiment templates'),('Experiment set','Experiment template'),('experiment sets','experiment templates'),('experiment set','experiment template')]: s=s.replace(a,c)
print('renamed; leftovers:', s.count('Eval set'), s.count('eval set'), "'Run '+" in s)

# ---- identifier rename: parameters, page keys, ids, layer function names ----
idpairs=[("evalSetSummaries","experimentSetSummaries"),("lastEvalSetFor","lastExperimentSetFor"),("consoleLoadEvalSet","consoleLoadExperimentSet"),("consoleEnsureEvalSet","consoleEnsureExperimentSet"),
 ("renderHubEvalSets","renderHubExperimentSets"),("hubSaveEvalSet","hubSaveExperimentSet"),("hubEvalSets","hubExperimentSets"),("evalSetTable","experimentSetTable"),
 ("renderHubRuns","renderHubEvaluations"),("hubRuns","hubEvaluations"),("RUN_SEL","EVALUATION_SEL"),("RUN_NEW","EVALUATION_NEW"),("HUB_RUN_","HUB_EVAL_"),
 ("'runs'","'evaluations'"),('"runs"','"evaluations"'),("runs:['Evaluations'","evaluations:['Evaluations'")]
for a,c in idpairs: s=s.replace(a,c)
s=s.replace("['versions','sources','evaluations','ds','draftBackground','completedCases']","['versions','sources','runs','ds','draftBackground','completedCases']")
s=re.sub(r"\bevalsets\b","experimentsets",s); s=re.sub(r"\bevalset\b","experimentset",s)
s=re.sub(r"\bhr-","ev-",s); s=re.sub(r"\bhr([A-Z])",r"ev\1",s)
# aliases so old links and messages keep working
a1="function showHubPage(page){\n  HUB_PAGE="; assert a1 in s; s=s.replace(a1,"function showHubPage(page){\n  page={evalsets:'experimentsets',runs:'evaluations'}[page]||page;\n  HUB_PAGE=",1)
a2="var q=new URLSearchParams(location.search);APP_MODE="; assert a2 in s; s=s.replace(a2,"var q=new URLSearchParams(location.search);if(q.get('evalset')&&!q.get('experimentset'))q.set('experimentset',q.get('evalset'));if(q.get('page')==='evalsets')q.set('page','experimentsets');if(q.get('page')==='runs')q.set('page','evaluations');APP_MODE=",1)
print('ident leftovers:', len(re.findall(r"\bevalset(s)?\b",s)), s.count('hubRuns'), s.count('RUN_SEL'), len(re.findall(r"\bhr[A-Z-]",s)))
open(ROOT+'Eval_Journey_V110.html','w',encoding='utf-8').write(s)
print('built V110',len(s))
