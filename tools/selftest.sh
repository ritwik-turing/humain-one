#!/bin/bash
# Drives a prototype headlessly and reconciles numbers across screens.
# Usage: tools/selftest.sh Eval_Journey_V9.html
# No preview pane, no server: file:// plus Chrome --dump-dom. Exit 1 on any FAIL.
set -u
F="${1:?usage: tools/selftest.sh <prototype.html>}"
DIR="$(cd "$(dirname "$F")" && pwd)"; BASE="$(basename "$F")"
TMP="$DIR/_selftest_$BASE"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
python3 - "$DIR/$BASE" "$TMP" << 'PY'
import sys
src,dst=sys.argv[1],sys.argv[2]; s=open(src).read()
harness = r"""
<script>
(function(){
  var R=[]; function T(name,fn){try{var v=fn(); R.push({n:name,ok:!!v,d:String(v).slice(0,90)});}catch(e){R.push({n:name,ok:false,d:'THROW '+e.message});}}
  function click(id){var b=document.getElementById(id); b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));}
  function nav(id){var b=document.querySelector('[data-go="'+id+'"]'); if(b)b.click();}
  function rowEl(name){return Array.from(document.querySelectorAll('#agentSetup .mtog')).filter(function(n){return n.innerText.indexOf(name)===0})[0];}
  function setMap(k,v){var sel=document.querySelector('[data-map="'+k+'"]'); sel.value=v; sel.dispatchEvent(new Event('change',{bubbles:true}));}
  try{localStorage.clear();}catch(e){}
  var errs=[]; window.onerror=function(m){errs.push(m)};
  nav('s1');
  var PRIMARY=(typeof metricTitle==='function')?metricTitle('acc'):'Accuracy';
  if(document.getElementById('newEvalBlank')){
    T('saved agent metric set covers all four Prism definition types',function(){var x=document.getElementById('agentSetup').innerText;return /Prompt/.test(x)&&/Deterministic/.test(x)&&/REST API/.test(x)&&/Agentic/.test(x)});
    T('setup states that Prism metrics are not universal',function(){return /does not mean that a metric applies to every agent/.test(document.getElementById('agentSetup').innerText)});
    if(typeof METRIC_LIBRARY!=='undefined'){
      T('personal metric library is explicit and user scoped',function(){var x=document.getElementById('agentSetup').innerText;return /Your (personal )?library|personal metric library/i.test(x)&&/Private to Ritwik/.test(x)&&/previously created or used/.test(x)});
      T('library copy rules out learning and silent LLM selection',function(){var x=document.getElementById('agentSetup').innerText;return /does not learn from earlier agent uploads/.test(x)&&/no LLM selects metrics for you/.test(x)});
      T('library rows show prior usage history',function(){var root=typeof METRIC_SECTION_V13!=='undefined'?'#agentSetup':'#catRows';var expected=typeof METRIC_SECTION_V13!=='undefined'?allMetrics().length+EXTRA_METRICS.length:allMetrics().length;return document.querySelectorAll(root+' .mhist').length===expected&&/Last used/.test(document.querySelector(root+' .mhist').innerText)});
    }
    click('newEvalBlank');
    T('a new evaluation starts with zero attached metrics',function(){var badge=document.getElementById('catBadge').textContent;return (/^0 attached$/.test(badge)||badge==='0 of 4 attached') && /0 (metrics are )?attached/.test(document.getElementById('metricContext').innerText)});
    if(typeof METRIC_LIBRARY!=='undefined')T('new evaluation keeps the personal library available',function(){var expected=typeof METRIC_SECTION_V13!=='undefined'?allMetrics().length+EXTRA_METRICS.length:allMetrics().length;return /library (remains|is) available/.test(document.getElementById('metricContext').innerText)&&document.querySelectorAll('#catRows .mtog').length===expected});
    nav('s2');
    T('zero metrics produces no fabricated metric score',function(){return /No evaluation metric was attached/.test(document.getElementById('scoreBox').innerText) && document.querySelectorAll('#scoreBox .bcell').length===0});
    nav('s1'); click('newEvalBlank');
    T('saved evaluation restores only its attached definitions',function(){return /^4 of 4 attached/.test(document.getElementById('catBadge').textContent)});
    if(typeof METRIC_SECTION_V13!=='undefined'){
      T('attached and available metrics render in separate sections',function(){return document.querySelectorAll('#attachedRows .mtog').length===4&&document.querySelectorAll('#catRows .mtog').length===3});
      T('library and attached counts are independently visible',function(){return document.getElementById('libBadge').textContent==='7 saved'&&/^4 of 4 attached/.test(document.getElementById('catBadge').textContent)});
    }
  }
  T('mapping table renders 8 keys',function(){return document.querySelectorAll('#mapBox tr').length===8});
  setMap('expected','ignore');
  T('unmapping expected makes the expected-output metric unavailable with the reason',function(){var r=rowEl(PRIMARY); return r.classList.contains('mna') && /No field is mapped to Expected output/.test(r.querySelector('.mwhy').innerText)});
  T('badge drops to 3 of 4',function(){return /3 of 4 (on|attached)/.test(document.getElementById('catBadge').textContent)});
  if(typeof METRIC_SECTION_V13!=='undefined'){
    rowEl(PRIMARY).click();
    T('an attached metric that becomes incompatible can still be removed',function(){return document.querySelectorAll('#attachedRows .mtog').length===3&&rowEl(PRIMARY).classList.contains('mna')});
  }
  setMap('expected','expected');
  T('restoring expected brings the metric back to 349 of 380',function(){return /349 of 380/.test(rowEl(PRIMARY).querySelector('.mcov').innerText)});
  if(typeof METRIC_SECTION_V13!=='undefined')rowEl(PRIMARY).click();
  click('newMetric');
  T('builder opens needing expected output at 349',function(){return /expected output/.test(document.querySelector('#mbuild .needline').innerText) && /349 of 380/.test(document.querySelector('#mbuild .needline').innerText)});
  var ta=document.getElementById('mbPrompt'); ta.value='Given the reply {output}, answer yes if it states a decision.'; ta.dispatchEvent(new Event('input',{bubbles:true}));
  T('dropping {expected_output} moves coverage to 347',function(){return /347 of 380/.test(document.querySelector('#mbuild .needline').innerText)});
  click('mbSave');
  T('saved metric is in the library, marked yours, v1.0.0',function(){var y=USER_METRICS.length===1&&rowEl(USER_METRICS[0].n); return !!y && !!y.querySelector('.yours') && y.querySelector('.verchip').textContent==='v1.0.0'});
  if(typeof RELEASE_REVIEW_V14!=='undefined')T('generated metric rows contain no nested buttons',function(){return document.querySelectorAll('#agentSetup button button').length===0});
  if(typeof SNAP!=='undefined'){
    T('setup freezes a reproducibility snapshot before run',function(){return /Run snapshot/.test(document.getElementById('evalSum').innerText) && document.getElementById('evalSum').innerText.indexOf(SNAP.id)>-1});
  }
  nav('s2');
  T('jobs list includes a failed job at 0 of total',function(){return Array.from(document.querySelectorAll('#jobsBox tbody tr')).some(function(r){return /failed/.test(r.innerText) && /0\//.test(r.innerText)})});
  T('newest job is LATEST',function(){return !!document.querySelector('#jobsBox tbody tr:first-child .latest')});
  if(typeof SNAP!=='undefined'){
    T('latest job exposes its immutable receipt',function(){return /Latest job receipt/.test(document.getElementById('jobsBox').innerText) && document.getElementById('jobsBox').innerText.indexOf(SNAP.dataset)>-1});
    document.querySelector('#scoreBox .bcell').click();
    T('metric drilldown exposes definition and execution provenance',function(){var x=document.querySelector('#scoreBox .bdrill').innerText;return /Definition/.test(x)&&/Frozen execution/.test(x)&&x.indexOf(SNAP.id)>-1});
  }
  var ag=document.getElementById('aggSel'); ag.value='Sum'; ag.dispatchEvent(new Event('change',{bubbles:true}));
  T('Sum shows the expected-output metric as 272 of 349 on the board',function(){return document.querySelector('#scoreBox .bv').textContent==='272 of 349'});
  nav('s7');
  T('evidence pack shows the same Sum',function(){return Array.from(document.querySelectorAll('#covBox .cov')).some(function(r){return r.innerText.indexOf(PRIMARY)>-1&&/272 of 349/.test(r.innerText)})});
  if(typeof SNAP!=='undefined')T('evidence pack carries the run snapshot',function(){return document.getElementById('evBox').innerText.indexOf(SNAP.id)>-1});
  nav('s2'); ag=document.getElementById('aggSel'); ag.value='Average'; ag.dispatchEvent(new Event('change',{bubbles:true}));
  document.querySelector('[data-scale="0-10"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  T('0 to 10 scale shows 7.8',function(){return document.querySelector('#scoreBox .bv').textContent==='7.8'});
  document.querySelector('[data-scale="%"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  click('scoreCols');
  T('metric score columns appear',function(){return document.querySelectorAll('#resHead th.msch').length>=4});
  T('table score for case 3 equals the grid cell for case 3',function(){var c=document.querySelectorAll('#caserows tr')[2].querySelector('td.msc').textContent; var g=document.querySelectorAll('#gridBox .grow')[0].querySelectorAll('.gcells i')[2].getAttribute('title'); return c===g+'%' ? c : c+' vs '+g});
  click('scoreCols');
  nav('s1');
  T('calibration lists every judge metric',function(){return document.querySelectorAll('#calibBox tbody tr').length===allMetrics().filter(function(m){return m.by==='judge'}).length});
  if(document.querySelector('.prismtabs')){
    T('calibration is placed in the Prism tab sequence',function(){return /AgentDataMetriccalibrationImport/.test(document.querySelector('.prismtabs').innerText.replace(/\s/g,'')) && document.querySelector('.prismtab.on').textContent==='Metric calibration'});
    T('setup explains independent per-datapoint execution',function(){return /380 independent datapoints/.test(document.querySelector('.execnote').innerText)});
  }
  if(document.getElementById('cmpBasis')){
    T('Prism setup tabs are real navigation buttons',function(){return document.querySelectorAll('.prismtabs button[data-setup-target]').length===4});
  }
  var before=CHECKS.length;
  if(typeof RELEASE_REVIEW_V14!=='undefined'){
    nav('s4');
    T('failure grouping leads to measurement before rerun',function(){return !document.querySelector('#s4 #rerunBtn')&&!!document.querySelector('#s4 [data-go="s5"]')});
  }
  nav('s5');
  if(typeof METRIC_SECTION_V13!=='undefined'){
    T('step five says it measures a fix rather than editing the agent',function(){var x=document.getElementById('s5').innerText;return /Make the fix measurable/.test(x)&&/does not change your agent/.test(x)&&/outside this screen/.test(x)});
    T('regression metric starts from a named reviewed failure',function(){var x=document.getElementById('s5').innerText;return /Stops before the end of the input/i.test(x)&&/2 reviewed cases/i.test(x)});
    T('judge contract names all inputs and limits the LLM role',function(){var x=document.getElementById('s5').innerText;return /Input \+ Output \+ Trace/.test(x)&&/as the judge only/.test(x)&&/does not edit the agent/.test(x)});
    T('calibration sample is distinguished from current attention cases',function(){var x=document.getElementById('s5').innerText;return /20 previously human-reviewed calibration cases/.test(x)&&/separate from the 14 attention cases/.test(x)});
    T('save scope is library plus this evaluation only',function(){var x=document.getElementById('s5').innerText;return /personal metric library/.test(x)&&/attaches it to this evaluation/.test(x)&&!/every future run/.test(x)});
  }
  if(typeof RELEASE_REVIEW_V14!=='undefined'){
    T('selected regression source follows the largest reviewed failure group',function(){var g=groupCounts(),ks=Object.keys(g).sort(function(a,b){return g[b]-g[a]});return document.getElementById('checkGroupTitle').textContent===TAGS[ks[0]]&&document.getElementById('checkGroupBadge').textContent===g[ks[0]]+' reviewed cases'});
    T('actual agent-change rerun appears only after the metric workflow',function(){return !!document.querySelector('#s5 #rerunBtn')&&/changed the agent/i.test(document.querySelector('#s5 #rerunBtn').textContent)});
    T('seeded evidence has no ghost regression metric',function(){return CHECKS.length===0&&!/Your regression metrics/.test(document.getElementById('covBox').innerText)});
  }
  document.getElementById('chkDraft').value='The output must name the reference number when one exists.';
  var sb=Array.from(document.querySelectorAll('#s5 button')).filter(function(b){return /^save (check|v1\.0\.0 and attach)$/i.test(b.textContent.trim())})[0]; sb.click();
  T('saving one check adds exactly one',function(){return CHECKS.length===before+1});
  if(typeof METRIC_SECTION_V13!=='undefined')T('saved regression metric is versioned, attached, and uses the stated contract',function(){var m=USER_METRICS[USER_METRICS.length-1];return m.on&&m.ver==='v1.0.0'&&m.need==='inOutTrace'&&/attached to this evaluation/.test(document.getElementById('chkLib').innerText)});
  if(typeof RELEASE_REVIEW_V14!=='undefined'){
    var savedCount=CHECKS.length, savedMetric=USER_METRICS[USER_METRICS.length-1]; sb.click();
    T('saving the same regression metric twice does not duplicate it',function(){return CHECKS.length===savedCount});
    document.querySelector('#chkLib [data-togglechk]').click();
    T('detaching a regression metric keeps it in the library and removes it from evaluation evidence',function(){return !savedMetric.on&&CHECKS.length===savedCount&&/not attached/.test(document.getElementById('chkLib').innerText)&&/not attached/.test(document.getElementById('covBox').innerText)});
    document.querySelector('#chkLib [data-togglechk]').click();
    T('a saved regression metric can be explicitly reattached',function(){return savedMetric.on&&/attached to this evaluation/.test(document.getElementById('chkLib').innerText)});
  }
  nav('s6');
  T('comparison reports 2 new safety flags',function(){return /2 new safety flags/.test(document.getElementById('cmpHint').innerText)});
  if(document.getElementById('cmpScope')){
    var cp=document.getElementById('cmpScope'); cp.value='evals'; cp.dispatchEvent(new Event('change',{bubbles:true}));
    T('comparison matches evaluations on shared case IDs',function(){return /342 shared cases matched by case ID/.test(document.getElementById('cmpMatch').innerText) && /Safety baseline v2/i.test(document.getElementById('cmpPrevH').innerText)});
    if(typeof SNAP!=='undefined')T('comparison excludes metric version drift from deltas',function(){return /identical metric versions/.test(document.getElementById('cmpBasis').innerText) && /Version drift/.test(document.getElementById('cmpUnmatched').innerText)});
    if(document.getElementById('cmpBasis')){
      T('unmatched cases and metric differences stay visible',function(){return /38 cases/.test(document.getElementById('cmpUnmatched').innerText) && /Metric-set difference/.test(document.getElementById('cmpUnmatched').innerText)});
      var from=document.getElementById('cmpFrom'); from.value='quality'; from.dispatchEvent(new Event('change',{bubbles:true}));
      T('changing the source evaluation changes the comparison',function(){return /305 shared cases matched by case ID/.test(document.getElementById('cmpMatch').innerText) && /Service quality v1/i.test(document.getElementById('cmpPrevH').innerText)});
      T('current evaluation is fixed as the destination',function(){return document.getElementById('cmpTo').disabled && document.getElementById('cmpTo').options.length===1});
    }
  }
  nav('s2');
  if(document.getElementById('cmpBasis')){
    T('evaluation actions include Edit, Duplicate and Run again',function(){var x=document.querySelector('#jobsBox .hd').innerText;return /Edit/.test(x)&&/Duplicate/.test(x)&&/Run again/.test(x)});
    T('performance includes range, total and completion',function(){var x=document.getElementById('perfStrip').innerText;return /range/.test(x)&&/total/.test(x)&&/complete/.test(x)});
    document.querySelector('#jobsBox [data-setup-target="agentSetup"]').click();
    T('Edit returns to the saved evaluation pairing',function(){return document.querySelector('.screen.on').id==='s1' && !!document.getElementById('agentSetup')});
    nav('s2'); document.querySelector('.prismtabs [data-setup-target="importSources"]').click();
    T('Import tab returns to the existing import sources',function(){return document.querySelector('.screen.on').id==='s1' && !!document.getElementById('importSources')});
  }
  if(typeof RELEASE_REVIEW_V14!=='undefined'){
    nav('s1'); var del=document.querySelector('[data-rmmet="'+savedMetric.k+'"]');
    T('saved regression metric exposes a separate library delete control',function(){return !!del});
    if(del)del.click();
    T('deleting a regression metric removes the same identity from library, calibration, and checks',function(){return !USER_METRICS.some(function(m){return m.k===savedMetric.k})&&!CHECKS.some(function(c){return c.metricKey===savedMetric.k})&&!document.querySelector('[data-rmmet="'+savedMetric.k+'"]')});
  }
  var t=''; ['s1','s2','s3','s4','s5','s6','s7','s8'].forEach(function(id){nav(id); t+=document.getElementById(id).innerText;});
  T('no undefined, NaN or [object on any screen',function(){return !/undefined|NaN|\[object/.test(t)});
  T('no runtime errors',function(){return errs.length===0 ? true : errs.join(' | ')});
  var pre=document.createElement('pre'); pre.id='__selftest'; pre.textContent=JSON.stringify(R); document.body.appendChild(pre);
})();
</script>
</body>"""
open(dst,"w").write(s.replace("</body>",harness,1))
PY
DOM="$DIR/_selftest_dom.html"
"$CH" --headless=new --disable-gpu --virtual-time-budget=4000 --dump-dom "file://$TMP" > "$DOM" 2>/dev/null
rm -f "$TMP"
python3 - "$BASE" "$DOM" << 'PY'
import sys,json,re,html,os
base=sys.argv[1]; dom=open(sys.argv[2]).read(); os.remove(sys.argv[2])
m=re.search(r'<pre id="__selftest">([\s\S]*?)</pre>',dom)
if not m: print("SELFTEST: no results block; page did not finish or threw before assertions"); sys.exit(1)
R=json.loads(html.unescape(m.group(1)))
fails=[r for r in R if not r["ok"]]
for r in R: print(("PASS " if r["ok"] else "FAIL ")+r["n"]+("" if r["ok"] else "  ->  "+r["d"]))
print(f"{base}: {len(R)-len(fails)} of {len(R)} passed")
sys.exit(1 if fails else 0)
PY
