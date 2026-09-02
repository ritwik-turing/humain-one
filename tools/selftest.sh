#!/bin/bash
# Drives a prototype headlessly and reconciles numbers across screens.
# Usage: tools/selftest.sh Eval_Journey_V7.html
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
  function rowEl(name){return Array.from(document.querySelectorAll('#catRows .mtog')).filter(function(n){return n.innerText.indexOf(name)===0})[0];}
  function setMap(k,v){var sel=document.querySelector('[data-map="'+k+'"]'); sel.value=v; sel.dispatchEvent(new Event('change',{bubbles:true}));}
  try{localStorage.clear();}catch(e){}
  var errs=[]; window.onerror=function(m){errs.push(m)};
  nav('s1');
  T('mapping table renders 8 keys',function(){return document.querySelectorAll('#mapBox tr').length===8});
  setMap('expected','ignore');
  T('unmapping expected makes Accuracy unavailable with the reason',function(){var r=rowEl('Accuracy'); return r.classList.contains('mna') && /No field is mapped to Expected output/.test(r.querySelector('.mwhy').innerText)});
  T('badge drops to 3 of 4',function(){return document.getElementById('catBadge').textContent==='3 of 4 on'});
  setMap('expected','expected');
  T('restoring expected brings Accuracy back to 349 of 380',function(){return /349 of 380/.test(rowEl('Accuracy').querySelector('.mcov').innerText)});
  click('newMetric');
  T('builder opens needing expected output at 349',function(){return /expected output/.test(document.querySelector('#mbuild .needline').innerText) && /349 of 380/.test(document.querySelector('#mbuild .needline').innerText)});
  var ta=document.getElementById('mbPrompt'); ta.value='Given the reply {output}, answer yes if it states a decision.'; ta.dispatchEvent(new Event('input',{bubbles:true}));
  T('dropping {expected_output} moves coverage to 347',function(){return /347 of 380/.test(document.querySelector('#mbuild .needline').innerText)});
  click('mbSave');
  T('saved metric is in the library, marked yours, v1.0.0',function(){var y=Array.from(document.querySelectorAll('#catRows .mtog')).filter(function(n){return n.querySelector('.yours')}); return y.length===1 && y[0].querySelector('.verchip').textContent==='v1.0.0'});
  nav('s2');
  T('jobs list includes a failed job at 0 of total',function(){return Array.from(document.querySelectorAll('#jobsBox tbody tr')).some(function(r){return /failed/.test(r.innerText) && /0\//.test(r.innerText)})});
  T('newest job is LATEST',function(){return !!document.querySelector('#jobsBox tbody tr:first-child .latest')});
  var ag=document.getElementById('aggSel'); ag.value='Sum'; ag.dispatchEvent(new Event('change',{bubbles:true}));
  T('Sum shows Accuracy as 272 of 349 on the board',function(){return document.querySelector('#scoreBox .bv').textContent==='272 of 349'});
  nav('s7');
  T('evidence pack shows the same Sum',function(){return Array.from(document.querySelectorAll('#covBox .cov')).some(function(r){return /Accuracy/.test(r.innerText)&&/272 of 349/.test(r.innerText)})});
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
  var before=CHECKS.length; nav('s5'); document.getElementById('chkDraft').value='The output must name the reference number when one exists.';
  var sb=Array.from(document.querySelectorAll('#s5 button')).filter(function(b){return /^save check$/i.test(b.textContent.trim())})[0]; sb.click();
  T('saving one check adds exactly one',function(){return CHECKS.length===before+1});
  nav('s6');
  T('comparison reports 2 new safety flags',function(){return /2 new safety flags/.test(document.getElementById('cmpHint').innerText)});
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
