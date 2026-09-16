
/* ===================== V65 · datasets: named, versioned tables =====================
   A dataset is uploaded once, mapped once, given a name, and kept as a table. Every update is a new
   version. Eval sets pin a dataset version. The existing data workspace (sources, preview, mapping)
   becomes the dataset editor; the hub Datasets page shows the library. */
var DATASETS=[], DS_EDIT=null, DS_VIEW=null, DS_CONFIRM=null;
function dsById(id){return DATASETS.find(function(d){return d.id===id})||null;}
function dsUsedBy(d){return BASELINES.filter(function(b){return (b.sources||[]).some(function(s){return s.datasetId===d.id});});}
function dsPinned(){var s=SOURCE_ATTACHMENTS[0];return s&&s.datasetId?dsById(s.datasetId):null;}
function dsInputFields(d){var srcs=(d.sources&&d.sources.length)?d.sources:[{mapping:d.mapping,inputMode:d.inputMode}];var modes=srcs.map(function(x){return x.inputMode||'fields'});
  if(modes.every(function(m){return m==='record'}))return 'whole record';
  if(modes.some(function(m){return m==='record'}))return 'per source';
  var keys=[];srcs.forEach(function(x){Object.keys(x.mapping||{}).forEach(function(k){if(x.mapping[k]==='input'&&keys.indexOf(k)<0)keys.push(k)})});return keys.join(', ')||'none';}
function dsSourceLabel(d){var n=(d.sources||[]).length;return n>1?n+' sources · '+esc(d.sources.map(function(x){return x.name}).join(', ')):esc(d.source);}
function dsExpectedFields(d){return Object.keys(d.mapping||{}).filter(function(k){return d.mapping[k]==='expected'}).join(', ');}
function dsDate(iso){try{return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}catch(_e){return '';}}
function dsSlug(name){return String(name||'').trim();}
function dsSnapshotDraft(){syncSourceMapping();return {sources:baselineClone(SOURCE_ATTACHMENTS),cases:baselineClone(DRAFT_CASES||[]),background:baselineClone(DRAFT_BACKGROUND||[]),map:baselineClone(MAP),inputMode:INPUT_MODE,confirmed:MAP_CONFIRMED,attached:DATA_ATTACHED,dsName:CFG.dsName,source:CFG.source,active:ACTIVE_SOURCE};}
function dsRestoreDraft(s){SOURCE_ATTACHMENTS=baselineClone(s.sources);DRAFT_CASES=baselineClone(s.cases);DRAFT_BACKGROUND=baselineClone(s.background);MAP=baselineClone(s.map);INPUT_MODE=s.inputMode;MAP_CONFIRMED=s.confirmed;DATA_ATTACHED=s.attached;CFG.dsName=s.dsName;CFG.source=s.source;ACTIVE_SOURCE=s.active||0;}
function dsClearDraft(){SOURCE_ATTACHMENTS=[];DRAFT_CASES=[];DRAFT_BACKGROUND=[];DATA_ATTACHED=false;MAP_CONFIRMED=false;ACTIVE_SOURCE=0;WAREHOUSE.open=false;WAREHOUSE.imported=false;WAREHOUSE.sourceImported=false;WAREHOUSE.step='providers';dsOpen=false;}
function dsLoadIntoDraft(d){SOURCE_ATTACHMENTS=baselineClone(d.sources).map(function(s){s.datasetId=d.id;s.datasetName=d.name;s.datasetVersion=d.version;s.confirmed=true;return s;});DRAFT_CASES=baselineClone(d.cases);DRAFT_BACKGROUND=baselineClone(d.background);MAP=baselineClone(d.mapping);INPUT_MODE=d.inputMode;MAP_CONFIRMED=true;DATA_ATTACHED=true;ACTIVE_SOURCE=0;CFG.dsName=d.name+' v'+d.version;CFG.source='<b>'+esc(d.provider)+'</b> &middot; '+esc(d.source)+' &middot; dataset '+esc(d.name)+' v'+d.version;WAREHOUSE.open=false;}
function dsCanSave(){return !!(DS_EDIT&&dsSlug(DS_EDIT.name)&&DATA_ATTACHED&&draftTotalCases()>0&&SOURCE_ATTACHMENTS.length&&SOURCE_ATTACHMENTS.every(function(s){return s.confirmed})&&MAP_CONFIRMED&&mapHas('input'));}
function dsRecordFromDraft(name,base,keepIdentity){
  syncSourceMapping();var src=SOURCE_ATTACHMENTS[0]||{},cases=baselineClone(draftCases()),bg=baselineClone(DRAFT_BACKGROUND||[]),all=cases.concat(bg),now=new Date().toISOString();
  var rec={id:keepIdentity&&base?base.id:'dataset-'+Date.now().toString(36)+'-'+DATASETS.length,familyId:base?base.familyId:'family-'+Date.now().toString(36),name:dsSlug(name),version:keepIdentity&&base?base.version:(base?base.version+1:1),created:keepIdentity&&base?base.created:now,updated:now,provider:src.provider||'Upload',source:src.name||CFG.dsName,sources:baselineClone(SOURCE_ATTACHMENTS).map(function(s){delete s.datasetId;delete s.datasetName;delete s.datasetVersion;return s;}),cases:cases,background:bg,mapping:baselineClone(MAP),inputMode:INPUT_MODE,count:all.length,expected:all.filter(hasLabel).length};
  return rec;
}
function dsEnsureDraft(){if(BASELINE_DRAFT)return;var b=activeBaseline();if(b)loadBaseline(b);BASELINE_DRAFT=true;BASELINE_REASON='';toast('Eval set '+(BASELINES.length+1)+' draft started. Saved versions stay frozen.');}
function dsRefresh(){applyCopy();renderSetup();if(APP_MODE==='hub'){syncModeChrome();var zh=document.querySelector('#baselineSources .zone-head b');if(zh)zh.textContent='Sources in this dataset';}}
function dsStart(mode,id){
  dsEnsureDraft();var d=id?dsById(id):null;if(mode==='edit'&&!d)return;
  DS_EDIT={mode:mode,id:id||null,name:d?d.name:'',backup:dsSnapshotDraft()};DS_VIEW=null;DS_CONFIRM=null;
  if(mode==='new'){dsClearDraft();}else{dsLoadIntoDraft(d);}
  persist();dsRefresh();
  var imp=document.getElementById('importSources'),fma=document.getElementById('fieldMappingArea');
  if(mode==='edit'){if(imp)imp.open=false;if(fma)fma.open=false;window.scrollTo({top:0,behavior:'smooth'});}
  else{if(imp)imp.open=true;WAREHOUSE.imported=false;WAREHOUSE.sourceImported=false;WAREHOUSE.step='providers';dsRefresh();setTimeout(function(){if(imp)imp.scrollIntoView({behavior:'smooth',block:'start'});},60);}
}
function dsCancel(){if(!DS_EDIT)return;dsRestoreDraft(DS_EDIT.backup);DS_EDIT=null;persist();dsRefresh();window.scrollTo({top:0,behavior:'smooth'});}
function dsSave(){
  if(!dsCanSave())return toast(dsWhy());
  var base=DS_EDIT.id?dsById(DS_EDIT.id):null,rec,msg;
  var ids=function(list){return (list||[]).map(function(x){return x.id}).sort().join('|')};
  var sourcesChanged=base&&ids(base.sources)!==ids(SOURCE_ATTACHMENTS);
  if(DS_EDIT.mode==='new'){rec=dsRecordFromDraft(DS_EDIT.name,null,false);DATASETS.push(rec);msg=rec.name+' v1 created · '+rec.sources.length+' source'+(rec.sources.length===1?'':'s')+' · '+rec.count+' cases.';}
  else if(base&&!sourcesChanged&&!dsUsedBy(base).length){rec=dsRecordFromDraft(DS_EDIT.name,base,true);DATASETS[DATASETS.indexOf(base)]=rec;msg=rec.name+' v'+rec.version+' updated in place.';}
  else{rec=dsRecordFromDraft(DS_EDIT.name,base,false);DATASETS.push(rec);msg=rec.name+' v'+rec.version+' saved as a new version'+(sourcesChanged?' because its sources changed':' because v'+base.version+' is pinned by an eval set')+'. v'+base.version+' stays as it was.';}
  var backup=DS_EDIT.backup,wasPinned=base&&(backup.sources[0]||{}).datasetId===base.id;DS_EDIT=null;DS_VIEW=null;
  dsRestoreDraft(backup);if(wasPinned&&BASELINE_DRAFT){dsLoadIntoDraft(rec);CONFIG_DIRTY=true;msg+=' The draft eval set now uses v'+rec.version+'.';}
  persist();dsRefresh();toast(msg);window.scrollTo({top:0,behavior:'smooth'});
}
function dsDelete(id){
  var d=dsById(id);if(!d)return;if(dsUsedBy(d).length)return toast('Pinned by an eval set. Delete that eval set version first.');
  DATASETS.splice(DATASETS.indexOf(d),1);DS_CONFIRM=null;if(DS_VIEW===id)DS_VIEW=null;
  var p=dsPinned();if(p&&p.id===id){dsClearDraft();CONFIG_DIRTY=true;}
  persist();dsRefresh();toast(d.name+' v'+d.version+' deleted.');
}
function dsPin(id){var d=dsById(id);if(!d)return;dsEnsureDraft();dsLoadIntoDraft(d);CONFIG_DIRTY=true;persist();dsRefresh();toast(d.name+' v'+d.version+' pinned to the draft eval set.');}
function dsTable(d){
  var rows=(d.cases||[]).concat(d.background||[]);
  var body=rows.map(function(c,i){var input=c.inp&&c.inp.length?partsCell(c.inp):esc(c.q||'');var expected=c.lab&&typeof c.lab==='object'?partsCell([c.lab]):'<span class="muted">—</span>';return '<tr><td class="ds-n">'+(i+1)+'</td><td>'+input+'</td><td>'+expected+'</td><td>'+esc(c.lang||'EN')+'</td></tr>';}).join('');
  return '<div class="ds-table-wrap"><div class="ds-table-meta"><span><b>'+rows.length+'</b> rows</span><span><b>'+d.expected+'</b> with an expected answer</span><span>input: <b>'+esc(dsInputFields(d))+'</b></span><span>expected: <b>'+esc(dsExpectedFields(d)||'none')+'</b></span><span class="muted">Read-only. Use Edit to change the mapping or Update to upload a new file.</span></div><div class="ds-scroll"><table class="ds-table"><thead><tr><th>#</th><th>Agent input</th><th>Expected answer</th><th>Lang</th></tr></thead><tbody>'+body+'</tbody></table></div></div>';
}
function dsEditorHead(){
  if(!DS_EDIT)return '';
  var base=DS_EDIT.id?dsById(DS_EDIT.id):null,used=base?dsUsedBy(base):[];
  var label=DS_EDIT.mode==='new'?'New dataset':esc(base.name)+' · v'+base.version;
  var note=DS_EDIT.mode==='new'?'Add one or more sources, confirm the field mapping for each, then create the dataset at the bottom of this page.':(used.length?'Pinned by '+used.map(function(b){return esc(b.name||b.reason||'Eval set '+b.version)+' v'+b.version}).join(', ')+'. Any saved change becomes v'+(base.version+1)+'; the pinned version stays frozen.':'Not pinned by an eval set. Renaming or remapping saves in place; changing the sources creates v'+(base.version+1)+'.');
  return '<div class="ds-editor-head" id="dsEditorHead"><div class="ds-editor-main"><span class="eyeline">'+(DS_EDIT.mode==='new'?'Create dataset':'Dataset')+'</span><b class="ds-editor-title">'+label+'</b><p class="muted">'+note+'</p></div><div class="ds-editor-acts"><button class="btn ghost" id="dsCancel">'+(DS_EDIT.mode==='new'?'Cancel':'Back to datasets')+'</button></div></div>';
}
function dsEditorFoot(){
  if(!DS_EDIT)return '';
  var base=DS_EDIT.id?dsById(DS_EDIT.id):null,used=base?dsUsedBy(base):[],can=dsCanSave();
  var ids=function(list){return (list||[]).map(function(x){return x.id}).sort().join('|')};var changed=base&&ids(base.sources)!==ids(SOURCE_ATTACHMENTS);
  var action=DS_EDIT.mode==='new'?'Create dataset':(used.length||changed)?'Save as v'+(base.version+1):'Save changes';
  return '<div class="ds-editor-foot"><div class="ds-foot-main"><span class="eyeline">'+(DS_EDIT.mode==='new'?'Create the dataset':'Save the dataset')+'</span><label class="ds-name"><span>Dataset name</span><input id="dsNameInput" type="text" placeholder="e.g. alnoor-eval-cases" value="'+esc(DS_EDIT.name)+'"></label></div><div class="ds-editor-acts"><button class="btn" id="dsSave"'+(can?'':' disabled')+'>'+action+'</button><span class="muted" id="dsWhy">'+dsWhy()+'</span></div></div>';
}
function dsWhy(){var n=SOURCE_ATTACHMENTS.length,unc=SOURCE_ATTACHMENTS.filter(function(x){return !x.confirmed}).length;if(!DS_EDIT)return '';if(!DATA_ATTACHED||!n)return 'Add at least one source to continue.';if(unc||!MAP_CONFIRMED||!mapHas('input'))return 'Confirm the field mapping for '+(unc>1?'all '+unc+' sources':'every source')+' to continue.';if(!dsSlug(DS_EDIT.name))return DS_EDIT.mode==='new'?'Name the dataset to create it.':'Name the dataset to save it.';return n+' source'+(n===1?'':'s')+' · '+draftTotalCases()+' cases · every mapping confirmed.';}
function dsSyncHead(){if(!DS_EDIT)return;var sv=document.getElementById('dsSave'),w=document.getElementById('dsWhy');if(sv)sv.disabled=!dsCanSave();if(w)w.textContent=dsWhy();var ft=document.getElementById('dsEditorFoot');if(ft&&!ft.innerHTML)ft.innerHTML=dsEditorFoot();}
function renderDatasetVersions(){
  var host=document.getElementById('datasetVersions');if(!host)return;
  if(APP_MODE!=='hub'){host.hidden=true;document.body.classList.remove('ds-library');return;}
  host.hidden=false;
  var pinned=dsPinned();
  var list=DATASETS.slice().sort(function(a,b){return a.name===b.name?b.version-a.version:(a.name<b.name?-1:1)});
  var rows=list.map(function(d){
    var used=dsUsedBy(d),inDraft=pinned&&pinned.id===d.id&&BASELINE_DRAFT,open=DS_VIEW===d.id;
    var acts=DS_CONFIRM===d.id
      ?'<span class="ds-confirm">Delete v'+d.version+'? <button class="btn sm danger" data-ds-delete-confirm="'+d.id+'">Delete</button><button class="btn ghost sm" data-ds-delete-cancel="'+d.id+'">Keep</button></span>'
      :'<button class="btn ghost sm" data-ds-edit="'+d.id+'">Edit</button><button class="btn ghost sm danger" data-ds-delete="'+d.id+'"'+(used.length?' disabled title="Pinned by an eval set"':'')+'>Delete</button>';
    var pinCell=inDraft?'<span class="badge b-pre">draft eval set</span>':(BASELINE_DRAFT?'<button class="lnk" data-ds-pin="'+d.id+'">Use in draft</button>':'');
    if(used.length)pinCell=used.map(function(b){return '<span class="badge b-lock">'+esc(b.name||b.reason||'Eval set '+b.version)+' v'+b.version+'</span>'}).join(' ')+(pinCell?' '+pinCell:'');
    if(!pinCell)pinCell='<span class="muted">—</span>';
    return '<tr class="ds-tr" data-ds-row="'+d.id+'" title="Edit this dataset"><td class="ds-name-cell"><b>'+esc(d.name)+'</b><small>'+esc(d.provider)+'</small></td><td><span class="badge b-lock">v'+d.version+'</span></td><td class="ds-src">'+dsSourceLabel(d)+'</td><td class="ds-num">'+d.count+'</td><td class="ds-num">'+d.expected+'</td><td class="ds-fields">'+esc(dsInputFields(d))+'</td><td class="ds-pinned">'+pinCell+'</td><td class="ds-date">'+dsDate(d.updated)+'</td><td class="ds-acts-cell"><div class="ds-acts">'+acts+'</div></td></tr>';
  });
  var table='<div class="ds-lib-wrap"><table class="ds-lib"><thead><tr><th>Dataset</th><th>Version</th><th>Source</th><th class="ds-num">Cases</th><th class="ds-num">Expected</th><th>Agent input</th><th>Pinned by</th><th>Updated</th><th></th></tr></thead><tbody>'
    +(rows.length?rows.join(''):'<tr><td colspan="9" class="ds-empty-cell"><b>No datasets yet</b><span>Create one: upload a file or connect a source, confirm the field mapping, then name the table.</span></td></tr>')+'</tbody></table></div>';
  host.innerHTML='<div class="zone-head ds-zone"><div><b>Datasets · '+DATASETS.length+'</b><span>A dataset is a named table: uploaded once, mapped once, versioned on every update. Eval sets pin a dataset version.</span></div>'+(DS_EDIT?'':'<button class="btn" id="dsNew">Create dataset</button>')+'</div>'
    +(DS_EDIT?'':table)
    +dsEditorHead();
  var bd=document.querySelector('#dataSetup .bd'),ft=document.getElementById('dsEditorFoot');if(bd&&!ft){ft=document.createElement('div');ft.id='dsEditorFoot';bd.appendChild(ft);}if(ft){ft.innerHTML=DS_EDIT?dsEditorFoot():'';ft.hidden=!DS_EDIT;}
  document.body.classList.toggle('ds-library',HUB_PAGE==='datasets'&&!DS_EDIT);var ln=document.getElementById('baselineLockedNotice');if(ln&&(HUB_PAGE==='datasets'||HUB_PAGE==='metrics'))ln.hidden=true;
  document.body.classList.toggle('ds-editing',HUB_PAGE==='datasets'&&!!DS_EDIT);
}
function renderDsDraftBar(){
  ['runSetup'].forEach(function(id){
    var bd=document.querySelector('#'+id+' .bd');if(!bd)return;var bar=document.getElementById('dsDraftBar-'+id);
    if(APP_MODE!=='hub'){if(bar)bar.hidden=true;return;}
    if(!bar){bar=document.createElement('div');bar.id='dsDraftBar-'+id;bar.className='ds-draft-bar';bd.insertBefore(bar,bd.firstChild);}
    bar.hidden=false;var pinned=dsPinned(),b=activeBaseline();
    if(!BASELINE_DRAFT&&b){var ps=(b.sources||[])[0]||{};bar.innerHTML='<span class="eyeline">Eval set v'+b.version+' · pinned dataset</span><b>'+esc(ps.datasetName||ps.name||'dataset')+(ps.datasetVersion?' v'+ps.datasetVersion:'')+'</b><span class="muted">'+b.count+' cases · frozen with this eval set version</span>';return;}
    if(!DATASETS.length){bar.innerHTML='<span class="eyeline">Draft eval set · dataset</span><b>No datasets yet</b><span class="muted">Add one under Datasets, then pin it here.</span><button class="btn sm" data-hub-page="datasets">Go to Datasets</button>';return;}
    var opts='<option value=""'+(pinned?'':' selected')+'>Pick a dataset…</option>'+DATASETS.map(function(d){return '<option value="'+d.id+'"'+(pinned&&pinned.id===d.id?' selected':'')+'>'+esc(d.name)+' · v'+d.version+' · '+d.count+' cases</option>';}).join('');
    var unsaved=!pinned&&SOURCE_ATTACHMENTS.length?'<span class="muted">Draft source '+esc(SOURCE_ATTACHMENTS.map(function(s){return s.name}).join(', '))+' is not saved as a dataset.</span>':'';
    bar.innerHTML='<span class="eyeline">Draft eval set · dataset</span><label><select class="ds-draft-select">'+opts+'</select></label>'+(pinned?'<span class="muted">'+pinned.count+' cases · '+pinned.expected+' expected outputs · mapping confirmed</span>':unsaved||'<span class="muted">Compatibility and run estimates use the pinned dataset\'s cases.</span>');
  });
  var pre=null;
  if(pre&&APP_MODE==='hub'){var h=pre.querySelector('h3'),p=pre.querySelector('p'),btn=pre.querySelector('.friendly-actions button');if(h)h.textContent=DATASETS.length?'Pick a dataset before choosing metrics':'Add a dataset before choosing metrics';if(p)p.textContent=DATASETS.length?'Choose one of your datasets in the draft eval set bar above. Compatibility is computed against its cases.':'Datasets are named tables under Evaluations › Datasets. Add one, then pin it to the draft eval set here.';if(btn){btn.hidden=!!DATASETS.length;btn.textContent='Go to Datasets';btn.removeAttribute('data-nav-dest');btn.dataset.hubPage='datasets';}}
}
function dsMigrate(){
  if(DATASETS.length)return;var changed=false;
  BASELINES.forEach(function(b){
    var s=(b.setup||{}),first=(b.sources||[])[0];if(!first||first.datasetId)return;
    var all=(s.cases||[]).concat(s.background||[]);
    var rec={id:'dataset-'+b.id,familyId:'family-'+b.id,name:String(first.name||'dataset').replace(/\.(csv|jsonl?|parquet)$/i,''),version:1,created:b.created,updated:b.created,provider:first.provider||'Upload',source:first.name||'',sources:baselineClone(b.sources),cases:baselineClone(s.cases||[]),background:baselineClone(s.background||[]),mapping:baselineClone(s.mapping||MAP),inputMode:s.inputMode||'fields',count:all.length,expected:all.filter(function(c){return c.lab===true||!!(c.lab&&c.lab.t)}).length};
    DATASETS.push(rec);(b.sources||[]).forEach(function(x){x.datasetId=rec.id;x.datasetName=rec.name;x.datasetVersion=1;});if(s.sources)s.sources.forEach(function(x){x.datasetId=rec.id;x.datasetName=rec.name;x.datasetVersion=1;});changed=true;
    if(!BASELINE_DRAFT&&ACTIVE_BASELINE===b.id)SOURCE_ATTACHMENTS.forEach(function(x){x.datasetId=rec.id;x.datasetName=rec.name;x.datasetVersion=1;});
  });
  if(changed)persist();
}
function installDatasets(){
  try{var raw=localStorage.getItem(skey())||localStorage.getItem(skey().replace(KEY,KEY.replace(/v(\d+)$/,function(m,n){return 'v'+(n-1)})));if(raw&&!/[?&]fresh=1/.test(location.search)){var d=JSON.parse(raw);if(d&&Array.isArray(d.datasets))DATASETS=d.datasets;}}catch(_e){}
  var _wp=workspacePayload;workspacePayload=function(){var p=_wp.apply(this,arguments);p.datasets=DATASETS;return p;};
  var _ss=shellState;shellState=function(){var s=_ss.apply(this,arguments);s.datasets=DATASETS.map(function(d){return {id:d.id,name:d.name,version:d.version,cases:d.count,expected:d.expected,provider:d.provider,pinnedBy:dsUsedBy(d).length}});return s;};
  var _rs=renderSetup;renderSetup=function(){_rs.apply(this,arguments);if(APP_MODE==='hub'){var _ln=document.getElementById('baselineLockedNotice');if(_ln&&(HUB_PAGE==='datasets'||HUB_PAGE==='metrics'))_ln.hidden=true;if(DS_EDIT){dsSyncHead();var sv=document.getElementById('dsSave');if(sv){var base=DS_EDIT.id?dsById(DS_EDIT.id):null;var ids=function(list){return (list||[]).map(function(x){return x.id}).sort().join('|')};sv.textContent=DS_EDIT.mode==='new'?'Create dataset':(base&&(dsUsedBy(base).length||ids(base.sources)!==ids(SOURCE_ATTACHMENTS)))?'Save as v'+(base.version+1):'Save changes';}}var zh=document.querySelector('#baselineSources .zone-head b');if(zh)zh.textContent='Sources in this dataset';}};
  var _sync=syncModeChrome;syncModeChrome=function(){_sync.apply(this,arguments);if(APP_MODE==='hub'){renderDsDraftBar();renderDsCompose();renderMetricsChrome();renderDatasetVersions();var ln=document.getElementById('baselineLockedNotice');if(ln&&(HUB_PAGE==='datasets'||HUB_PAGE==='metrics'))ln.hidden=true;var hv=document.getElementById('hubOverview');if(hv&&HUB_PAGE==='overview')renderHubOverview();}};
  var _hub=renderHubOverview;renderHubOverview=function(){_hub.apply(this,arguments);var el=document.querySelector('#hubOverview .hub-card[data-hub-page="datasets"]');if(el){var n=DATASETS.length,cases=DATASETS.reduce(function(a,d){return a+d.count},0);el.innerHTML='<b>'+n+'</b><span>dataset'+(n===1?'':'s')+' · '+cases+' cases</span><small>'+(n?DATASETS.slice(-3).map(function(d){return esc(d.name)+' v'+d.version}).join(', '):'Add a dataset')+'</small>';}};
  document.addEventListener('click',function(e){if(DS_MET_OPEN&&!(e.target.closest&&e.target.closest('#dsMetDD'))){DS_MET_OPEN=false;renderDsCompose();}});
  document.addEventListener('input',function(e){if(e.target&&e.target.id==='esNameInput'){BASELINE_REASON=e.target.value;var sb=document.getElementById('hubSaveEvalSet');if(sb)sb.textContent=e.target.value.trim()?'Save \u201c'+e.target.value.trim()+'\u201d':'Save as Eval set '+(BASELINES.length+1);return;}if(e.target&&e.target.id==='dsMetSearch'){DS_MET_Q=e.target.value;var l=document.getElementById('dsMetList');if(l)l.innerHTML=dsMetListHTML();return;}if(e.target&&e.target.id==='dsNameInput'&&DS_EDIT){DS_EDIT.name=e.target.value;var sv=document.getElementById('dsSave');if(sv)sv.disabled=!dsCanSave();}},true);
  document.addEventListener('change',function(e){if(e.target&&e.target.classList&&e.target.classList.contains('ds-draft-select')){e.stopImmediatePropagation();if(e.target.value)dsPin(e.target.value);return;}
    if(e.target&&e.target.classList&&e.target.classList.contains('ds-met-check')){e.stopImmediatePropagation();var parts=e.target.dataset.dsMet.split(':'),list=parts[0]==='cat'?allMetrics():EXTRA_METRICS,m=list.filter(function(x){return x.k===parts[1]})[0];if(!m)return;dsEnsureDraft();m.on=e.target.checked;CONFIG_DIRTY=true;persist();dsRefresh();}},true);
  window.addEventListener('click',function(e){
    var row=e.target.closest&&e.target.closest('tr[data-ds-row]');var t=e.target.closest&&e.target.closest('button,a,input,select,label');
    if(row&&!t){e.preventDefault();e.stopImmediatePropagation();dsStart('edit',row.dataset.dsRow);return;}
    if(!t||t.tagName!=='BUTTON')return;var d=t.dataset;
    var handled=true;
    if(t.id==='dsNew')dsStart('new');
    else if(t.id==='dsSave')dsSave();
    else if(t.id==='dsCancel')dsCancel();
    else if(d.dsOpen){DS_VIEW=DS_VIEW===d.dsOpen?null:d.dsOpen;renderDatasetVersions();}
    else if(d.dsEdit)dsStart('edit',d.dsEdit);
    else if(d.dsDelete){DS_CONFIRM=d.dsDelete;renderDatasetVersions();}
    else if(d.dsDeleteConfirm)dsDelete(d.dsDeleteConfirm);
    else if(d.dsDeleteCancel){DS_CONFIRM=null;renderDatasetVersions();}
    else if(d.dsPin)dsPin(d.dsPin);
    else if(d.hbEdit)hbEdit(d.hbEdit);
    else if(t.id==='dsMetBtn'){DS_MET_OPEN=!DS_MET_OPEN;renderDsCompose();if(DS_MET_OPEN){var si=document.getElementById('dsMetSearch');if(si)si.focus();}}
    else if(t.id==='dsMetDone'){DS_MET_OPEN=false;renderDsCompose();}
    else if(d.dsMetOff){var parts=d.dsMetOff.split(':'),list=parts[0]==='cat'?allMetrics():EXTRA_METRICS,m=list.filter(function(x){return x.k===parts[1]})[0];if(m){m.on=false;CONFIG_DIRTY=true;persist();dsRefresh();}}
    else handled=false;
    if(handled){e.preventDefault();e.stopImmediatePropagation();}
  },true);
}
function dsAfterModes(){if(APP_MODE==='hub'){dsMigrate();renderDsDraftBar();renderDsCompose();renderMetricsChrome();renderDatasetVersions();}}
installDatasets();

/* ===================== V69 · metrics are agnostic of the dataset ===================== */
function metricsReady(){return (typeof APP_MODE!=='undefined'&&APP_MODE==='hub')||(DATA_ATTACHED&&MAP_CONFIRMED&&mapHas('input'));}
var NEED_COPY={any:'Runs on any case',output:'Needs an agent response',inOutTrace:'Needs the input, the response and the tool trace',label:'Needs an expected answer on the case',textOut:'Needs a text response',textIn:'Needs a text input',expTr:'Needs expected steps on the case'};
function metricRequirement(m){
  if(typeof metricResponseContract==='function'&&metricResponseContract(m)){var cfg=m.config||{};return cfg.reference==='expected'?'Needs an expected answer on the case':'Runs on any case with a response';}
  return NEED_COPY[m.need]||'Runs on any case';
}
var _metricRow=metricRow;
metricRow=function(m,kind){
  if(APP_MODE!=='hub')return _metricRow(m,kind);
  var method=(MECH[m.by]||MECH.code).n;
  return '<div class="library-check ds-lib-row"><div class="library-check-action"><div><b>'+esc(m.n)+'</b><span class="purpose">'+m.d+'</span><div class="selected-check-meta">'+scopeChip(m)+'<span>'+esc(method)+' · '+esc(m.ver||'v1.0.0')+'</span><span>'+esc(metricRequirement(m))+(kind==='extra'?' · +'+m.mult+' run'+(m.mult===1?'':'s')+' per case':'')+'</span></div></div></div><details class="check-detail"><summary>Details</summary><div class="discb">'+byChip(m)+' <span class="verchip">'+(m.ver||'v1.0.0')+'</span>'+resultContractDetails(m)+libraryHistory(m)+'</div></details>'+((m.by==='judge'||m.user)?'<div class="library-check-tools ds-row-acts">'+(m.by==='judge'?'<button type="button" class="btn ghost sm pg-btn" data-hb-play="'+esc(m.k)+'" title="Playground: try this metric on one case">'+PG_ICON+' Playground</button>':'')+(m.user?'<button type="button" class="btn ghost sm" data-hb-edit="'+esc(m.k)+'">Edit</button><button type="button" class="btn ghost sm danger" data-rmmet="'+m.k+'" aria-label="Delete '+esc(m.n)+' from your library">Delete</button>':'')+'</div>':'')+'</div>';
};
var HB_EDITING=null;
function hbBump(ver){var m=/^v(\d+)\.(\d+)\.(\d+)$/.exec(ver||'v1.0.0');return m?'v'+m[1]+'.'+(+m[2]+1)+'.0':'v1.1.0';}
function hbEdit(key){
  var m=USER_METRICS.filter(function(x){return x.k===key})[0];if(!m)return;var c=m.config||{};
  MB={type:m.by||'judge',name:m.n,tags:(m.tags||[]).slice(),reference:c.reference||'none',referenceField:c.referenceField||null};
  if(m.by==='judge'){MB.prompt=c.prompt||c.rule||'';MB.promptModel=c.model;var rc=c.responseContract||{};if(rc.mode==='number'){MB.responseMode='number';MB.rangeMin=rc.minimum;MB.rangeMax=rc.maximum;MB.rangeRubric=rc.rubric;MB.resultPreset=(rc.minimum===1&&rc.maximum===5)?'score5':'custom';if(MB.resultPreset==='custom')MB.responseMode='number';}else{MB.responseMode='list';MB.responses=(rc.responses||[]).map(function(r){return {label:r.label,meaning:r.meaning,highlight:!!r.highlight}});var labels=MB.responses.map(function(r){return r.label}).join('|');MB.resultPreset=labels==='Pass|Fail'?'passfail':'custom';}MB.resultPresetWasPreset=MB.resultPreset!=='custom';}
  if(m.by==='code')MB.code=c.source||CODE_EX;
  if(m.by==='endpoint'){MB.url=c.url;MB.field=c.field;MB.auth=c.auth;MB.secret=c.secret;MB.timeout=c.timeout;MB.reference='service';}
  if(m.by==='agentic'){MB.desc=c.task;MB.agent=c.agent;MB.agentModel=c.model;MB.runtime=c.runtime;MB.credential=c.credential;MB.tools=c.tools;MB.network=c.network;MB.timeout=c.timeout;MB.maxTurns=c.maxTurns;MB.budget=c.budget;MB.evidence=(c.evidence||[]).slice();}
  HB_EDITING=key;openQualityView('create',true);window.scrollTo({top:0,behavior:'smooth'});
}
var _oqv=openQualityView;openQualityView=function(view,a,b){if(typeof APP_MODE!=='undefined'&&APP_MODE==='hub'&&(view==='attached'||!view))view='library';return _oqv.call(this,view,a,b);};
var HB_LAST_SAVED=null;
var _sum=saveUserMetric;saveUserMetric=function(){var before=USER_METRICS.length;_sum.apply(this,arguments);if(typeof APP_MODE!=='undefined'&&APP_MODE==='hub'&&USER_METRICS.length>before){var m=USER_METRICS[USER_METRICS.length-1],msg=m.n+' saved. It is at the top of your library.';
    if(HB_EDITING){var target=USER_METRICS.filter(function(x){return x.k===HB_EDITING})[0];if(target){USER_METRICS.pop();var keep={k:target.k,on:target.on,scope:target.scope,owner:target.owner,yours:target.yours,user:target.user,agents:target.agents,ver:hbBump(target.ver)};Object.keys(m).forEach(function(kk){target[kk]=m[kk]});Object.keys(keep).forEach(function(kk){target[kk]=keep[kk]});target.last='just now';if(JUDGE[m.k]){JUDGE[target.k]=JUDGE[m.k];delete JUDGE[m.k];}m=target;msg=target.n+' updated to '+target.ver+'.';}HB_EDITING=null;}
    else m.on=false;HB_LAST_SAVED=m.k;persist();renderSetup();openQualityView('library',true);toast(msg);setTimeout(function(){var row=document.querySelector('#catRows [data-rmmet="'+m.k+'"]');row=row&&row.closest('.library-check');if(row){row.classList.add('just-saved');row.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){row.classList.remove('just-saved')},3500);}},80);}};
function renderMetricsChrome(){
  if(APP_MODE!=='hub')return;
  var lb=document.querySelector('.quality-nav [data-quality-view="library"]');if(lb){lb.hidden=false;lb.textContent='Metrics';}
  var h=document.querySelector('#agentSetup .metric-heading h3'),sp=document.querySelector('#agentSetup .metric-heading span:not(.section-no)');if(h)h.textContent='Metrics library';if(sp)sp.textContent='How responses get judged: an AI judge, a code function, a REST API or an evaluation agent. Attach metrics to an eval set on the Eval sets page.';
  var lib=document.getElementById('libBadge');if(lib)lib.textContent=allMetrics().concat(EXTRA_METRICS).length+' in the library';
  if(HUB_PAGE==='metrics'&&ACTIVE_QUALITY_VIEW==='attached')openQualityView('library',true);
}
/* --- Eval sets page: compose dataset + metrics + settings --- */
var DS_MET_OPEN=false,DS_MET_Q='';
function dsMetKind(m){return EXTRA_METRICS.indexOf(m)>-1?'extra':'cat';}
function dsMetFit(m){var cases=draftAllCases().length,cv=cases?metricCov(m):null;if(!cv)return {text:metricRequirement(m),blocked:false};if(!cv.ran)return {text:'no compatible case in this dataset',blocked:true};return {text:cv.ran+' of '+cv.total+' cases',blocked:false};}
function dsMetListHTML(){
  var all=allMetrics().concat(EXTRA_METRICS),q=DS_MET_Q.trim().toLowerCase();
  var vis=all.filter(function(m){return !q||(m.n+' '+(m.d||'')).toLowerCase().indexOf(q)>-1});
  var mine=vis.filter(function(m){return m.user||m.yours}).slice().reverse(),rest=vis.filter(function(m){return !(m.user||m.yours)});
  var row=function(m){var fit=dsMetFit(m);return '<label class="ds-dd-row'+(fit.blocked?' blocked':'')+'"><input type="checkbox" class="ds-met-check" data-ds-met="'+dsMetKind(m)+':'+esc(m.k)+'"'+(m.on?' checked':'')+(fit.blocked?' disabled':'')+'><span><b>'+esc(m.n)+'</b><small>'+esc((MECH[m.by]||MECH.code).n)+' · '+esc(m.ver||'v1.0.0')+' · '+esc(fit.text)+(dsMetKind(m)==='extra'?' · +'+m.mult+' run'+(m.mult===1?'':'s')+' per case':'')+'</small></span></label>';};
  if(!vis.length)return '<p class="muted ds-dd-empty">No metric matches.</p>';
  return (mine.length?'<div class="ds-dd-group">Yours · '+mine.length+'</div>'+mine.map(row).join(''):'')+(rest.length?'<div class="ds-dd-group">Team and HUMAIN templates · '+rest.length+'</div>'+rest.map(row).join(''):'');
}
function dsMetricPickHTML(){
  var all=allMetrics().concat(EXTRA_METRICS),b=activeBaseline();
  if(!BASELINE_DRAFT&&b){var names=(b.metrics||[]).map(function(x){var m=all.filter(function(y){return y.k===x.key})[0];return '<span class="ds-chip frozen">'+(m?esc(m.n):esc(x.key))+' <small>'+esc(x.version||'v1.0.0')+'</small></span>'});return '<div class="ds-met-pick"><div class="ds-met-head"><span class="eyeline">Eval set v'+b.version+' · metrics</span><b>'+(b.metrics||[]).length+' pinned</b></div><div class="ds-met-chips">'+(names.join('')||'<span class="muted">No metrics. Platform evidence only.</span>')+'</div></div>';}
  var on=all.filter(function(m){return m.on});
  var chips=on.map(function(m){var fit=dsMetFit(m);return '<span class="ds-chip"><b>'+esc(m.n)+'</b><small>'+esc(fit.text)+'</small><button type="button" data-ds-met-off="'+dsMetKind(m)+':'+esc(m.k)+'" aria-label="Remove '+esc(m.n)+'">×</button></span>'}).join('');
  return '<div class="ds-met-pick"><div class="ds-met-head"><span class="eyeline">Draft eval set · metrics</span><span class="muted">'+(draftAllCases().length?'Compatibility is against the pinned dataset.':'Pin a dataset to see compatibility per metric.')+' <button class="lnk" data-hub-page="metrics">Manage the library</button></span></div>'
    +'<div class="ds-dd" id="dsMetDD"><button type="button" class="ds-dd-btn" id="dsMetBtn" aria-expanded="'+DS_MET_OPEN+'">'+(on.length?on.length+' metric'+(on.length===1?'':'s')+' selected':'Choose metrics')+'<i>▾</i></button><div class="ds-dd-panel"'+(DS_MET_OPEN?'':' hidden')+'><input type="search" class="ds-dd-search" id="dsMetSearch" placeholder="Search metrics" value="'+esc(DS_MET_Q)+'"><div class="ds-dd-list" id="dsMetList">'+dsMetListHTML()+'</div><div class="ds-dd-foot"><span class="muted">'+on.length+' selected</span><button type="button" class="btn sm" id="dsMetDone">Done</button></div></div></div>'
    +'<div class="ds-met-chips">'+(chips||'<span class="muted">No metrics selected. The run records platform evidence only.</span>')+'</div></div>';
}
function renderDsCompose(){
  var bd=document.querySelector('#runSetup .bd');if(!bd||APP_MODE!=='hub')return;
  var comp=document.getElementById('dsCompose');if(!comp){comp=document.createElement('div');comp.id='dsCompose';comp.className='ds-compose ds-flow';}
  var after=document.getElementById('hubEvalSets');if(after&&after.nextSibling!==comp)after.parentNode.insertBefore(comp,after.nextSibling);else if(!after&&comp.parentNode!==bd)bd.insertBefore(comp,bd.firstChild);
  var titles=[['Pick a dataset','One dataset version. It decides which cases the run sends to the agent.'],['Pick metrics','Any number of metrics from the library. Each one judges every compatible case.'],['Choose run cycles','How many times each case runs, and whether cases run in parallel.'],['Review the run configuration','What gets frozen into this eval set version.']];
  var steps=titles.map(function(t,i){var id='dsStep'+(i+1),st=document.getElementById(id);if(!st){st=document.createElement('div');st.id=id;st.className='ds-step';st.innerHTML='<div class="ds-step-h"><span class="hb-n">'+(i+1)+'</span><div><h4>'+t[0]+'</h4><span class="muted">'+t[1]+'</span></div><span class="ds-step-meta" id="'+id+'Meta"></span></div><div class="ds-step-b"></div>';}if(st.parentNode!==comp)comp.appendChild(st);return st;});
  var body=function(i){return steps[i].querySelector('.ds-step-b')};
  var bar=document.getElementById('dsDraftBar-runSetup');if(bar&&bar.parentNode!==body(0))body(0).appendChild(bar);
  var pick=document.getElementById('dsMetricPick');if(!pick){pick=document.createElement('div');pick.id='dsMetricPick';}if(pick.parentNode!==body(1))body(1).appendChild(pick);pick.innerHTML=dsMetricPickHTML();
  var settings=document.querySelector('section.run-settings-panel');if(settings&&settings.parentNode!==body(2))body(2).appendChild(settings);
  var cfg=document.getElementById('runConfigurationDetails');if(cfg&&cfg.parentNode!==body(3))body(3).appendChild(cfg);
  var est=[...document.querySelectorAll('#runWorkspace > section.run-open-section, #dsStep4 section.run-open-section')].filter(function(x){return x.id!=='runConfigurationDetails'})[0];if(est&&est.parentNode!==body(3))body(3).appendChild(est);
  var save=document.querySelector('#runSetup .hub-save');if(save){var wrap=document.getElementById('dsFlowSave');if(!wrap){wrap=document.createElement('div');wrap.id='dsFlowSave';wrap.className='ds-flow-save';}if(wrap.parentNode!==comp)comp.appendChild(wrap);var nm=document.getElementById('esNameField');if(!nm){nm=document.createElement('label');nm.id='esNameField';nm.className='ds-name es-name';nm.innerHTML='<span>Eval set name</span><input type="text" id="esNameInput" placeholder="e.g. Permits baseline · leave empty for Eval set '+(BASELINES.length+1)+'">';wrap.appendChild(nm);}if(nm.parentNode!==wrap)wrap.insertBefore(nm,wrap.firstChild);var ni=document.getElementById('esNameInput');if(ni&&document.activeElement!==ni)ni.value=BASELINE_DRAFT?(BASELINE_REASON||''):'';ni.placeholder='e.g. Permits baseline · leave empty for Eval set '+(BASELINES.length+1);nm.hidden=!BASELINE_DRAFT;if(save.parentNode!==wrap)wrap.appendChild(save);var sb=document.getElementById('hubSaveEvalSet');if(sb&&BASELINE_DRAFT)sb.textContent=(BASELINE_REASON||'').trim()?'Save \u201c'+(BASELINE_REASON||'').trim()+'\u201d':'Save as Eval set '+(BASELINES.length+1);}
  var pinned=dsPinned(),b=activeBaseline(),canStart=DATA_ATTACHED&&MAP_CONFIRMED&&mapHas('input'),on=allMetrics().concat(EXTRA_METRICS).filter(function(m){return m.on}).length;
  var meta=[BASELINE_DRAFT?(pinned?pinned.name+' v'+pinned.version:'Required'):(b&&(b.sources[0]||{}).datasetName?b.sources[0].datasetName+' v'+b.sources[0].datasetVersion:''),BASELINE_DRAFT?on+' selected':((b&&b.metrics||[]).length+' pinned'),RUN_MULT+' run'+(RUN_MULT===1?'':'s')+' per case'+(PARALLEL?' · parallel':''),canStart?draftTotalCases()+' cases × '+RUN_MULT+' = '+(draftTotalCases()*RUN_MULT)+' agent runs':'Waiting for a dataset'];
  steps.forEach(function(st,i){var m=document.getElementById(st.id+'Meta');if(m)m.textContent=meta[i];st.classList.toggle('is-waiting',i>=2&&!canStart&&BASELINE_DRAFT);});
  comp.hidden=false;
}
function hbGroupLibrary(){var cr=document.getElementById('catRows');if(!cr)return;var rows=[...cr.querySelectorAll(':scope > .library-check')];if(!rows.length)return;var mine=rows.filter(function(r){return r.querySelector('[data-rmmet]')}),rest=rows.filter(function(r){return !r.querySelector('[data-rmmet]')});cr.querySelectorAll('.ds-group').forEach(function(g){g.remove()});var frag=document.createDocumentFragment();if(mine.length){var g1=document.createElement('div');g1.className='ds-group';g1.textContent='Yours · '+mine.length;frag.appendChild(g1);mine.slice().reverse().forEach(function(r){frag.appendChild(r)});}if(rest.length){var g2=document.createElement('div');g2.className='ds-group';g2.textContent=(mine.length?'Team and HUMAIN templates':'Library')+' · '+rest.length;frag.appendChild(g2);rest.forEach(function(r){frag.appendChild(r)});}cr.appendChild(frag);}
var _rmc=renderMetricCards;renderMetricCards=function(){_rmc.apply(this,arguments);if(typeof APP_MODE!=='undefined'&&APP_MODE==='hub'){hbGroupLibrary();renderMetricsChrome();if(HUB_PAGE==='evalsets')renderDsCompose();document.body.classList.toggle('ds-nodata',!draftAllCases().length);var pre=document.getElementById('qualityPrereqState');if(pre)pre.hidden=true;}};

/* ===================== V71 · Create metric, rebuilt for the hub ===================== */
var HB_TYPES=[['judge','AI judge','A model reads each response against your instructions and returns a result with a reason.'],['code','Code','A Python function you write scores each response in a sandbox.'],['endpoint','REST API','Your own scoring service receives each case and returns a score.'],['agentic','Evaluation agent','A CLI agent inspects the case, the trace and the evidence, then returns a verdict.']];
var HB_REFS=[['none','The response alone','Judges the response by itself, in the light of the request.','Is the reply polite and does it answer every part?','Runs on every case',['Request','Response']],['expected','The expected answer','Puts the expected answer you mapped on the case next to the response and judges the match.','Does the reply agree with the reference answer?','Runs on cases that have an expected answer',['Request','Response','Expected answer']],['record','A field from the case','Puts a document or field from the case, such as a policy text, next to the response and checks it against it.','Is every claim supported by the policy text?','Runs where that field is filled',['Request','Response','Case field']]];
var HB_CHIPS=[['Answers every part','Check whether the response answers every part of the request. Point out any part that is missing or wrong.','none'],['Polite and clear','Check whether the response is polite, clear and easy to act on for a citizen. Flag jargon, rudeness or ambiguity.','none'],['Matches the expected answer','Compare the response with the expected answer. They must agree in meaning, not in wording. Flag any contradiction or omission.','expected'],['Grounded in the source','Check every claim in the response against the source field. Flag any claim the source does not support.','record']];
var HB_RESULTS=[['passfail','Pass or fail','Two results: Pass, Fail.'],['score5','Score from 1 to 5','A number, 5 means fully met.'],['custom','My own results','Name the results and when to choose each.']];
function hbApplyResult(preset){
  MB.resultPreset=preset;
  if(preset==='passfail'){MB.responseMode='list';MB.responses=[{label:'Pass',meaning:'The response meets the rule.',highlight:false},{label:'Fail',meaning:'The response misses or breaks the rule.',highlight:true}];}
  else if(preset==='score5'){MB.responseMode='number';MB.rangeMin=1;MB.rangeMax=5;MB.rangeRubric='5 means the rule is fully met, 1 means it is not met at all.';}
  else{MB.responseMode='list';if(!MB.responses||MB.responses.length<2||MB.resultPresetWasPreset){MB.responses=[{label:'Meets the rule',meaning:'The response meets every part of the rule.',highlight:false},{label:'Needs improvement',meaning:'The response misses or contradicts part of the rule.',highlight:true},{label:'Not enough information',meaning:'The available information is insufficient to decide.',highlight:true}];}}
  MB.resultPresetWasPreset=preset!=='custom';
}
function hbNeeds(){
  var t=MB.type||'judge',ref=MB.reference||'none';
  if(t==='endpoint')return 'Runs on every case that has a response.';
  if(t==='agentic')return 'Runs on every case that has a response. One isolated process per case.';
  if(t==='code'){var c=(MB.code==null?CODE_EX:MB.code).split('def evaluate')[1]||'';return /expected_output/.test(c)?'Runs on cases that have an expected answer (the code reads expected_output).':'Runs on every case that has a response.';}
  return ref==='expected'?'Runs on cases that have an expected answer.':ref==='record'?'Runs on cases where the chosen field is filled.':'Runs on every case.';
}
function hbSummaryText(){
  var t=MB.type||'judge',ref=MB.reference||'none',name=(MB.name||'').trim();
  var how={judge:'An AI judge',code:'A Python function',endpoint:'Your REST API',agentic:'An evaluation agent'}[t];
  var looks=t==='endpoint'?'receives the request, the response and the expected answer when there is one':t==='code'?'receives the request, the response and the expected answer when there is one':ref==='expected'?'reads the response next to the expected answer':ref==='record'?'reads the response next to the field '+(MB.referenceField?'“'+MB.referenceField+'”':'you choose'):'reads the request and the response';
  var result=t==='judge'?((MB.resultPreset||'passfail')==='score5'?'returns a score from 1 to 5':(MB.resultPreset||'passfail')==='passfail'?'returns Pass or Fail':'returns one of '+(judgeResponses().map(function(r){return r.label}).filter(Boolean).join(', ')||'your results')):t==='code'?'returns a score between 0 and 1':t==='endpoint'?'returns the score field you name':'returns a score, a label and the evidence it used';
  return '<b>'+esc(name||'This metric')+'</b>: '+esc(how)+' '+esc(looks)+' and '+esc(result)+', with a short explanation for every case.';
}
function hbRender(){
  var host=document.getElementById('hubBuilder');if(!host)return;
  var t=MB.type||'judge',ref=MB.reference||'none';if(!MB.resultPreset)hbApplyResult('passfail');
  var card=function(x){return '<button type="button" class="hb-card'+(t===x[0]?' on':'')+'" data-hb-type="'+x[0]+'" aria-pressed="'+(t===x[0])+'"><b>'+x[1]+'</b><span>'+x[2]+'</span></button>'};
  var adv=t==='endpoint'||t==='agentic';
  var typeCards='<div class="hb-cards hb-cards-2">'+HB_TYPES.slice(0,2).map(card).join('')+'</div><details class="hb-more"'+(adv?' open':'')+'><summary>Advanced connectors <span class="muted">Bring your own scorer: a REST API or an evaluation agent</span></summary><div class="hb-cards hb-cards-2">'+HB_TYPES.slice(2).map(card).join('')+'</div></details>';
  var evidence;
  if(t==='endpoint'||t==='agentic'){evidence='<p class="hb-note">'+(t==='endpoint'?'Prism posts one case at a time: the request, the response, the expected answer when present, and metadata. Your service decides what to use.':'The agent gets a read-only packet per case: input, response, and optionally the expected answer, the trace and metadata. You choose the optional parts below.')+'</p>';}
  else{evidence='<p class="hb-note">Every case carries the request and the agent\'s response. Some cases also carry an expected answer or extra fields from your dataset. Choose what the judge may hold the response up against; that also decides which cases it can run on.</p><div class="hb-cards hb-cards-3">'+HB_REFS.map(function(x){return '<button type="button" class="hb-card hb-ev'+(ref===x[0]?' on':'')+'" data-hb-ref="'+x[0]+'" aria-pressed="'+(ref===x[0])+'"><span class="hb-ev-chips">'+x[5].map(function(c,i){return '<i'+(i>1?' class="extra"':'')+'>'+c+'</i>'}).join('<em>+</em>')+'<em>→</em><i class="judge">Judge</i></span><b>'+x[1]+'</b><span>'+x[2]+'</span><span class="hb-ev-eg">e.g. “'+x[3]+'”</span><span class="hb-ev-runs">'+x[4]+'</span></button>'}).join('')+'</div>'
    +(ref==='record'?'<label class="hb-field"><span>Which field holds the source information?</span><select id="hbField">'+[['','Choose a field']].concat(referenceFields().map(function(f){return [f.k,f.k]})).map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===(MB.referenceField||'')?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></label>':'');}
  var method='';
  if(t==='judge'){
    var preset=MB.resultPreset||'passfail';
    method='<h4>Instructions for the judge</h4><div class="hb-chips">'+HB_CHIPS.map(function(c){return '<button type="button" class="hb-chip" data-hb-chip="'+esc(c[0])+'">'+esc(c[0])+'</button>'}).join('')+'</div>'
      +'<textarea id="hbPrompt" rows="4" placeholder="Describe the rule in plain words. For example: Check whether the response answers every part of the request. Point out anything missing or wrong.">'+esc(MB.prompt||'')+'</textarea>'
      +'<h4 class="hb-h4">What the judge returns</h4><div class="hb-seg">'+HB_RESULTS.map(function(r){return '<button type="button" class="'+(preset===r[0]?'on':'')+'" data-hb-result="'+r[0]+'" aria-pressed="'+(preset===r[0])+'"><b>'+r[1]+'</b><span>'+r[2]+'</span></button>'}).join('')+'</div>'
      +(preset==='custom'&&(MB.responseMode||'list')==='number'?'<div class="hb-results hb-range"><label class="hb-field"><span>Minimum</span><input type="number" id="hbMin" value="'+esc(String(MB.rangeMin==null?0:MB.rangeMin))+'"></label><label class="hb-field"><span>Maximum</span><input type="number" id="hbMax" value="'+esc(String(MB.rangeMax==null?10:MB.rangeMax))+'"></label><label class="hb-field hb-wide"><span>What the numbers mean</span><input type="text" id="hbRubric" value="'+esc(MB.rangeRubric||'')+'"></label></div>':'')
      +(preset==='custom'&&(MB.responseMode||'list')!=='number'?'<div class="hb-results">'+judgeResponses().map(function(r,i){return '<div class="hb-result-row"><input data-hb-resp="'+i+'" data-hb-key="label" value="'+esc(r.label)+'" placeholder="Result name"><input data-hb-resp="'+i+'" data-hb-key="meaning" value="'+esc(r.meaning)+'" placeholder="Choose this when…"><label class="hb-flag" title="Flag cases with this result for review"><input type="checkbox" data-hb-resp="'+i+'" data-hb-key="highlight"'+(r.highlight?' checked':'')+'> flag</label>'+(judgeResponses().length>2?'<button type="button" class="lnk" data-hb-rm="'+i+'">Remove</button>':'')+'</div>'}).join('')+'<button type="button" class="lnk" id="hbAddResult">+ Add a result</button></div>':'')
      +'<details class="hb-adv"><summary>Model <span class="muted">'+esc((MODEL_CATALOG.filter(function(m){return m.id===promptModel()})[0]||{}).label||promptModel())+'</span></summary><div><label class="hb-field"><span>Judge model</span><select id="hbModel">'+MODEL_CATALOG.map(function(m){return '<option value="'+esc(m.id)+'"'+(promptModel()===m.id?' selected':'')+'>'+esc(m.label)+' · '+esc(m.provider)+'</option>'}).join('')+'</select></label><p class="muted">Resolved through the HUMAIN Model Gateway; the exact model version is pinned in every run receipt.</p></div></details>';
  } else if(t==='code'){
    method='<h4>Your function</h4><p class="hb-note">Define <code>evaluate(input, agent_response, expected_output, metadata)</code> and return a score between 0 and 1, a boolean, or a dict with score, passed and explanation. Runs in a RestrictedPython sandbox.</p><textarea id="hbCode" class="hb-code" rows="14" spellcheck="false">'+esc(MB.code==null?CODE_EX:MB.code)+'</textarea>';
  } else if(t==='endpoint'){
    method='<h4>Your scoring service</h4><div class="hb-grid"><label class="hb-field"><span>Endpoint</span><input type="text" id="mbUrl" value="'+esc(MB.url||'https://checks.alnoor.gov.sa/v1/policy')+'"></label><label class="hb-field"><span>Score field in the reply</span><input type="text" id="mbField" value="'+esc(MB.field||'score')+'"></label><label class="hb-field"><span>Authentication</span><select id="mbAuth">'+['Workspace secret','Bearer token','API key header','OAuth 2 client credentials','mTLS'].map(function(o){return '<option'+((MB.auth||'Workspace secret')===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></label><label class="hb-field"><span>Credential reference</span><input type="text" id="mbSecret" value="'+esc(MB.secret==null?'secrets/eval/policy-check':MB.secret)+'"></label><label class="hb-field"><span>Timeout</span><select id="mbTimeout">'+['5 seconds','10 seconds','30 seconds'].map(function(o){return '<option'+((MB.timeout||'10 seconds')===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></label></div><p class="hb-note">Prism posts <code>{ agent_response, input, expected_output, metadata }</code> per case and stores whatever comes back in the score field.</p>';
  } else {
    var ri=agentRunnerInfo(),runner=agentRunner(),ev=agentEvidence();
    method='<h4>The evaluation task</h4><textarea id="hbDesc" rows="4">'+esc(MB.desc||'Inspect the response against the expected output and the trace. Decide whether the response is actionable. Cite the exact evidence used. If the evidence is insufficient, return uncertain, never guess.')+'</textarea>'
      +'<h4 class="hb-h4">Evidence the agent may read</h4><div class="hb-chips">'+[['expected_output','Expected answer'],['trace','Trace'],['metadata','Metadata']].map(function(e){return '<button type="button" class="hb-chip'+(ev.indexOf(e[0])>-1?' on':'')+'" data-hb-ev="'+e[0]+'">'+e[1]+'</button>'}).join('')+'<span class="muted">Input and response are always included.</span></div>'
      +'<h4 class="hb-h4">Runner</h4><div class="hb-grid"><label class="hb-field"><span>Runner</span><select id="mbAgent">'+[['Claude Code CLI','Claude Code CLI'],['Codex CLI','Codex CLI'],['Gemini CLI','Gemini CLI (preview)'],['GitHub Copilot CLI','GitHub Copilot CLI (preview)']].map(function(o){return '<option value="'+o[0]+'"'+(runner===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></label><label class="hb-field"><span>Model</span><select id="mbAgentModel">'+ri.models.map(function(o){var v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+((MB.agentModel||(runner==='Claude Code CLI'?'sonnet':'default'))===v?' selected':'')+'>'+esc(l)+'</option>'}).join('')+'</select></label><label class="hb-field"><span>Where it runs</span><select id="mbRuntime">'+['HUMAIN isolated worker','Customer VPC worker','Self-hosted runner'].map(function(o){return '<option'+((MB.runtime||'HUMAIN isolated worker')===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></label><label class="hb-field"><span>Credential</span><select id="mbCredential">'+ri.credentials.map(function(o){var v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+((MB.credential||ri.credentials[0][0])===v?' selected':'')+'>'+esc(l)+'</option>'}).join('')+'</select></label><label class="hb-field"><span>Tools</span><select id="mbTools">'+['Case packet only - read only','No tools','Approved MCP registry'].map(function(o){return '<option'+((MB.tools||'Case packet only - read only')===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></label><label class="hb-field"><span>Network</span><select id="mbNetwork">'+['Off','Approved domains only'].map(function(o){return '<option'+((MB.network||'Off')===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></label><label class="hb-field"><span>Timeout</span><select id="mbAgentTimeout">'+['30 seconds','60 seconds','120 seconds'].map(function(o){return '<option'+((MB.timeout||'60 seconds')===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></label><label class="hb-field"><span>Budget per case</span><select id="mbBudget">'+[['0.10','$0.10'],['0.20','$0.20'],['0.50','$0.50']].map(function(o){return '<option value="'+o[0]+'"'+(String(MB.budget||'0.20')===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></label></div><input type="hidden" id="mbMaxTurns" value="'+esc(String(MB.maxTurns||6))+'"><p class="hb-note">Fresh process per case, read-only mount, strict JSON result. A timeout or invalid result means no score, never a guessed one.</p>';
  }
  host.innerHTML='<div class="hb"><div class="hb-main">'
    +'<div class="hb-head"><div><span class="eyeline">Metrics library</span><h3>'+(HB_EDITING?'Edit metric':'Create a metric')+'</h3><p class="muted">A metric decides how each case is judged. It lives in the library; attach it to an eval set when you compose one.</p></div><button type="button" class="btn ghost" id="hbCancel">Back to metrics</button></div>'
    +'<section class="hb-sec"><span class="hb-n">1</span><div><h4>How is the response judged?</h4>'+typeCards+'</div></section>'
    +'<section class="hb-sec"><span class="hb-n">2</span><div><h4>What evidence does it get?</h4>'+evidence+'</div></section>'
    +'<section class="hb-sec"><span class="hb-n">3</span><div>'+method+'</div></section>'
    +'<section class="hb-sec"><span class="hb-n">4</span><div><h4>'+(HB_EDITING?'Name it and save':'Name it and create')+'</h4><div class="hb-save"><input type="text" id="mbName" placeholder="Named from the instructions if you leave this empty" value="'+esc(MB.name||'')+'"><button type="button" class="btn" id="hbSave">'+(HB_EDITING?'Save changes':'Create metric')+'</button></div><p class="form-error" id="hbErr" role="status"></p></div></section>'
    +'</div><aside class="hb-side"><div class="hb-sum"><span class="eyeline">What this metric will do</span><p id="hbSummary">'+hbSummaryText()+'</p><div class="hb-needs" id="hbNeeds">'+esc(hbNeeds())+'</div><div class="hb-side-note">'+(HB_EDITING?'Saving creates '+hbBump((USER_METRICS.filter(function(x){return x.k===HB_EDITING})[0]||{}).ver)+'. Eval sets that pinned the earlier version keep it.':'Version v1.0.0 · yours · reusable across eval sets and agents.')+'</div></div></aside></div>';
}
function hbSummarySync(){var s=document.getElementById('hbSummary'),n=document.getElementById('hbNeeds');if(s)s.innerHTML=hbSummaryText();if(n)n.textContent=hbNeeds();}
function hbSync(){
  var picker=document.getElementById('qualityCheckPicker');if(!picker)return;
  var host=document.getElementById('hubBuilder');if(!host){host=document.createElement('div');host.id='hubBuilder';picker.parentNode.insertBefore(host,picker.nextSibling);}
  var on=typeof APP_MODE!=='undefined'&&APP_MODE==='hub'&&ACTIVE_QUALITY_VIEW==='create';
  host.hidden=!on;if(on){if(picker)picker.hidden=true;hbRender();}
}
var _oqv2=openQualityView;openQualityView=function(view,a,b){var r=_oqv2.apply(this,arguments);try{hbSync();}catch(e){}return r;};
function hbSave(){
  var err=document.getElementById('hbErr');if(err)err.textContent='';
  var t=MB.type||'judge';
  if(t==='judge'&&!(MB.prompt||'').trim()){if(err)err.textContent='Write the instructions for the judge first.';var p=document.getElementById('hbPrompt');if(p)p.focus();return;}
  if(t==='judge'&&judgeContractError()){if(err)err.textContent=judgeContractError();return;}
  if((MB.reference||'none')==='record'&&!MB.referenceField&&t!=='endpoint'&&t!=='agentic'){if(err)err.textContent='Choose the field that holds the source information.';return;}
  if(t==='endpoint')MB.reference='service';if(t==='agentic'&&MB.reference==='service')MB.reference='none';
  var host=document.getElementById('hubBuilder'),n=host&&host.querySelector('#mbName');MB.name=(n&&n.value||'').trim();
  /* the engine reads these ids with getElementById; its own hidden form comes first in the DOM, so copy our values into whichever element it will find */
  ['mbName','mbUrl','mbField','mbAuth','mbSecret','mbTimeout','mbAgent','mbAgentModel','mbRuntime','mbCredential','mbTools','mbNetwork','mbAgentTimeout','mbMaxTurns','mbBudget'].forEach(function(id){var mine=host&&host.querySelector('#'+id),first=document.getElementById(id);if(mine&&first&&first!==mine)first.value=mine.value;});
  saveUserMetric();
}
(function(){
  window.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('button');if(!t||!t.closest('#hubBuilder'))return;var d=t.dataset,handled=true;
    if(d.hbType){MB.type=d.hbType;if(MB.type==='endpoint')MB.reference='service';else if(MB.reference==='service')MB.reference='none';hbRender();}
    else if(d.hbRef){MB.reference=d.hbRef;hbRender();}
    else if(d.hbResult){hbApplyResult(d.hbResult);hbRender();}
    else if(d.hbChip){var c=HB_CHIPS.filter(function(x){return x[0]===d.hbChip})[0];if(c){MB.prompt=c[1];if(c[2]!=='none'||!MB.reference)MB.reference=c[2];hbRender();}}
    else if(d.hbEv){var ev=agentEvidence().slice(),i=ev.indexOf(d.hbEv);if(i>-1)ev.splice(i,1);else ev.push(d.hbEv);MB.evidence=ev;hbRender();}
    else if(d.hbRm){judgeResponses().splice(+d.hbRm,1);hbRender();}
    else if(t.id==='hbAddResult'){judgeResponses().push({label:'',meaning:'',highlight:false});hbRender();}
    else if(t.id==='hbSave')hbSave();
    else if(t.id==='hbCancel'){MB={type:'judge'};HB_EDITING=null;openQualityView('library',true);}
    else handled=false;
    if(handled){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  document.addEventListener('input',function(e){var el=e.target;if(!el||!el.closest||!el.closest('#hubBuilder'))return;
    if(el.id==='hbPrompt')MB.prompt=el.value;else if(el.id==='mbName')MB.name=el.value;else if(el.id==='hbMin')MB.rangeMin=el.value;else if(el.id==='hbMax')MB.rangeMax=el.value;else if(el.id==='hbRubric')MB.rangeRubric=el.value;else if(el.id==='hbCode')MB.code=el.value;else if(el.id==='hbDesc')MB.desc=el.value;
    else if(el.dataset.hbResp!=null){var r=judgeResponses()[+el.dataset.hbResp];if(r)r[el.dataset.hbKey]=el.type==='checkbox'?el.checked:el.value;}
    hbSummarySync();},true);
  document.addEventListener('change',function(e){var el=e.target;if(!el||!el.closest||!el.closest('#hubBuilder'))return;
    if(el.id==='hbField'){MB.referenceField=el.value;hbSummarySync();}else if(el.id==='hbModel'){MB.promptModel=el.value;hbRender();}
    else if(el.id==='mbAgent'){MB.agent=el.value;hbRender();}else if(el.id==='mbAgentModel')MB.agentModel=el.value;else if(el.id==='mbRuntime')MB.runtime=el.value;else if(el.id==='mbCredential')MB.credential=el.value;else if(el.id==='mbTools')MB.tools=el.value;else if(el.id==='mbNetwork')MB.network=el.value;else if(el.id==='mbAgentTimeout'||el.id==='mbTimeout')MB.timeout=el.value;else if(el.id==='mbBudget')MB.budget=el.value;else if(el.id==='mbUrl')MB.url=el.value;else if(el.id==='mbField')MB.field=el.value;else if(el.id==='mbAuth')MB.auth=el.value;else if(el.id==='mbSecret')MB.secret=el.value;
    if(el.dataset.hbResp!=null&&el.type==='checkbox'){var r=judgeResponses()[+el.dataset.hbResp];if(r)r.highlight=el.checked;}
    hbSummarySync();},true);
})();

/* ===================== V78 · Eval sets as a table; Create / Edit open the flow ===================== */
var ES_EDIT=null, ES_CONFIRM=null;
function esRunsFor(id){return BASE_RUNS.filter(function(r){return r.receipt&&r.receipt.baseline&&r.receipt.baseline.id===id}).length;}
function esDate(iso){try{return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}catch(_e){return '';}}
function esTableHTML(){
  var sets=evalSetSummaries().slice().reverse();
  var rows=sets.map(function(x){var b=BASELINES.filter(function(y){return y.id===x.id})[0]||{},src=(b.sources||[])[0]||{},runs=x.runs,pinnedNow=!BASELINE_DRAFT&&ACTIVE_BASELINE===x.id;
    var acts=ES_CONFIRM===x.id?'<span class="ds-confirm">Delete '+esc(x.name)+' v'+x.version+'? <button class="btn sm danger" data-es-delete-confirm="'+x.id+'">Delete</button><button class="btn ghost sm" data-es-delete-cancel="'+x.id+'">Keep</button></span>'
      :'<button class="btn ghost sm" data-es-edit="'+x.id+'">Edit</button><button class="btn ghost sm danger" data-es-delete="'+x.id+'"'+(runs?' disabled title="Used by '+runs+' run'+(runs===1?'':'s')+'"':'')+'>Delete</button>';
    return '<tr class="ds-tr" data-es-row="'+x.id+'" title="Edit this eval set (saves as a new version)"><td class="ds-name-cell"><b>'+esc(x.name)+'</b><small>'+esc(x.id)+(pinnedNow?' · current':'')+'</small></td><td><span class="badge b-lock">v'+x.version+'</span></td><td class="ds-src">'+esc(src.datasetName||src.name||'')+(src.datasetVersion?' v'+src.datasetVersion:'')+'</td><td class="ds-num">'+x.cases+'</td><td class="ds-fields">'+(x.metricNames.length?x.metricNames.length+' · '+esc(x.metricNames.join(', ')):'<span class="muted">none</span>')+'</td><td class="ds-num">'+runs+'</td><td class="ds-date">'+esDate(x.created)+'</td><td class="ds-acts-cell"><div class="ds-acts">'+acts+'</div></td></tr>';});
  return '<div class="zone-head ds-zone"><div><b>Eval sets · '+sets.length+'</b><span>An eval set pins one dataset version, a set of metric versions and the run settings. Runs start from an agent\'s Evaluations page.</span></div><button class="btn" id="esNew">Create eval set</button></div>'
    +'<div class="ds-lib-wrap"><table class="ds-lib"><thead><tr><th>Eval set</th><th>Version</th><th>Dataset</th><th class="ds-num">Cases</th><th>Metrics</th><th class="ds-num">Runs</th><th>Created</th><th></th></tr></thead><tbody>'+(rows.length?rows.join(''):'<tr><td colspan="8" class="ds-empty-cell"><b>No eval sets yet</b><span>Create one: pick a dataset, pick metrics, choose run cycles, review, save.</span></td></tr>')+'</tbody></table></div>';
}
function esHeadHTML(){
  if(!ES_EDIT)return '';
  var b=ES_EDIT.id?BASELINES.filter(function(x){return x.id===ES_EDIT.id})[0]:null;
  var title=ES_EDIT.mode==='edit'&&b?'Editing '+esc(b.name||b.reason||'Eval set '+b.version)+' · v'+b.version:'New eval set';
  var note=ES_EDIT.mode==='edit'?'Saved versions stay frozen. Saving creates Eval set '+(BASELINES.length+1)+' with these picks.':'Pick a dataset and metrics, choose the run cycles, review, then save.';
  return '<div class="ds-editor-head" id="esHead"><div class="ds-editor-main"><span class="eyeline">'+(ES_EDIT.mode==='edit'?'Eval set':'Create eval set')+'</span><b class="ds-editor-title">'+title+'</b><p class="muted">'+note+'</p></div><div class="ds-editor-acts"><button type="button" class="btn ghost" id="esCancel">Back to eval sets</button></div></div>';
}
function renderEvalSetTable(){
  var bd=document.querySelector('#runSetup .bd');if(!bd)return;
  var host=document.getElementById('evalSetTable');if(!host){host=document.createElement('div');host.id='evalSetTable';bd.insertBefore(host,bd.firstChild);}
  if(APP_MODE!=='hub'){host.hidden=true;document.body.classList.remove('es-library');return;}
  var library=HUB_PAGE==='evalsets'&&!ES_EDIT;
  host.hidden=!library;if(library)host.innerHTML=esTableHTML();
  var head=document.getElementById('esHead'),comp=document.getElementById('dsCompose');
  if(comp){if(!head){head=document.createElement('div');head.id='esHeadWrap';comp.insertBefore(head,comp.firstChild);}else head=head.id==='esHead'?head.parentNode:head;var hw=document.getElementById('esHeadWrap');if(hw)hw.innerHTML=esHeadHTML();}
  document.body.classList.toggle('es-library',library);
  var ln=document.getElementById('baselineLockedNotice');if(ln&&library)ln.hidden=true;
}
function esStart(mode,id){
  if(running)return toast('Wait for this run to finish.');
  if(mode==='edit'){var b=BASELINES.filter(function(x){return x.id===id})[0];if(!b)return;loadBaseline(b);ACTIVE_BASELINE=b.id;BASELINE_DRAFT=true;BASELINE_REASON=b.name||b.reason||'';}
  else if(!BASELINE_DRAFT){var a=activeBaseline();if(a)loadBaseline(a);BASELINE_DRAFT=true;BASELINE_REASON='';}
  else BASELINE_REASON='';
  ES_EDIT={mode:mode,id:id||null};ES_CONFIRM=null;persist();dsRefresh();window.scrollTo({top:0,behavior:'smooth'});
}
function esDelete(id){
  var b=BASELINES.filter(function(x){return x.id===id})[0];if(!b)return;if(esRunsFor(id))return toast('Used by a run. Runs keep their eval set.');
  BASELINES.splice(BASELINES.indexOf(b),1);ES_CONFIRM=null;
  if(ACTIVE_BASELINE===id){ACTIVE_BASELINE=BASELINES.length?BASELINES[BASELINES.length-1].id:null;if(!BASELINE_DRAFT){BASELINE_DRAFT=true;}}
  persist();dsRefresh();toast((b.name||b.reason||'Eval set '+b.version)+' v'+b.version+' deleted.');
}
(function(){
  var _sb=saveBaseline;saveBaseline=function(){_sb.apply(this,arguments);if(typeof APP_MODE!=='undefined'&&APP_MODE==='hub'&&!BASELINE_DRAFT){ES_EDIT=null;renderEvalSetTable();window.scrollTo({top:0,behavior:'smooth'});}};
  var _sync2=syncModeChrome;syncModeChrome=function(){_sync2.apply(this,arguments);if(typeof APP_MODE!=='undefined'&&APP_MODE==='hub')renderEvalSetTable();};
  var _rdc=renderDsCompose;renderDsCompose=function(){_rdc.apply(this,arguments);if(typeof APP_MODE!=='undefined'&&APP_MODE==='hub'){var hw=document.getElementById('esHeadWrap');if(hw)hw.innerHTML=esHeadHTML();}};
  window.addEventListener('click',function(e){
    var row=e.target.closest&&e.target.closest('tr[data-es-row]');var t=e.target.closest&&e.target.closest('button,a,input,select,label');
    if(row&&!t){e.preventDefault();e.stopImmediatePropagation();esStart('edit',row.dataset.esRow);return;}
    if(!t||t.tagName!=='BUTTON')return;var d=t.dataset,handled=true;
    if(t.id==='esNew')esStart('new');
    else if(t.id==='esCancel'){ES_EDIT=null;dsRefresh();}
    else if(d.esEdit)esStart('edit',d.esEdit);
    else if(d.esDelete){ES_CONFIRM=d.esDelete;renderEvalSetTable();}
    else if(d.esDeleteConfirm)esDelete(d.esDeleteConfirm);
    else if(d.esDeleteCancel){ES_CONFIRM=null;renderEvalSetTable();}
    else handled=false;
    if(handled){e.preventDefault();e.stopImmediatePropagation();}
  },true);
})();

/* ===================== V80 · Runs: agent → version → eval set → run; results; compare ===================== */
var AGENT_CATALOG=[
  {slug:'al-noor-services',name:'Al Noor Services Agent',versions:[['v1.3.0','previous'],['v1.4.0','current · live'],['v1.5.0','draft · unpublished']]},
  {slug:'permit-renewal',name:'Permit Renewal Assistant',versions:[['v2.0.1','current · live'],['v2.1.0','draft · unpublished']]},
  {slug:'citizen-support',name:'Citizen Support Agent',versions:[['v1.1.0','previous'],['v1.2.0','current · live']]},
  {slug:'tourism-concierge',name:'Tourism Concierge',versions:[['v0.9.0','pilot']]}
];
var AGENT_SLUG='al-noor-services', AGENT_NAME='Al Noor Services Agent';
function hrAgentBySlug(slug){return AGENT_CATALOG.filter(function(a){return a.slug===slug})[0]||AGENT_CATALOG[0];}
function hrAgentLabel(ref){if(!ref)return '';var m=/^([^@]+)@(.+)$/.exec(String(ref));if(!m)return String(ref);var a=AGENT_CATALOG.filter(function(x){return x.slug===m[1]})[0];return (a?a.name:m[1])+' v'+m[2];}
var RUN_SEL=[], RUN_NEW=false, HUB_RUN_AGENT=null, HUB_RUN_VER=null, HUB_RUN_SET=null;
function hrAgents(){var live=/^v?1\.5/.test(AGENT_VERSION)?'v1.4.0':AGENT_VERSION;var a=[[live,'current · live']];if(AGENT_DRAFT_READY||/^v?1\.5/.test(AGENT_VERSION)||BASE_RUNS.some(function(r){return /1\.5/.test(String(r.receipt.agent||''))}))a.push(['v1.5.0','draft · unpublished']);return a;}
function hrSetName(id){var b=BASELINES.filter(function(x){return x.id===id})[0];return b?(b.name||b.reason||'Eval set '+b.version)+' · v'+b.version:id;}
function hrDate(ms){if(!ms)return '—';try{return new Date(ms).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}catch(_e){return '';}}
function toConsole(page){document.body.classList.add('runs-flow');APP_MODE='console';var nav=document.getElementById('workflowNav');if(nav)nav.dataset.modeNav='';consoleEnsureEvalSet(new URLSearchParams(''));showConsolePage(page);}
function hrFormHTML(){
  var sets=evalSetSummaries(),agent=hrAgentBySlug(HUB_RUN_AGENT||AGENT_SLUG),vers=agent.versions.slice();
  if(agent.slug==='al-noor-services'&&!AGENT_DRAFT_READY&&!BASE_RUNS.some(function(r){return /1\.5/.test(String(r.receipt.agent||''))}))vers=vers.filter(function(v){return v[0]!=='v1.5.0'});
  var ver=HUB_RUN_VER&&vers.some(function(v){return v[0]===HUB_RUN_VER})?HUB_RUN_VER:(vers.filter(function(v){return /current/.test(v[1])})[0]||vers[vers.length-1])[0];
  var def=HUB_RUN_SET||lastEvalSetFor(ver)||(sets.length?sets[sets.length-1].id:'');
  return '<div class="hr-form"><div class="hr-form-h"><span class="eyeline">New run</span><b>Choose the agent, its version and the eval set. The run creates an entry below and evaluates every case.</b></div><div class="hr-grid">'
    +'<label class="hb-field"><span>Agent</span><select id="hrAgent">'+AGENT_CATALOG.map(function(a){return '<option value="'+a.slug+'"'+(a.slug===agent.slug?' selected':'')+'>'+esc(a.name)+'</option>'}).join('')+'</select></label>'
    +'<label class="hb-field"><span>Agent version</span><select id="hrVersion">'+vers.map(function(v){return '<option value="'+v[0]+'"'+(v[0]===ver?' selected':'')+'>'+v[0]+' · '+v[1]+'</option>'}).join('')+'</select></label>'
    +'<label class="hb-field"><span>Eval set</span><select id="hrSet"'+(sets.length?'':' disabled')+'>'+(sets.length?sets.map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===def?' selected':'')+'>'+esc(x.name)+' · v'+x.version+' · '+x.cases+' cases · '+x.metrics+' metric'+(x.metrics===1?'':'s')+'</option>'}).join(''):'<option value="">No eval set yet</option>')+'</select></label>'
    +'</div><div class="hr-acts"><button type="button" class="btn" id="hrStart"'+(sets.length?'':' disabled')+'>Start run</button>'+'<button type="button" class="btn ghost" id="hrCancelNew">Cancel</button>'+'<span class="muted">'+(sets.length?'The eval set pins the dataset, metrics and run settings. Default is the last one run on this version.':'Create an eval set first. <button class="lnk" data-hub-page="evalsets">Go to Eval sets</button>')+'</span></div></div>';
}
function hrToolbarHTML(){
  var n=RUN_SEL.length,one=n===1,two=n===2,sel1=one?RUN_SEL[0]:null,latest=sel1===RUNS_DONE;
  var two_latest=two&&Math.max.apply(null,RUN_SEL)===RUNS_DONE&&Math.min.apply(null,RUN_SEL)===RUNS_DONE-1;
  var runOf=function(n){return BASE_RUNS.filter(function(r){return r.number===n})[0]};var sameSet=two&&runOf(RUN_SEL[0])&&runOf(RUN_SEL[1])&&runOf(RUN_SEL[0]).receipt.baseline.id===runOf(RUN_SEL[1]).receipt.baseline.id;
  var cmpWhy=!two?'Select two runs to compare':!sameSet?'Runs must share the same eval set version':!two_latest?'This prototype compares only the two latest runs':'';
  return '<div class="hr-toolbar"><span class="hr-toolbar-sel">'+(n?n+' selected':'Select a run')+'</span>'
    +'<button type="button" class="btn sm" id="hrViewResults"'+(one?'':' disabled')+'>View results</button>'
    +'<button type="button" class="btn ghost sm" id="hrReviewCases"'+(one?'':' disabled')+'>Review cases</button>'
    +'<button type="button" class="btn ghost sm" id="hrEvidence"'+(one?'':' disabled')+'>Evidence</button>'
    +'<button type="button" class="btn ghost sm" id="hrCompareTop"'+(cmpWhy?' disabled title="'+esc(cmpWhy)+'"':'')+'>Compare'+(two&&!cmpWhy?' Run '+Math.min.apply(null,RUN_SEL)+' with Run '+Math.max.apply(null,RUN_SEL):'')+'</button>'
    +'<button type="button" class="btn ghost sm" id="hrUpdateAgent"'+(one&&latest?'':' disabled')+(one&&!latest?' title="Update from the latest run"':'')+'>Update agent</button>'
    +(n?'<button type="button" class="lnk" id="hrClearSel">Clear</button>':'')+'</div>';
}
function renderHubRuns(){
  var el=document.getElementById('hubRuns');if(!el)return;
  var rows=BASE_RUNS.slice().reverse().map(function(r){var rc=r.receipt,sel=RUN_SEL.indexOf(r.number)>-1;
    return '<tr class="ds-tr hr-tr'+(sel?' sel':'')+'" data-hr-row="'+r.number+'"><td class="hr-check"><input type="checkbox" class="hr-sel" data-hr-sel="'+r.number+'"'+(sel?' checked':'')+' aria-label="Select run '+r.number+'"></td><td class="ds-name-cell"><b>Run '+r.number+'</b><small>'+esc(rc.run_id||'')+(r.number===RUNS_DONE?' · latest':'')+'</small></td><td>'+esc(hrAgentLabel(rc.agent))+'</td><td class="ds-src">'+esc(hrSetName(rc.baseline&&rc.baseline.id))+'</td><td class="ds-num">'+(rc.coverage&&rc.coverage.attempted!=null?rc.coverage.attempted:r.cases?r.cases.length:'')+'</td><td class="ds-num">'+(rc.settings&&rc.settings.repetitions?rc.settings.repetitions:1)+'</td><td><span class="badge b-gov">Completed</span></td><td class="ds-date">'+hrDate(r.at)+'</td></tr>';});
  el.innerHTML='<p class="eyebrow">Evaluations · Runs</p><h2 class="h1">Runs</h2><p class="sub">Every run in this tenant. Start one here, then select it to view results, review cases, compare or update the agent.</p>'
    +'<div class="card"><div class="bd"><div class="zone-head ds-zone"><div><b>Runs · '+BASE_RUNS.length+'</b><span>A run evaluates one agent version against one eval set. The entry stays here with its evidence.</span></div>'+(RUN_NEW?'':'<button class="btn" id="hrNewRun">New run</button>')+'</div>'
    +(RUN_NEW?hrFormHTML():'')
    +hrToolbarHTML()
    +'<div class="ds-lib-wrap"><table class="ds-lib hr-lib"><thead><tr><th></th><th>Run</th><th>Agent version</th><th>Eval set</th><th class="ds-num">Cases</th><th class="ds-num">Per case</th><th>Status</th><th>Started</th></tr></thead><tbody>'+(rows.length?rows.join(''):'<tr><td colspan="8" class="ds-empty-cell"><b>No runs yet</b><span>New run: choose the agent, its version and an eval set. The run appears here with its results and evidence.</span></td></tr>')+'</tbody></table></div>'
    +'</div></div>';
}
function hrStart(){
  var v=document.getElementById('hrVersion'),s=document.getElementById('hrSet');if(!s||!s.value)return toast('Pick an eval set.');
  if(running)return toast('Wait for the current run to finish.');
  var ag=hrAgentBySlug((document.getElementById('hrAgent')||{}).value||AGENT_SLUG);AGENT_SLUG=ag.slug;AGENT_NAME=ag.name;AGENT_VERSION=v.value;HUB_RUN_AGENT=ag.slug;HUB_RUN_VER=v.value;HUB_RUN_SET=s.value;RUN_NEW=false;
  consoleLoadEvalSet(s.value);persist();
  toConsole('run');setTimeout(function(){try{doRun();}catch(e){toast('Could not start: '+e.message);}},250);
}
(function(){
  try{var raw0=localStorage.getItem(skey());if(raw0){var d0=JSON.parse(raw0);if(d0&&d0.agentSlug){AGENT_SLUG=d0.agentSlug;AGENT_NAME=hrAgentBySlug(AGENT_SLUG).name;}}}catch(_e){}
  var _wp2=workspacePayload;workspacePayload=function(){var p=_wp2.apply(this,arguments);p.agentSlug=AGENT_SLUG;return p;};
  var _crb=consoleRunBar;consoleRunBar=function(){_crb.apply(this,arguments);var sel=document.getElementById('consoleAgentSel');if(sel){var ag=hrAgentBySlug(AGENT_SLUG);sel.innerHTML=ag.versions.filter(function(v){return ag.slug!=='al-noor-services'||v[0]!=='v1.5.0'||AGENT_DRAFT_READY||/1\.5/.test(AGENT_VERSION)}).map(function(v){return '<option value="'+v[0]+'"'+(v[0]===AGENT_VERSION?' selected':'')+'>'+esc(ag.name)+' '+v[0]+' · '+v[1]+'</option>'}).join('');}var lbl=document.getElementById('consoleAgentLabel');if(lbl)lbl.textContent=AGENT_VERSION;};
  var _cap=captureBaselineRun;captureBaselineRun=function(){_cap.apply(this,arguments);var last=BASE_RUNS[BASE_RUNS.length-1];if(last&&!last.at)last.at=Date.now();};
  var _sync3=syncModeChrome;syncModeChrome=function(){_sync3.apply(this,arguments);if(typeof APP_MODE==='undefined')return;
    if(APP_MODE==='console'&&document.body.classList.contains('runs-flow'))document.querySelectorAll('main [data-nav-dest="run"]').forEach(function(b){if(/Back to Run$/i.test(b.textContent.trim()))b.textContent='← Back to Runs';});
    if(APP_MODE==='console'){var ctx=document.querySelector('#workflowNav .nav-context');if(ctx&&!document.getElementById('hrBack')){var b=document.createElement('button');b.id='hrBack';b.type='button';b.className='hr-back';b.textContent='← Runs';ctx.appendChild(b);}}
    if(APP_MODE==='hub'&&HUB_PAGE==='runs')renderHubRuns();};
  function hrBackToRuns(){document.body.classList.remove('runs-flow');APP_MODE='hub';var nav=document.getElementById('workflowNav');if(nav)nav.dataset.modeNav='';showHubPage('runs');}
  window.addEventListener('click',function(e){
    if(document.body.classList.contains('runs-flow')){var nd=e.target.closest&&e.target.closest('[data-nav-dest="run"]');if(nd&&!nd.closest('#workflowNav')){e.preventDefault();e.stopImmediatePropagation();hrBackToRuns();return;}}
    var row=e.target.closest&&e.target.closest('tr[data-hr-row]');if(row&&!(e.target.closest('input,button,a'))){e.preventDefault();e.stopImmediatePropagation();var n=+row.dataset.hrRow,i=RUN_SEL.indexOf(n);if(i>-1)RUN_SEL.splice(i,1);else{RUN_SEL.push(n);if(RUN_SEL.length>2)RUN_SEL.shift();}renderHubRuns();return;}
    var t=e.target.closest&&e.target.closest('button');if(!t)return;var d=t.dataset,handled=true;
    if(t.id==='hrNewRun'){RUN_NEW=true;renderHubRuns();}
    else if(t.id==='hrCancelNew'){RUN_NEW=false;renderHubRuns();}
    else if(t.id==='hrStart')hrStart();
    else if(t.id==='hrViewResults'||t.id==='hrReviewCases'){if(RUN_SEL[0]!==RUNS_DONE)toast('Showing the latest run. Older runs open their evidence.');var rr=BASE_RUNS.filter(function(r){return r.number===RUNS_DONE})[0];if(rr&&rr.receipt&&rr.receipt.agent){var mm=/^([^@]+)@(.+)$/.exec(String(rr.receipt.agent));if(mm){var ag=hrAgentBySlug(mm[1]);AGENT_SLUG=ag.slug;AGENT_NAME=ag.name;AGENT_VERSION='v'+mm[2];}}toConsole('results');}
    else if(t.id==='hrEvidence'){if(RUN_SEL[0]!==RUNS_DONE)toast('Evidence for Run '+RUN_SEL[0]+' opens as the frozen receipt.');toConsole('evidence');}
    else if(t.id==='hrUpdateAgent'){goToSubmitAgent();}
    else if(t.id==='hrClearSel'){RUN_SEL=[];renderHubRuns();}
    else if(t.id==='hrCompareTop'){var a=Math.min.apply(null,RUN_SEL),b2=Math.max.apply(null,RUN_SEL);if(b2===RUNS_DONE&&a===RUNS_DONE-1){toConsole('compare');}else toast('This prototype compares the two latest runs (Run '+(RUNS_DONE-1)+' and Run '+RUNS_DONE+').');}
    else if(t.id==='hrBack')hrBackToRuns();
    else handled=false;
    if(handled){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  document.addEventListener('change',function(e){var el=e.target;if(!el)return;
    if(el.classList&&el.classList.contains('hr-sel')){var n=+el.dataset.hrSel;var i=RUN_SEL.indexOf(n);if(i>-1)RUN_SEL.splice(i,1);else{RUN_SEL.push(n);if(RUN_SEL.length>2)RUN_SEL.shift();}renderHubRuns();return;}
    if(el.id==='hrAgent'){HUB_RUN_AGENT=el.value;HUB_RUN_VER=null;HUB_RUN_SET=null;renderHubRuns();}else if(el.id==='hrVersion'){HUB_RUN_VER=el.value;HUB_RUN_SET=null;renderHubRuns();}else if(el.id==='hrSet')HUB_RUN_SET=el.value;},true);
})();

/* ===================== V82 · Reset demo clears every version's storage ===================== */
resetAll=function(){try{Object.keys(localStorage).filter(function(k){return k.indexOf('eval_journey_')===0}).forEach(function(k){localStorage.removeItem(k)});}catch(e){}try{var u=new URL(location.href);u.searchParams.delete('run');u.searchParams.delete('evalset');location.replace(u.toString());}catch(e){location.reload();}};

/* ===================== V89 · Playground for AI judge metrics ===================== */
var PG_ICON='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6"/><path d="M10 3v6.2L4.6 18.5A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.5L14 9.2V3"/><path d="M7.5 15h9"/></svg>';
var PG={metric:null,prompt:'',model:null,mode:'manual',datasetId:null,caseIx:0,data:'',result:null};
function pgFind(key){return allMetrics().concat(EXTRA_METRICS).filter(function(m){return m.k===key})[0]||null;}
function pgCaseText(parts){return (parts||[]).map(function(p){return p&&p.t==='text'?p.v:(p&&p.v?'['+p.t+'] '+p.v:'')}).filter(Boolean).join(' ');}
function pgCaseJSON(c){if(!c)return '{\n  "input": "",\n  "output": "",\n  "expected_output": ""\n}';var inp=c.inp&&c.inp.length?pgCaseText(c.inp):(c.q||'');var exp=c.lab&&typeof c.lab==='object'?pgCaseText([c.lab]):'';return JSON.stringify({input:inp,output:c.act||'',expected_output:exp},null,2);}
function pgRef(m){var c=m.config||{};return c.reference||(m.need==='label'?'expected':'none');}
function pgEditable(m){return !!(m.user||m.yours);}
function pgOpen(key){var m=pgFind(key);if(!m||m.by!=='judge')return;var c=m.config||{};PG={metric:key,prompt:c.prompt||c.rule||('Rule: '+m.n+'. '+(m.d||'')+'\n\n'+PROMPT_EX),model:c.model||'gemini/gemini-2.5-flash',mode:'manual',datasetId:DATASETS.length?DATASETS[DATASETS.length-1].id:null,caseIx:0,data:pgCaseJSON(null),result:null};document.body.classList.add('pg-open');pgRender();window.scrollTo({top:0,behavior:'smooth'});}
function pgClose(){PG.metric=null;document.body.classList.remove('pg-open');var h=document.getElementById('hubPlayground');if(h)h.hidden=true;renderMetricCards();}
function pgTokens(){var t=(PG.prompt.length+PG.data.length)/4;return Math.round(t);}
function pgHash(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0);}
function pgRun(){
  var m=pgFind(PG.metric);if(!m)return;var c=m.config||{},rc=c.responseContract||{mode:'list',responses:[{label:'Pass'},{label:'Fail'}]};
  var d;try{d=JSON.parse(PG.data||'{}');}catch(e){PG.result={error:'The data input is not valid JSON: '+e.message};pgRenderResult();return;}
  if(!(d.output||'').trim()){PG.result={error:'Add an agent output to judge.'};pgRenderResult();return;}
  if(pgRef(m)==='expected'&&!(d.expected_output||'').trim()){PG.result={label:'Not checked',explanation:'This metric compares the response with an expected answer, and this case has none. Add expected_output or pick a case that carries one.',skipped:true,tokens:pgTokens(),ms:0};pgRenderResult();return;}
  var h=pgHash(PG.prompt+'|'+d.input+'|'+d.output+'|'+(d.expected_output||''));
  var quote=String(d.output).trim().split(/(?<=[.!?])\s+/)[0].slice(0,140);
  var res={tokens:pgTokens()+Math.round(String(d.output).length/4)+60,ms:900+(h%1400)};
  if(rc.mode==='number'){var lo=Number(rc.minimum||0),hi=Number(rc.maximum||10);res.score=lo+Math.round((h%1000)/1000*(hi-lo));res.label=String(res.score)+' of '+hi;res.explanation='Scored '+res.score+' on the range '+lo+'–'+hi+'. '+(rc.rubric||'')+' Evidence: “'+quote+'”';}
  else{var labels=(rc.responses||[]).map(function(r){return r.label}).filter(Boolean);if(!labels.length)labels=['Pass','Fail'];var pick=labels[h%labels.length];var meaning=((rc.responses||[]).filter(function(r){return r.label===pick})[0]||{}).meaning||'';res.label=pick;res.explanation=(meaning?meaning+' ':'')+'Evidence: “'+quote+'”'+(pgRef(m)==='expected'?' Compared with the expected answer for meaning, not wording.':'');res.flag=!!((rc.responses||[]).filter(function(r){return r.label===pick})[0]||{}).highlight;}
  PG.result=res;pgRenderResult();
}
function pgRenderResult(){
  var host=document.getElementById('pgResult');if(!host)return;var r=PG.result;
  if(!r){host.innerHTML='<p class="muted pg-empty">Run the metric to see the judge\'s result.</p>';return;}
  if(r.error){host.innerHTML='<div class="pg-err">'+esc(r.error)+'</div>';return;}
  host.innerHTML='<div class="pg-res"><div class="pg-res-top"><span class="pg-res-label'+(r.skipped?' skipped':r.flag?' flag':'')+'">'+esc(r.label)+'</span><span class="muted">'+(r.ms?(r.ms/1000).toFixed(1)+' s · ':'')+r.tokens+' tokens · '+esc((MODEL_CATALOG.filter(function(x){return x.id===PG.model})[0]||{}).label||PG.model)+'</span></div><p>'+esc(r.explanation)+'</p><p class="muted pg-note">Simulated in this prototype. In production the selected model is called through the HUMAIN Model Gateway and the exact version is recorded.</p></div>';
}
function pgRender(){
  var picker=document.getElementById('qualityCheckPicker');if(!picker)return;
  var host=document.getElementById('hubPlayground');if(!host){host=document.createElement('div');host.id='hubPlayground';picker.parentNode.insertBefore(host,picker.nextSibling);}
  var m=pgFind(PG.metric);if(!m){host.hidden=true;return;}var c=m.config||{},rc=c.responseContract||{mode:'list',responses:[]};
  var contract=rc.mode==='number'?'Returns a score from '+(rc.minimum||0)+' to '+(rc.maximum||10):'Returns one of: '+((rc.responses||[]).map(function(r){return r.label}).filter(Boolean).join(', ')||'Pass, Fail');
  var evidence=pgRef(m)==='expected'?'Reads the response next to the expected answer':pgRef(m)==='record'?'Reads the response next to the case field '+(c.referenceField?'“'+c.referenceField+'”':''):'Reads the request and the response';
  var ds=DATASETS.filter(function(d){return d.id===PG.datasetId})[0]||DATASETS[0]||null;var cases=ds?(ds.cases||[]).concat(ds.background||[]):[];
  host.hidden=false;
  host.innerHTML='<div class="pg"><div class="pg-head"><div><span class="eyeline">Playground</span><h3>'+esc(m.n)+' <span class="badge b-lock">'+esc(m.ver||'v1.0.0')+'</span> <span class="badge b-gov">AI judge</span></h3><p class="muted">Try the metric on one case. Nothing here is attached to an experiment set or saved.</p></div><div class="ds-editor-acts"><button type="button" class="btn ghost" id="pgBack">← Back to metrics</button>'+(m.user?'<button type="button" class="btn ghost" id="pgEdit">Edit metric</button>':'')+'</div></div>'
    +'<div class="pg-bar"><span>'+scopeChip(m)+'</span><span class="muted">'+esc(evidence)+' · '+esc(contract)+'</span><label class="pg-model"><span>Model</span><select id="pgModel">'+MODEL_CATALOG.map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===PG.model?' selected':'')+'>'+esc(x.label)+' · '+esc(x.provider)+'</option>'}).join('')+'</select></label></div>'
    +'<div class="pg-grid"><div class="pg-left"><h4>Judge instructions</h4><textarea id="pgPrompt" rows="14" spellcheck="false"'+(pgEditable(m)?'':' readonly')+'>'+esc(PG.prompt)+'</textarea><div class="pg-est"><span>Est. '+pgTokens()+' tokens per case</span>'+(pgEditable(m)?'<span class="muted">Edits here are for this try only.'+(m.user?' Use Edit metric to save them.':'')+'</span>':'<span class="muted">Team and HUMAIN template instructions are read-only here.</span>')+'</div></div>'
    +'<div class="pg-right"><div class="pg-card"><div class="pg-card-h"><h4>Data input</h4><div class="hb-seg pg-seg"><button type="button" class="'+(PG.mode==='manual'?'on':'')+'" data-pg-mode="manual"><b>Manual</b></button><button type="button" class="'+(PG.mode==='dataset'?'on':'')+'" data-pg-mode="dataset"'+(DATASETS.length?'':' disabled title="No datasets yet"')+'><b>From dataset</b></button></div></div>'
    +(PG.mode==='dataset'?'<div class="pg-pick"><label class="hb-field"><span>Dataset</span><select id="pgDataset">'+DATASETS.map(function(d){return '<option value="'+d.id+'"'+(ds&&d.id===ds.id?' selected':'')+'>'+esc(d.name)+' · v'+d.version+' · '+d.count+' cases</option>'}).join('')+'</select></label><label class="hb-field"><span>Case</span><select id="pgCase">'+cases.map(function(cc,i){return '<option value="'+i+'"'+(i===PG.caseIx?' selected':'')+'>'+(i+1)+' · '+esc((cc.q||pgCaseText(cc.inp)||'case').slice(0,70))+'</option>'}).join('')+'</select></label></div>':'')
    +'<textarea id="pgData" rows="9" spellcheck="false">'+esc(PG.data)+'</textarea><p class="muted pg-hint">Provide <code>input</code>, <code>output</code>'+(pgRef(m)==='expected'?' and <code>expected_output</code>':'')+'. The judge sees exactly this.</p></div>'
    +'<div class="pg-run"><button type="button" class="btn" id="pgRun">▶ Run metric</button></div>'
    +'<div class="pg-card"><h4>Result</h4><div id="pgResult"></div></div></div></div></div>';
  pgRenderResult();
}
(function(){
  window.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('button');if(!t)return;var d=t.dataset,handled=true;
    if(d.hbPlay)pgOpen(d.hbPlay);
    else if(t.id==='pgBack')pgClose();
    else if(t.id==='pgEdit'){var k=PG.metric;pgClose();hbEdit(k);}
    else if(t.id==='pgRun')pgRun();
    else if(d.pgMode){PG.mode=d.pgMode;if(PG.mode==='dataset'){var ds=DATASETS.filter(function(x){return x.id===PG.datasetId})[0]||DATASETS[0];if(ds){PG.datasetId=ds.id;var cases=(ds.cases||[]).concat(ds.background||[]);PG.data=pgCaseJSON(cases[PG.caseIx]||cases[0]);}}PG.result=null;pgRender();}
    else handled=false;
    if(handled){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  document.addEventListener('input',function(e){var el=e.target;if(!el||!el.closest||!el.closest('#hubPlayground'))return;if(el.id==='pgPrompt'){PG.prompt=el.value;var est=document.querySelector('.pg-est span');if(est)est.textContent='Est. '+pgTokens()+' tokens per case';}else if(el.id==='pgData')PG.data=el.value;},true);
  document.addEventListener('change',function(e){var el=e.target;if(!el||!el.closest||!el.closest('#hubPlayground'))return;
    if(el.id==='pgModel')PG.model=el.value;
    else if(el.id==='pgDataset'){PG.datasetId=el.value;PG.caseIx=0;var ds=DATASETS.filter(function(x){return x.id===PG.datasetId})[0];var cases=ds?(ds.cases||[]).concat(ds.background||[]):[];PG.data=pgCaseJSON(cases[0]);PG.result=null;pgRender();}
    else if(el.id==='pgCase'){PG.caseIx=+el.value;var ds2=DATASETS.filter(function(x){return x.id===PG.datasetId})[0];var cs=ds2?(ds2.cases||[]).concat(ds2.background||[]):[];PG.data=pgCaseJSON(cs[PG.caseIx]);PG.result=null;pgRender();}},true);
  var _oqv3=openQualityView;openQualityView=function(){if(PG.metric){PG.metric=null;document.body.classList.remove('pg-open');var h=document.getElementById('hubPlayground');if(h)h.hidden=true;}return _oqv3.apply(this,arguments);};
})();

/* ===================== V90 · clear results for authored judge metrics ===================== */
function crHash(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)%1000/1000;}
function contractResultFor(contract,m,i){
  var v=crHash((m&&m.k||'m')+':'+i);
  if(contract.mode==='number'){var lo=Number(contract.minimum||0),hi=Number(contract.maximum||10),span=hi-lo;var t=v<0.12?0.05:v<0.3?0.35:v<0.62?0.65:0.92;return Math.round(lo+span*t);}
  var rs=contract.responses||[];if(!rs.length)return 'Pass';var good=rs.filter(function(r){return !r.highlight}),bad=rs.filter(function(r){return r.highlight});
  if(good.length&&bad.length)return v<0.72?good[Math.floor(v/0.72*good.length)%good.length].label:bad[Math.floor((v-0.72)/0.28*bad.length)%bad.length].label;
  return rs[Math.floor(v*rs.length)%rs.length].label;
}
function fmtContractResult(m,val){var c=metricResponseContract(m);if(!c||val==null)return val;if(c.mode==='number'&&typeof val==='number')return Math.round(val)+' / '+Number(c.maximum||10);return val;}
function contractSummaryHTML(m){
  var c=metricResponseContract(m),results=(m._results||[]).filter(Boolean).map(function(r){return r.result});if(!c||!results.length)return 'Not scored';
  if(c.mode==='number'){var lo=Number(c.minimum||0),hi=Number(c.maximum||10),avg=results.reduce(function(a,b){return a+b},0)/results.length;var buckets={};results.forEach(function(x){var k=Math.round(x);buckets[k]=(buckets[k]||0)+1});var keys=[];for(var k=lo;k<=hi;k++)keys.push(k);if(keys.length>10)keys=Object.keys(buckets).map(Number).sort(function(a,b){return a-b});var max=Math.max.apply(null,keys.map(function(k){return buckets[k]||0}));
    return '<span class="cr-head"><b>'+(Math.round(avg*10)/10)+'</b><small>/ '+hi+' average</small></span><span class="cr-bars" aria-label="Score distribution">'+keys.map(function(k){var n=buckets[k]||0,px=max?Math.max(2,Math.round(n/max*40)):2;return '<i title="'+n+' case'+(n===1?'':'s')+' scored '+k+'"><small>'+n+'</small><em style="height:'+px+'px"></em><b>'+k+'</b></i>'}).join('')+'</span><span class="cr-legend">'+esc(c.rubric||('Scale '+lo+' to '+hi+', higher is better'))+'</span>';}
  var labels=(c.responses||[]).map(function(r){return r.label}),counts={};results.forEach(function(x){counts[x]=(counts[x]||0)+1});labels=labels.filter(function(l){return counts[l]}).concat(Object.keys(counts).filter(function(l){return labels.indexOf(l)<0}));var total=results.length,hl={};(c.responses||[]).forEach(function(r){hl[r.label]=!!r.highlight});
  var top=labels[0],topPct=Math.round((counts[top]||0)/total*100);
  return '<span class="cr-head"><b>'+topPct+'%</b><small>'+esc(top)+'</small></span><span class="cr-seg" aria-label="Result split">'+labels.map(function(l){return '<i class="'+(hl[l]?'flag':'ok')+'" style="width:'+Math.round(counts[l]/total*100)+'%" title="'+esc(l)+': '+counts[l]+' of '+total+'"></i>'}).join('')+'</span><span class="cr-legend">'+labels.map(function(l){return '<span><i class="'+(hl[l]?'flag':'ok')+'"></i>'+esc(l)+' '+counts[l]+'</span>'}).join('')+'</span>';
}

/* ===================== V90 · storage hygiene: one entry per browser, purge older versions ===================== */
function purgeOldEvalKeys(){try{var keep=[skey(),skey().replace(KEY,KEY.replace(/v(\d+)$/,function(m,n){return 'v'+(n-1)}))];Object.keys(localStorage).filter(function(k){return k.indexOf('eval_journey_')===0&&keep.indexOf(k)<0}).forEach(function(k){localStorage.removeItem(k)});}catch(e){}}
(function(){
  purgeOldEvalKeys();
  var _p=persist;persist=function(){var ok=_p.apply(this,arguments);if(typeof STORAGE_FAILED!=='undefined'&&STORAGE_FAILED){purgeOldEvalKeys();try{var prev=skey().replace(KEY,KEY.replace(/v(\d+)$/,function(m,n){return 'v'+(n-1)}));localStorage.removeItem(prev);}catch(e){}ok=_p.apply(this,arguments);if(STORAGE_FAILED)toast('Browser storage is full; this session will not be saved.');}return ok;};
})();

/* ===================== V90 · the metric library survives loading an experiment set ===================== */
(function(){
  var _lb=loadBaseline;loadBaseline=function(b){var before=(USER_METRICS||[]).slice();_lb.apply(this,arguments);before.forEach(function(u){if(!USER_METRICS.some(function(x){return x.k===u.k})){var c=baselineClone(u);c.on=false;USER_METRICS.push(c);}});};
})();

/* ===================== V91 · charts for every metric kind on the results page ===================== */
function scoreChartHTML(m,headline){
  var cases=allCases(),need=NEEDS[m.need]||NEEDS.any,vals=[];
  cases.forEach(function(c,i){if(!need.ok(c))return;if(typeof caseMetricEligible==='function'&&!caseMetricEligible(m,c))return;vals.push(cellScore(i,m.k,c.fin&&c.loop&&c.out===1));});
  if(!vals.length)return null;
  var edges=[0,20,40,60,80,101],labels=['0–19','20–39','40–59','60–79','80–100'],counts=[0,0,0,0,0];
  vals.forEach(function(v){for(var b=0;b<5;b++){if(v>=edges[b]&&v<edges[b+1]){counts[b]++;break;}}});
  var max=Math.max.apply(null,counts),avg=Math.round(vals.reduce(function(a,b){return a+b},0)/vals.length);
  return '<span class="cr-head"><b>'+headline+'</b><small>'+(AGG==='Sum'?'sum of case scores':'average of '+vals.length+' case scores')+'</small></span><span class="cr-bars cr-bars-5" aria-label="Case score distribution">'+counts.map(function(n,b){var px=max?Math.max(2,Math.round(n/max*40)):2;return '<i title="'+n+' case'+(n===1?'':'s')+' scored '+labels[b]+'" class="'+(b<2?'low':b<3?'mid':'high')+'"><small>'+n+'</small><em style="height:'+px+'px"></em><b>'+labels[b]+'</b></i>'}).join('')+'</span><span class="cr-legend">Each bar counts cases by their score out of 100. Right is better.</span>';
}
function findingChartHTML(m,headline){
  var f=FINDING&&FINDING[m.k];if(!f)return null;var total=totalCases(),hit=f.cases.length,clear=Math.max(0,total-hit),pct=total?Math.round(hit/total*100):0;
  return '<span class="cr-head"><b>'+hit+' of '+total+'</b><small>cases '+esc((f.w&&/found/i.test(f.w))?'found':'flagged')+' · '+pct+'%</small></span><span class="cr-seg" aria-label="Flagged versus clear"><i class="flag" style="width:'+pct+'%" title="Flagged '+hit+'"></i><i class="ok" style="width:'+(100-pct)+'%" title="Clear '+clear+'"></i></span><span class="cr-legend"><span><i class="flag"></i>Flagged '+hit+'</span><span><i class="ok"></i>Clear '+clear+'</span></span>';
}
(function(){
  var _rs2=renderScores;renderScores=function(){_rs2.apply(this,arguments);var box=document.getElementById('scoreBox');if(!box||!hasResults())return;
    var metrics=jobMetrics();
    box.querySelectorAll('.result-metric').forEach(function(btn){var k=btn.dataset.board,m=metrics.filter(function(x){return x.k===k})[0];if(!m)return;var rv=btn.querySelector('.rvalue');if(!rv||rv.classList.contains('na')||rv.classList.contains('authored-results'))return;
      var headline=rv.textContent.trim(),html=null;
      if(EXTRA_METRICS.indexOf(m)>-1||(FINDING&&FINDING[m.k]&&m._score==null))html=findingChartHTML(m,headline);
      else if(m._score!=null)html=scoreChartHTML(m,headline);
      if(html){rv.innerHTML=html;rv.classList.add('authored-results','cr-auto');}});
  };
})();

/* ===================== V92 · demo seed: datasets, metrics, experiment sets and evaluations on an empty workspace ===================== */
function seedNeeded(){return !DATASETS.length&&!BASELINES.length&&!USER_METRICS.length&&!BASE_RUNS.length&&!/[?&]seed=0/.test(location.search)&&(APP_MODE==='hub'||APP_MODE==='console');}
function seedDataset(name,provider,file,mode,daysAgo){
  dsClearDraft();INPUT_MODE=mode||'fields';DATA_ATTACHED=true;MAP_CONFIRMED=true;CFG.dsName=name;CFG.source='<b>'+esc(provider)+'</b> &middot; '+esc(file)+' &middot; added';
  appendDemoSource(provider,file);MAP_CONFIRMED=true;SOURCE_ATTACHMENTS.forEach(function(s){s.confirmed=true;s.inputMode=INPUT_MODE;s.mapping=baselineClone(MAP);});
  var rec=dsRecordFromDraft(name,null,false);rec.created=rec.updated=new Date(Date.now()-daysAgo*864e5).toISOString();DATASETS.push(rec);dsClearDraft();return rec;
}
function seedMetric(o){
  var k='u-seed-'+o.slug,rc=o.rc||null;
  var config=o.by==='judge'?{model:o.model||'gemini/gemini-2.5-flash',rule:o.prompt,prompt:o.prompt,reference:o.reference||'none',referenceField:null,responseContract:rc,schema:judgeSchema(rc),gateway:'HUMAIN Model Gateway',credentialPolicy:'tenant policy',pinning:'exact provider/model version at run start'}
    :{rule:o.name,source:CODE_EX,language:'python',reference:'none',referenceField:null};
  var m={k:k,on:false,need:o.need,by:o.by,n:o.name,scope:'personal',owner:'Ritwik Chakradhar',yours:true,user:true,v:o.v,ver:o.ver||'v1.0.0',last:o.last||'3 days ago',agents:o.agents||1,tags:o.tags||[],config:config,
    d:o.by==='judge'?'Your prompt, run against every datapoint it can read.':'Your function, run in the sandbox against every datapoint it can read.'};
  USER_METRICS.push(m);if(!(rc&&rc.mode==='list'))JUDGE[k]={v:o.v,d:o.name};return m;
}
function seedSet(name,dsId,keys,daysAgo){
  var d=dsById(dsId);if(!d)return null;BASELINE_DRAFT=true;dsLoadIntoDraft(d);allMetrics().concat(EXTRA_METRICS).forEach(function(m){m.on=keys.indexOf(m.k)>-1});BASELINE_REASON=name;
  saveBaseline(false);var b=BASELINES[BASELINES.length-1];if(b){b.created=new Date(Date.now()-daysAgo*864e5).toISOString();}return b;
}
function seedRun(setId,slug,ver,daysAgo){
  var ag=hrAgentBySlug(slug);AGENT_SLUG=ag.slug;AGENT_NAME=ag.name;AGENT_VERSION=ver;
  consoleLoadExperimentSet(setId);if(!prepareBaselineRun())return null;
  prepareDraftCasesForRun();freezeCurrentSnapshot();HIST_PAST.push(currentSnapshot());RUNS_DONE++;captureBaselineRun();LAST_RUN=Date.now()-daysAgo*864e5;RUN_N=totalCases();TOTAL_COST+=runCost();CONFIG_DIRTY=false;AGENT_DRAFT_READY=false;AGENT_REVIEWED=false;AGENT_CHANGE='';DRAFT_CASES=JSON.parse(JSON.stringify(CASES));restoreSeparateDraft();
  var last=BASE_RUNS[BASE_RUNS.length-1];if(last)last.at=Date.now()-daysAgo*864e5;return last;
}
function seedDemo(){
  var prevMode=APP_MODE,prevPage=HUB_PAGE;APP_MODE='hub';
  try{
    var d1=seedDataset('alnoor-eval-cases','CSV upload','alnoor-eval-cases.csv','fields',12);
    var d2=seedDataset('permit-calls-q3','JSON or JSONL','permit-calls-q3.jsonl','record',5);
    seedMetric({slug:'politeness',name:'Politeness check',by:'judge',need:'output',v:71,reference:'none',prompt:'Is the reply polite, clear and easy to act on for a citizen? Flag jargon, rudeness or ambiguity.',rc:{mode:'number',minimum:1,maximum:5,rubric:'5 means the rule is fully met, 1 means it is not met at all.'},last:'3 days ago',agents:2});
    seedMetric({slug:'matches-reference',name:'Matches reference',by:'judge',need:'label',v:78,reference:'expected',prompt:'Compare the response with the expected answer. They must agree in meaning, not in wording. Flag any contradiction or omission.',rc:{mode:'list',responses:[{label:'Pass',meaning:'The response agrees with the expected answer.',highlight:false},{label:'Fail',meaning:'The response contradicts or omits part of the expected answer.',highlight:true}]},last:'yesterday',agents:2});
    seedMetric({slug:'permit-id',name:'Contains permit id',by:'code',need:'output',v:84,last:'6 days ago',agents:1});
    var s1=seedSet('Permits baseline',d1.id,['acc','hsafety','u-seed-politeness'],10);
    var s2=seedSet('Safety and consistency',d1.id,['hsafety','robust','u-seed-matches-reference'],4);
    if(s1){seedRun(s1.id,'al-noor-services','v1.4.0',9);seedRun(s1.id,'al-noor-services','v1.5.0',6);}
    if(s2){seedRun(s2.id,'permit-renewal','v2.0.1',2);}
    AGENT_SLUG='al-noor-services';AGENT_NAME='Al Noor Services Agent';AGENT_VERSION='v1.4.0';
    persist();
  }catch(e){console.error('seed failed',e);}
  APP_MODE=prevMode;HUB_PAGE=prevPage;
}
(function(){
  var _after=dsAfterModes;dsAfterModes=function(){
    var seeded=false,want=null;if(seedNeeded()){want=new URLSearchParams(location.search).get('page');seedDemo();seeded=true;}
    _after.apply(this,arguments);
    if(seeded){setTimeout(function(){try{var q=new URLSearchParams(location.search);if(APP_MODE==='hub'){var pg=want||'overview';pg={evalsets:'experimentsets',runs:'evaluations'}[pg]||pg;showHubPage(pg);}else{consoleEnsureExperimentSet(q);showConsolePage(want||'run');}}catch(e){console.error('seed render',e);}},50);}
  };
})();

/* ===================== V93 · two image workflows: invoice processing and document analysis ===================== */
AGENT_CATALOG.push({slug:'invoice-processing',name:'Invoice Processing Agent',versions:[['v0.9.0','draft · unpublished']]});
AGENT_CATALOG.push({slug:'document-analysis',name:'Document Analysis Agent',versions:[['v2.2.0','previous'],['v2.3.0','current · live']]});
function appendSeedSource(provider,name,cases,background){
  var id='source-'+Date.now().toString(36)+'-'+SOURCE_ATTACHMENTS.length+'-'+Math.floor(Math.random()*1e4);
  cases=baselineClone(cases);background=baselineClone(background);
  cases.forEach(function(c,i){c.sourceId=id;c.caseId=id+':attention:'+i;if(c.note==null){c.note='';c.autoNote='';c.noteDraft='';c.noteState='none';c.tag=null;c.skipped=false;}});
  background.forEach(function(c,i){c.sourceId=id;c.caseId=id+':case:'+i});
  DRAFT_CASES=SOURCE_ATTACHMENTS.length?(DRAFT_CASES||[]).concat(cases):cases;DRAFT_BACKGROUND=SOURCE_ATTACHMENTS.length?DRAFT_BACKGROUND.concat(background):background;
  SOURCE_ATTACHMENTS.push({id:id,provider:provider,name:name,count:cases.length+background.length,mapping:baselineClone(MAP),inputMode:INPUT_MODE,confirmed:true});
  ACTIVE_SOURCE=SOURCE_ATTACHMENTS.length-1;CFG.dsName=name;
}
function seedDatasetMulti(name,sources,daysAgo){
  dsClearDraft();INPUT_MODE='fields';DATA_ATTACHED=true;MAP_CONFIRMED=true;
  sources.forEach(function(s){appendSeedSource(s.provider,s.file,s.cases,s.background);});
  CFG.dsName=name;CFG.source='<b>'+esc(sources[0].provider)+'</b> &middot; '+esc(sources[0].file)+(sources.length>1?' &middot; +'+(sources.length-1)+' more':'');
  var rec=dsRecordFromDraft(name,null,false);rec.created=rec.updated=new Date(Date.now()-daysAgo*864e5).toISOString();DATASETS.push(rec);dsClearDraft();return rec;
}
var INV_VENDORS=[['Al Noor Supplies','SA-2026-0412','2026-08-14','1,250.00'],['Riyadh Office Systems','ROS-88213','2026-08-16','18,940.50'],['Gulf Print House','GPH-1027','2026-08-19','742.00'],['Najd Logistics','NL-2026-3391','2026-08-21','6,380.00'],['Tabuk Catering Co.','TC-559','2026-08-22','2,115.75'],['Dammam Facilities','DF-7710','2026-08-25','9,600.00'],['Makkah Stationery','MS-2026-018','2026-08-27','318.40'],['Jeddah Cloud Services','JCS-44120','2026-08-29','27,500.00'],['Hail Transport','HT-2088','2026-09-01','4,020.00'],['Abha Print','AP-1193','2026-09-02','655.00'],['Qassim Uniforms','QU-3007','2026-09-04','3,480.00'],['Madinah Security','MSC-2026-071','2026-09-05','12,250.00']];
function invJSON(v,n,d,t){return '{ "vendor": "'+v+'", "invoice_number": "'+n+'", "date": "'+d+'", "total": "'+t+' SAR" }';}
function invCase(i,kind){
  var r=INV_VENDORS[i%INV_VENDORS.length],file='invoice_'+String(410+i)+'.jpg',exp=invJSON(r[0],r[1],r[2],r[3]),act=exp,fin=1,loop=1,out=1,t='2.9s',tag='',tr=[['ok','Read the image','0.6s','','TOOL'],['ok','Located the totals block','0.8s','','LLM'],['ok','Returned the fields','0.4s','','LLM']];
  if(kind==='wrongtotal'){act=invJSON(r[0],r[1],r[2],'1,205.00');out=2;tag='misread';tr[1]=['bad','Located the totals block','0.9s','Read the subtotal line instead of the grand total.','LLM'];}
  if(kind==='novat'){act=invJSON(r[0],r[1],r[2],r[3].replace(/^([0-9,]+)\.(\d+)$/,function(m,a,b){return a+'.'+b}));act=act.replace('SAR','SAR (excl. VAT)');out=2;tag='incomplete';tr.splice(2,0,['bad','Skipped the VAT line','0.3s','The 15% VAT line was in the footer and not added.','LLM']);}
  if(kind==='unreadable'){act='Nothing came back.';fin=0;loop=0;out=0;t='31.0s';tag='noreader';tr=[['ok','Read the image','0.6s','','TOOL'],['bad','Tried text recognition again','repeated 6 times · 29.8s','attempt 1 ... blurred scan\nattempt 2 ... blurred scan','TOOL'],['bad','Timed out','no fields returned','','CHAIN']];}
  if(kind==='duplicate'){act=invJSON(r[0],INV_VENDORS[(i+1)%INV_VENDORS.length][1],r[2],r[3]);out=2;tag='misread';tr[2]=['bad','Returned the fields','0.4s','Took the PO number as the invoice number.','LLM'];}
  if(kind==='currency'){act=invJSON(r[0],r[1],r[2],r[3]).replace('SAR','USD');out=2;tag='misread';tr[2]=['bad','Returned the fields','0.4s','Currency symbol misread as USD; the invoice is in SAR.','LLM'];}
  if(kind==='slow'){t='9.8s';tr[1]=['ok','Located the totals block','7.9s','Handwritten total; two passes needed.','LLM'];}
  return {j:'Invoice · '+r[0],req:'Extract vendor, invoice number, date and total from the invoice image',inp:[{t:'image',v:file,m:'1240 x 1754 · '+(280+i*7)+' KB'}],outp:fin?[{t:'json',v:act,m:'4 fields'}]:[],lab:{t:'json',v:exp,m:'4 fields'},fin:fin,loop:loop,out:out,t:t,tr:tr,expTr:['Read the image','Located the totals block','Returned the fields'],autoTag:tag,noteUnavailableReason:'',q:file,exp:exp,act:act};
}
function invBackground(i){var r=INV_VENDORS[i%INV_VENDORS.length],file='invoice_'+String(500+i)+'.jpg',exp=invJSON(r[0],r[1].replace(/\d+$/,function(n){return String(+n+i)}),r[2],r[3]);return {j:'Invoice · '+r[0],inT:'image',outT:'json',lang:i%5===0?'AR':'EN',fin:1,loop:1,out:1,t:2.4+(i%7)/5,expTr:true,m:'',req:'Extract vendor, invoice number, date and total from the invoice image',q:file,inp:[{t:'image',v:file,m:'1240 x 1754 · '+(240+i*9)+' KB'}],outp:[{t:'json',v:exp,m:'4 fields'}],lab:{t:'json',v:exp,m:'4 fields'},tr:[['ok','Read the image','0.6s','','TOOL'],['ok','Located the totals block','0.8s','','LLM'],['ok','Returned the fields','0.4s','','LLM']]};}
var DOC_ITEMS=[['Lease agreement','lease_alnoor_0031.pdf','14 pages · text layer','Tenant pays 48,000 SAR yearly in two instalments; landlord maintains structure; 60-day notice to terminate.'],['Supplier contract','supplier_contract_0212.pdf','22 pages · text layer','Supplier delivers within 10 working days; penalties of 2% per week of delay; annual review of prices.'],['Land deed scan','deed_scan_0918.pdf','6 pages · photographed, no text layer','Deed 0918-D, owner Saleh Al Otaibi, plot AN-0917, 640 m².'],['Permit letter','permit_letter_1104.jpg','2480 x 3508 · scan','Permit 1104 granted for a ground-floor retail unit, valid 24 months, renewal 60 days before expiry.'],['Service agreement','service_agreement_0455.pdf','9 pages · text layer','Provider guarantees 99.5% uptime; credits of 5% per breach; 30-day termination for cause.'],['NDA','nda_0788.pdf','4 pages · text layer','Confidentiality for 3 years after termination; carve-outs for public information; governed by KSA law.'],['Board minutes','board_minutes_0602.jpg','2480 x 3508 · photographed','Approved budget of 3.2M SAR; appointed two committee members; next meeting in October.'],['Tender notice','tender_notice_0931.pdf','3 pages · text layer','Bids due 15 October; bid bond 2%; evaluation on price 60% and quality 40%.']];
function docCase(i,kind){
  var d=DOC_ITEMS[i%DOC_ITEMS.length],isImg=/\.jpg$/.test(d[1]),exp=d[3],act=exp,fin=1,loop=1,out=1,t='6.4s',tag='',tr=[['ok','Opened the file','0.4s','','CHAIN'],['ok','Read the pages','2.8s','','TOOL'],['ok','Listed the obligations','2.1s','','LLM'],['ok','Wrote the summary','1.1s','','LLM']];
  if(kind==='missing'){act=exp.split(';').slice(0,-1).join(';')+'.';out=2;tag='incomplete';tr[2]=['bad','Listed the obligations','2.1s','The termination clause on the last page was not included.','LLM'];}
  if(kind==='hallucinated'){act=exp+' Includes an automatic renewal for a further five years.';out=2;tag='unsupported';tr[3]=['bad','Wrote the summary','1.1s','The renewal term does not appear anywhere in the document.','LLM'];}
  if(kind==='unreadable'){act='Nothing came back.';fin=0;loop=0;out=0;t='34.0s';tag='noreader';tr=[['ok','Opened the file','0.4s','','CHAIN'],['ok','Read page 1','1.2s','Photographed page, no text layer.','TOOL'],['bad','Tried to read page 1 again','repeated 7 times · 30.1s','attempt 1 ... no text found\nattempt 2 ... no text found','TOOL'],['bad','Timed out','no summary returned','','CHAIN']];}
  if(kind==='wrongparty'){act=exp.replace(/Tenant|Supplier|Provider/,'Landlord');out=2;tag='misread';tr[2]=['bad','Listed the obligations','2.1s','Obligations were attributed to the wrong party.','LLM'];}
  return {j:d[0],req:'Summarise the document and list every obligation with its party and deadline',inp:[{t:isImg?'image':'pdf',v:d[1],m:d[2]}],outp:fin?[{t:'text',v:act,m:''}]:[],lab:{t:'text',v:exp,m:''},fin:fin,loop:loop,out:out,t:t,tr:tr,expTr:['Opened the file','Read the pages','Listed the obligations','Wrote the summary'],autoTag:tag,noteUnavailableReason:'',q:d[1],exp:exp,act:act};
}
function docBackground(i){var d=DOC_ITEMS[i%DOC_ITEMS.length],isImg=/\.jpg$/.test(d[1]),file=d[1].replace(/(\d+)(\.\w+)$/,function(m,n,e){return String(+n+i)+e});return {j:d[0],inT:isImg?'image':'pdf',outT:'text',lang:i%4===0?'AR':'EN',fin:1,loop:1,out:1,t:5.2+(i%6)/4,expTr:true,m:'',req:'Summarise the document and list every obligation with its party and deadline',q:file,inp:[{t:isImg?'image':'pdf',v:file,m:d[2]}],outp:[{t:'text',v:d[3],m:''}],lab:{t:'text',v:d[3],m:''},tr:[['ok','Opened the file','0.4s','','CHAIN'],['ok','Read the pages','2.8s','','TOOL'],['ok','Listed the obligations','2.1s','','LLM'],['ok','Wrote the summary','1.1s','','LLM']]};}
function seedMetric2(o){
  if(o.by==='judge'||o.by==='code')return seedMetric(o);
  var k='u-seed-'+o.slug,config=o.by==='endpoint'?{url:o.url,field:o.field||'score',auth:o.auth||'Workspace secret',secret:o.secret||'secrets/eval/'+o.slug,timeout:o.timeout||'10 seconds'}
    :{rule:o.name,task:o.task,agent:'Claude Code CLI',model:'sonnet',runtime:'HUMAIN isolated worker',credential:'HUMAIN managed Claude identity',tools:'Case packet only - read only',network:'Off',timeout:'60 seconds',maxTurns:'6',budget:'0.20',schema:'prism-evaluator-result@1',evidence:o.evidence||['input','output','expected_output']};
  var m={k:k,on:false,need:'output',by:o.by,n:o.name,scope:'personal',owner:'Ritwik Chakradhar',yours:true,user:true,v:o.v,ver:o.ver||'v1.0.0',last:o.last||'4 days ago',agents:o.agents||1,tags:o.tags||[],config:config,
    d:o.by==='endpoint'?'Every datapoint is posted to your authenticated endpoint and the configured score field is saved.':'A configured CLI evaluation agent runs once per datapoint with a pinned model, isolated runtime, strict JSON schema, explicit evidence, credentials, tools, and network policy.'};
  USER_METRICS.push(m);JUDGE[k]={v:o.v,d:o.name};return m;
}
function seedDemo(){
  var prevMode=APP_MODE,prevPage=HUB_PAGE;APP_MODE='hub';
  try{
    /* citizen services (text, audio, video) */
    var d1=seedDataset('alnoor-eval-cases','CSV upload','alnoor-eval-cases.csv','fields',14);
    var d2=seedDataset('permit-calls-q3','JSON or JSONL','permit-calls-q3.jsonl','record',7);
    /* invoices: images from a bucket plus a CSV of expected fields */
    var invKinds=['wrongtotal','novat','unreadable','duplicate','currency','slow'];
    var invA=invKinds.map(function(k,i){return invCase(i,k)}),invB=[];for(var i=0;i<12;i++)invB.push(invBackground(i));
    var invA2=[invCase(6,'wrongtotal'),invCase(7,'slow')],invB2=[];for(var j=0;j<6;j++)invB2.push(invBackground(12+j));
    var d3=seedDatasetMulti('invoices-2026-q3',[{provider:'S3 or GCS bucket',file:'s3://alnoor-finance/invoices/2026-q3/',cases:invA,background:invB},{provider:'CSV upload',file:'invoice_expected_fields.csv',cases:invA2,background:invB2}],6);
    /* legal documents: scans from Drive plus a documents batch */
    var docKinds=['missing','hallucinated','unreadable','wrongparty'];
    var docA=docKinds.map(function(k,i){return docCase(i,k)}),docB=[];for(var a=0;a<10;a++)docB.push(docBackground(a));
    var docA2=[docCase(4,'missing'),docCase(5,'hallucinated')],docB2=[];for(var b2=0;b2<6;b2++)docB2.push(docBackground(10+b2));
    var d4=seedDatasetMulti('legal-document-scans',[{provider:'Google Drive',file:'Legal/Scans/2026',cases:docA,background:docB},{provider:'Documents',file:'contracts_batch_04.zip',cases:docA2,background:docB2}],3);
    /* metrics of every kind */
    seedMetric({slug:'politeness',name:'Politeness check',by:'judge',need:'output',v:71,reference:'none',prompt:'Is the reply polite, clear and easy to act on for a citizen? Flag jargon, rudeness or ambiguity.',rc:{mode:'number',minimum:1,maximum:5,rubric:'5 means the rule is fully met, 1 means it is not met at all.'},last:'3 days ago',agents:2});
    seedMetric({slug:'matches-reference',name:'Matches reference',by:'judge',need:'label',v:78,reference:'expected',prompt:'Compare the response with the expected answer. They must agree in meaning, not in wording. Flag any contradiction or omission.',rc:{mode:'list',responses:[{label:'Pass',meaning:'The response agrees with the expected answer.',highlight:false},{label:'Fail',meaning:'The response contradicts or omits part of the expected answer.',highlight:true}]},last:'yesterday',agents:2});
    seedMetric({slug:'permit-id',name:'Contains permit id',by:'code',need:'output',v:84,last:'6 days ago',agents:1});
    seedMetric({slug:'invoice-fields',name:'Invoice fields exact match',by:'code',need:'label',v:81,last:'2 days ago',agents:1,tags:['invoices']});
    seedMetric({slug:'total-tolerance',name:'Total within 1% tolerance',by:'code',need:'label',v:88,last:'2 days ago',agents:1,tags:['invoices']});
    seedMetric({slug:'vendor-match',name:'Vendor name match',by:'judge',need:'label',v:83,reference:'expected',prompt:'Does the extracted vendor name refer to the same company as the expected vendor? Accept abbreviations and legal suffixes; reject a different company.',rc:{mode:'list',responses:[{label:'Same vendor',meaning:'The names refer to the same company.',highlight:false},{label:'Different vendor',meaning:'The names refer to different companies.',highlight:true},{label:'Unclear',meaning:'Not enough of the name was extracted to tell.',highlight:true}]},last:'2 days ago',agents:1,tags:['invoices']});
    seedMetric({slug:'summary-obligations',name:'Summary covers obligations',by:'judge',need:'label',v:69,reference:'expected',prompt:'Compare the summary with the expected list of obligations. Score how completely each party, amount and deadline is covered. Penalise anything stated that the document does not support.',rc:{mode:'number',minimum:1,maximum:5,rubric:'5 covers every obligation with the right party and deadline; 1 misses most of them or invents terms.'},last:'yesterday',agents:1,tags:['documents']});
    seedMetric2({slug:'layout-vision',name:'Layout check via vision API',by:'endpoint',v:76,url:'https://vision.alnoor.gov.sa/v1/layout-score',field:'score',last:'yesterday',agents:1,tags:['documents']});
    seedMetric2({slug:'clause-audit',name:'Clause audit agent',by:'agentic',v:72,task:'Open the document, find every clause that creates an obligation, and check that the summary names the party, the amount and the deadline for each. Cite page numbers. Return uncertain when the scan is unreadable.',evidence:['input','output','expected_output','trace'],last:'yesterday',agents:1,tags:['documents']});
    /* experiment sets */
    var s1=seedSet('Permits baseline',d1.id,['acc','hsafety','u-seed-politeness'],12);
    var s2=seedSet('Safety and consistency',d1.id,['hsafety','robust','u-seed-matches-reference'],5);
    var s3=seedSet('Invoice extraction v1',d3.id,['u-seed-invoice-fields','u-seed-total-tolerance','u-seed-vendor-match','hsafety'],2);
    var s4=seedSet('Document analysis baseline',d4.id,['u-seed-summary-obligations','u-seed-layout-vision','u-seed-clause-audit','hsafety'],3);
    /* evaluations: the invoice agent is left for you to run end to end */
    if(s1){seedRun(s1.id,'al-noor-services','v1.4.0',11);seedRun(s1.id,'al-noor-services','v1.5.0',8);}
    if(s2){seedRun(s2.id,'permit-renewal','v2.0.1',4);}
    if(s4){seedRun(s4.id,'document-analysis','v2.2.0',3);seedRun(s4.id,'document-analysis','v2.3.0',1);}
    AGENT_SLUG='al-noor-services';AGENT_NAME='Al Noor Services Agent';AGENT_VERSION='v1.4.0';
    persist();
  }catch(e){console.error('seed failed',e);}
  APP_MODE=prevMode;HUB_PAGE=prevPage;
}
(function(){
  function applyAgentSlugParam(){try{var q=new URLSearchParams(location.search),sl=q.get('agentslug');if(sl){var ag=hrAgentBySlug(sl);AGENT_SLUG=ag.slug;AGENT_NAME=ag.name;var nav=document.getElementById('workflowNav');if(nav)nav.dataset.modeNav='';return true;}}catch(e){}return false;}
  var _after2=dsAfterModes;dsAfterModes=function(){var applied=applyAgentSlugParam();_after2.apply(this,arguments);if(APP_MODE==='console'&&applied){renderSetup();syncModeChrome();}};
})();

/* V95: scoped Evaluations view for the Submit Agent flow (?mode=hub&page=runs&scope=agent&agentslug=..&agent=v..) */
var HR_SCOPE=null;
function hrScopeKey(){return HR_SCOPE?HR_SCOPE.slug+'@'+HR_SCOPE.ver.replace(/^v/,''):null;}
function hrScopedRuns(){var k=hrScopeKey();return BASE_RUNS.filter(function(r){return String((r.receipt||{}).agent||'')===k;});}
function hrScopedFormHTML(){
  var sets=evalSetSummaries(),def=HUB_RUN_SET||lastEvalSetFor(HR_SCOPE.ver)||(sets.length?sets[sets.length-1].id:'');
  return '<div class="hr-form"><div class="hr-form-h"><span class="eyeline">New evaluation</span><b>'+esc(HR_SCOPE.name)+' '+esc(HR_SCOPE.ver)+' is fixed by this submission. Pick the experiment set to run it against.</b></div>'
    +'<input type="hidden" id="hrAgent" value="'+esc(HR_SCOPE.slug)+'"><input type="hidden" id="hrVersion" value="'+esc(HR_SCOPE.ver)+'">'
    +'<div class="hr-grid"><div class="hb-field"><span>Agent</span><b class="hr-fixed">'+esc(HR_SCOPE.name)+'</b></div><div class="hb-field"><span>Agent version</span><b class="hr-fixed">'+esc(HR_SCOPE.ver)+' · this submission</b></div>'
    +'<label class="hb-field"><span>Experiment set</span><select id="hrSet"'+(sets.length?'':' disabled')+'>'+(sets.length?sets.map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===def?' selected':'')+'>'+esc(x.name)+' · v'+x.version+' · '+x.cases+' cases · '+x.metrics+' metric'+(x.metrics===1?'':'s')+'</option>'}).join(''):'<option value="">No experiment set yet</option>')+'</select></label></div>'
    +'<div class="hr-acts"><button type="button" class="btn" id="hrStart"'+(sets.length?'':' disabled')+'>Start evaluation</button>'+(hrScopedRuns().length?'<button type="button" class="btn ghost" id="hrCancelNew">Cancel</button>':'')
    +'<span class="muted">'+(sets.length?'The experiment set pins the dataset, metrics and run settings. ':'Create an experiment set first. ')+'<button type="button" class="lnk" id="hrManageSets">Manage experiment sets</button></span></div></div>';
}
function hrScopedRowHTML(r){
  var rc=r.receipt,sel=RUN_SEL.indexOf(r.number)>-1;
  return '<tr class="ds-tr hr-tr'+(sel?' sel':'')+'" data-hr-row="'+r.number+'"><td class="hr-check"><input type="checkbox" class="hr-sel" data-hr-sel="'+r.number+'"'+(sel?' checked':'')+' aria-label="Select evaluation '+r.number+'"></td><td class="ds-name-cell"><b>Evaluation '+r.number+'</b><small>'+esc(rc.run_id||'')+(r.number===RUNS_DONE?' · latest':'')+'</small></td><td class="ds-src">'+esc(hrSetName(rc.baseline&&rc.baseline.id))+'</td><td class="ds-num">'+(rc.coverage&&rc.coverage.attempted!=null?rc.coverage.attempted:r.cases?r.cases.length:'')+'</td><td class="ds-num">'+(rc.settings&&rc.settings.repetitions?rc.settings.repetitions:1)+'</td><td><span class="badge b-gov">Completed</span></td><td class="ds-date">'+hrDate(r.at)+'</td></tr>';
}
(function(){
  var _rhr=renderHubRuns;
  renderHubRuns=function(){
    if(!HR_SCOPE)return _rhr.apply(this,arguments);
    var el=document.getElementById('hubRuns');if(!el)return;
    var runs=hrScopedRuns();if(!runs.length)RUN_NEW=true;
    var rows=runs.slice().reverse().map(hrScopedRowHTML);
    el.innerHTML='<p class="eyebrow">Evaluations · '+esc(HR_SCOPE.name)+'</p><h2 class="h1">Evaluations for '+esc(HR_SCOPE.ver)+'</h2><p class="sub">Every evaluation of '+esc(HR_SCOPE.name)+' '+esc(HR_SCOPE.ver)+'. Start one against an experiment set, then select it to view results, review cases or compare.</p>'
      +'<div class="card"><div class="bd"><div class="zone-head ds-zone"><div><b>Evaluations · '+runs.length+'</b><span>Each evaluation runs this exact version against one experiment set and keeps its evidence here.</span></div>'+(RUN_NEW?'':'<button class="btn" id="hrNewRun">New evaluation</button>')+'</div>'
      +(RUN_NEW?hrScopedFormHTML():'')+hrSubmitBarHTML()+hrToolbarHTML()
      +'<div class="ds-lib-wrap"><table class="ds-lib hr-lib"><thead><tr><th></th><th>Evaluation</th><th>Experiment set</th><th class="ds-num">Cases</th><th class="ds-num">Per case</th><th>Status</th><th>Started</th></tr></thead><tbody>'+(rows.length?rows.join(''):'<tr><td colspan="7" class="ds-empty-cell"><b>No evaluations yet for '+esc(HR_SCOPE.ver)+'</b><span>Pick an experiment set above and start the first one.</span></td></tr>')+'</tbody></table></div>'
      +'</div></div>';
  };
  var _mnh=modeNavHTML;modeNavHTML=function(){var h=_mnh.apply(this,arguments);if(HR_SCOPE&&APP_MODE==='hub')h=h.replace('<b>alnoor-tenant</b><small>Prepared once, reused across agents</small>','<b>'+esc(HR_SCOPE.name)+' · '+esc(HR_SCOPE.ver)+'</b><small>Evaluations for this submission</small>');return h;};
  window.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('#hrManageSets');if(!t)return;e.preventDefault();e.stopImmediatePropagation();
    if(window.parent!==window){shellPost('humain-eval-open-hub',{page:'evalsets'});}else{HR_SCOPE=null;document.body.classList.remove('hr-scoped');showHubPage('evalsets');}},true);
  function applyHrScope(){try{var q=new URLSearchParams(location.search);if(q.get('scope')!=='agent'||APP_MODE!=='hub')return;var ag=hrAgentBySlug(q.get('agentslug')||AGENT_SLUG);var ver=q.get('agent')||AGENT_VERSION;ver=/^v/.test(ver)?ver:'v'+ver;
    HR_SCOPE={slug:ag.slug,name:ag.name,ver:ver};AGENT_SLUG=ag.slug;AGENT_NAME=ag.name;AGENT_VERSION=ver;HUB_RUN_AGENT=ag.slug;HUB_RUN_VER=ver;if(q.get('evalset'))HUB_RUN_SET=q.get('evalset');document.body.classList.add('hr-scoped');}catch(e){}}
  var _after3=dsAfterModes;dsAfterModes=function(){_after3.apply(this,arguments);applyHrScope();if(HR_SCOPE){if(HUB_PAGE==='runs')renderHubRuns();syncModeChrome();}};
})();

/* V96: submit for review from the scoped Evaluations view (Submit Agent flow) */
var HR_SUBMIT_ASK=false;
function hrRunAvg(r){var ms=(r.metrics||[]).filter(function(m){return m._available!==false&&typeof m._score==='number'});return ms.length?Math.round(ms.reduce(function(a,m){return a+m._score},0)/ms.length):0;}
function hrReviewPayload(r){var rc=r.receipt||{};
  var ms=(r.metrics||[]).filter(function(m){return m._available!==false&&typeof m._score==='number'}).map(function(m){return {name:m.n,score:m._score}});
  var flagged=(r.cases||[]).filter(function(c){return c.autoTag||c.tag}).slice(0,3).map(function(c){return {id:c.caseId||'',title:c.j||'',tag:c.autoTag||c.tag||''}});
  return {slug:HR_SCOPE.slug,name:HR_SCOPE.name,ver:HR_SCOPE.ver,evaluation:r.number,runId:rc.run_id||'',experimentset:hrSetName(rc.baseline&&rc.baseline.id),cases:(rc.coverage&&rc.coverage.attempted)||(r.cases||[]).length,metrics:ms,avg:hrRunAvg(r),flagged:flagged};}
function hrSubmitReview(r){var p=hrReviewPayload(r);HR_SUBMIT_ASK=false;
  if(window.parent!==window){shellPost('humain-eval-submit-review',p);toast('Evaluation '+r.number+' submitted for review.');}
  else{toast('Evaluation '+r.number+' would go to the tenant verifier. Open this inside HUMAIN ONE to follow it in Agent Lifecycle.');renderHubRuns();}}
function hrSubmitBarHTML(){var runs=hrScopedRuns();if(!runs.length)return '';
  var latest=runs[runs.length-1],best=runs.reduce(function(b,r){return hrRunAvg(r)>hrRunAvg(b)?r:b},runs[0]);
  if(!HR_SUBMIT_ASK)return '<div class="hr-submit"><div><b>Send '+esc(HR_SCOPE.ver)+' to the tenant verifier</b><span>Evaluation '+latest.number+' is attached (latest, average '+hrRunAvg(latest)+' across '+hrReviewPayload(latest).metrics.length+' metrics). The verifier reads it case by case and returns a judgement in Agent Lifecycle.</span></div><button type="button" class="btn" id="hrSubmitReview">Submit for review</button></div>';
  return '<div class="hr-submit ask"><div><b>Evaluation '+latest.number+' is the latest, but Evaluation '+best.number+' scored higher ('+hrRunAvg(best)+' against '+hrRunAvg(latest)+').</b><span>Which one goes to the verifier?</span></div><div class="hr-submit-acts"><button type="button" class="btn" data-hr-submit="'+best.number+'">Submit Evaluation '+best.number+' (best)</button><button type="button" class="btn ghost" data-hr-submit="'+latest.number+'">Submit Evaluation '+latest.number+' (latest)</button><button type="button" class="lnk" id="hrSubmitCancel">Cancel</button></div></div>';}
window.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('#hrSubmitReview,#hrSubmitCancel,[data-hr-submit]');if(!t||!HR_SCOPE)return;e.preventDefault();e.stopImmediatePropagation();
  var runs=hrScopedRuns();if(!runs.length)return;
  if(t.id==='hrSubmitCancel'){HR_SUBMIT_ASK=false;renderHubRuns();return;}
  if(t.id==='hrSubmitReview'){var latest=runs[runs.length-1],best=runs.reduce(function(b,r){return hrRunAvg(r)>hrRunAvg(b)?r:b},runs[0]);if(hrRunAvg(latest)>=hrRunAvg(best))hrSubmitReview(latest);else{HR_SUBMIT_ASK=true;renderHubRuns();}return;}
  var n=+t.dataset.hrSubmit,r=runs.filter(function(x){return x.number===n})[0];if(r)hrSubmitReview(r);},true);

/* V98: OpenTelemetry span waterfall for case traces (hierarchical spans, start and end times, OTLP fields) */
var WF_SEL=null,WF_CASE=null,WF_COLLAPSED={};
TRACE_TAB='waterfall';
function traceBaseNanos(index){return 1788343440000000000n+BigInt(index)*1000000000n;}
function wfFmtMs(ms){ms=Math.round(ms);return ms>=1000?((ms/1000).toFixed(ms>=10000?1:2)+' s'):(ms+' ms');}
function wfIso(nanos){var ms=Number(nanos/1000000n);return new Date(ms).toISOString().replace('T',' ');}
function wfAgentSlug(){var a=(typeof SNAP!=='undefined'&&SNAP&&SNAP.agent)?String(SNAP.agent).split('@')[0]:'';return a||(typeof AGENT_SLUG!=='undefined'?AGENT_SLUG:'al-noor-services');}
function wfAgentService(){return wfAgentSlug()+'-agent';}
(function(){
  var _ot=otelTrace;
  otelTrace=function(c,index){var o=_ot.apply(this,arguments);
    var ag=hrAgentBySlug(wfAgentSlug());o.root.offset=0;o.root.name='invoke_agent '+ag.name;o.root.attrs['gen_ai.agent.name']=ag.name;o.root.attrs['gen_ai.agent.id']=ag.slug;
    o.spans.forEach(function(s){var m=/repeated (\d+) times/.exec(String(s.summary||''));if(!m)return;
      var n=Math.min(+m[1],8),each=Math.max(1,Math.round(s.duration/n)),lines=String(s.summary).split('\n').slice(1).map(function(x){return x.replace(/^attempt \d+ \.\.\. /,'').trim()}).filter(Boolean);
      s.children=[];for(var k=0;k<n;k++){var msg=lines[k]||lines[lines.length-1]||s.label||s.name;
        s.children.push({name:s.name,label:'attempt '+(k+1)+' of '+n,id:stableHex('attempt:'+s.id+':'+k,16),parent:s.id,kind:s.kind,status:'ERROR',duration:each,offset:s.offset+k*each,summary:msg,
          attrs:Object.assign({},s.attrs,{'humain.retry.attempt':k+1,'humain.retry.max':n}),events:[{name:'exception',attributes:{'exception.type':s.attrs['error.type']||'AgentOperationError','exception.message':msg,'exception.escaped':k===n-1?'true':'false'}}]});}});
    return o;};
  function walk(o,collapsed){var out=[];function rec(s,d){out.push({s:s,d:d});if(collapsed&&collapsed[s.id])return;(s.children||[]).forEach(function(k){rec(k,d+1)});}rec(o.root,0);o.spans.forEach(function(s){rec(s,1)});return out;}
  window.wfSpans=walk;
  otlpEnvelope=function(o,index){var base=traceBaseNanos(index);
    function wire(x){var s=x.s,st=base+BigInt(s.offset||0)*1000000n,en=st+BigInt(s.duration)*1000000n;
      return {traceId:hexToBase64(o.traceId),spanId:hexToBase64(s.id),parentSpanId:x.d===0?'':hexToBase64(s.parent),name:s.name,kind:'SPAN_KIND_'+s.kind,startTimeUnixNano:st.toString(),endTimeUnixNano:en.toString(),attributes:attrArray(s.attrs),events:(s.events||[]).map(function(e){return {timeUnixNano:en.toString(),name:e.name,attributes:attrArray(e.attributes)};}),status:{code:'STATUS_CODE_'+s.status}};}
    return {resourceSpans:[{resource:{attributes:attrArray({'service.name':wfAgentService(),'service.version':o.version,'deployment.environment.name':'sandbox','telemetry.sdk.language':'python','telemetry.sdk.name':'opentelemetry'})},scopeSpans:[{scope:{name:'io.humain.prism.eval',version:'1.0.0'},spans:walk(o).map(wire),schemaUrl:'https://opentelemetry.io/schemas/1.37.0'}]}]};};
  function kv(obj){return Object.keys(obj).map(function(k){return '<span>'+esc(k)+'</span><span>'+esc(String(obj[k]))+'</span>';}).join('');}
  function detail(o,s,base){var st=base+BigInt(s.offset||0)*1000000n,en=st+BigInt(s.duration)*1000000n;var ev=s.events&&s.events[0];
    var ctx={'trace_id':o.traceId,'span_id':s.id,'parent_span_id':s.parent||'(empty · root span)','kind':'SPAN_KIND_'+s.kind,'status.code':'STATUS_CODE_'+s.status,'status.message':s.status==='ERROR'&&ev?ev.attributes['exception.message']:'(empty)','trace_flags':'01 · sampled'};
    var times={'start_time_unix_nano':st.toString(),'end_time_unix_nano':en.toString(),'start (UTC)':wfIso(st),'end (UTC)':wfIso(en),'duration':wfFmtMs(s.duration)+' · offset +'+wfFmtMs(s.offset||0)+' from trace start'};
    var res={'service.name':wfAgentService(),'service.version':o.version,'deployment.environment.name':'sandbox','otel.scope.name':'io.humain.prism.eval','otel.scope.version':'1.0.0'};
    var evs=(s.events||[]).map(function(e){var a={};a['event.name']=e.name;a['time_unix_nano']=en.toString();Object.keys(e.attributes).forEach(function(k){a[k]=e.attributes[k]});return '<div class="otel-grid">'+kv(a)+'</div>';}).join('');
    return '<div class="wf-detail"><div class="wf-sec">Span context</div><div class="otel-grid">'+kv(ctx)+'</div><div class="wf-sec">Timestamps</div><div class="otel-grid">'+kv(times)+'</div><div class="wf-sec">Attributes ('+Object.keys(s.attrs).length+')</div><div class="otel-grid">'+kv(s.attrs)+'</div>'+(evs?'<div class="wf-sec">Events ('+s.events.length+')</div>'+evs:'')+'<div class="wf-sec">Resource and scope</div><div class="otel-grid">'+kv(res)+'</div></div>';}
  function waterfall(o,index){var base=traceBaseNanos(index),total=Math.max(1,o.totalMs),all=walk(o),rows=walk(o,WF_COLLAPSED);
    if(WF_CASE!==index){WF_CASE=index;WF_COLLAPSED={};var worst=all.map(function(x){return x.s}).filter(function(s){return s.status==='ERROR'&&s.id!==o.root.id}).sort(function(a,b){return b.duration-a.duration})[0];WF_SEL=worst?worst.id:null;}
    var errs=all.filter(function(x){return x.s.status==='ERROR'}).length;
    var head='<div class="wf-head"><div><span class="wf-k">trace_id</span><span class="wf-v mono">'+o.traceId+'</span></div><div><span class="wf-k">service.name</span><span class="wf-v">'+esc(wfAgentService())+' · '+esc(o.version)+'</span></div><div><span class="wf-k">Start (UTC)</span><span class="wf-v mono">'+wfIso(base)+'</span></div><div><span class="wf-k">End (UTC)</span><span class="wf-v mono">'+wfIso(base+BigInt(total)*1000000n)+'</span></div><div><span class="wf-k">Duration</span><span class="wf-v">'+wfFmtMs(total)+'</span></div><div><span class="wf-k">Spans</span><span class="wf-v">'+all.length+(errs?' · <em>'+errs+' with STATUS_CODE_ERROR</em>':'')+'</span></div></div>';
    var ticks=[0,.25,.5,.75,1].map(function(f){return '<span style="left:'+(f*100)+'%">'+wfFmtMs(total*f)+'</span>'}).join('');
    var body=rows.map(function(x){var s=x.s,d=x.d,kids=(s.children||[]).length,col=!!WF_COLLAPSED[s.id],sel=WF_SEL===s.id;
      return '<div class="wf-row'+(s.status==='ERROR'?' err':'')+(sel?' sel':'')+'" data-wf-span="'+s.id+'" role="button" tabindex="0"><div class="wf-name" style="padding-left:'+(8+d*18)+'px">'+(kids?'<button type="button" class="wf-caret" data-wf-toggle="'+s.id+'" aria-label="'+(col?'Expand':'Collapse')+' child spans">'+(col?'&#9656;':'&#9662;')+'</button>':'<span class="wf-caret-sp"></span>')+'<span class="wf-kind k-'+s.kind.toLowerCase()+'">'+s.kind+'</span><b>'+esc(s.name)+'</b>'+(s.label?'<small>'+esc(s.label)+'</small>':'')+(kids&&col?'<small class="wf-kids">'+kids+' child spans</small>':'')+'</div>'
        +'<div class="wf-t mono">+'+wfFmtMs(s.offset||0)+'</div><div class="wf-t mono">+'+wfFmtMs((s.offset||0)+s.duration)+'</div><div class="wf-t mono">'+wfFmtMs(s.duration)+'</div><div class="wf-st s-'+s.status.toLowerCase()+'">'+s.status+'</div>'
        +'<div class="wf-bar"><i style="left:'+((s.offset||0)/total*100).toFixed(2)+'%;width:'+Math.max(0.5,s.duration/total*100).toFixed(2)+'%"></i></div></div>'+(sel?detail(o,s,base):'');}).join('');
    return head+'<div class="wf"><div class="wf-cols"><div>Span</div><div>Start</div><div>End</div><div>Duration</div><div>Status</div><div class="wf-ticks">'+ticks+'</div></div>'+body+'</div><div class="trace-note">Times are offsets from the root span start; the detail panel carries <b>start_time_unix_nano</b> and <b>end_time_unix_nano</b>. Kinds follow the OpenTelemetry SpanKind enum, status the StatusCode enum, and attribute names the GenAI semantic conventions. A retried step is a parent span with one child span per attempt.</div>';}
  var _rt=renderTrace;
  renderTrace=function(c,index){if(TRACE_TAB==='timeline')TRACE_TAB='waterfall';
    var tabBtn='<button role="tab" aria-selected="'+(TRACE_TAB==='waterfall')+'" class="trace-tab '+(TRACE_TAB==='waterfall'?'on':'')+'" data-trace-tab="waterfall">Span waterfall</button>';
    if(c.traceAvailability==='missing'||TRACE_TAB!=='waterfall'){var h=_rt.apply(this,arguments);return h.replace(/<button role="tab"[^>]*data-trace-tab="timeline">Readable timeline<\/button>/,tabBtn);}
    var o=otelTrace(c,index),traceparent='00-'+o.traceId+'-'+o.root.id+'-01';
    var intro='<div class="trace-intro"><span class="badge b-pre">Simulated trace</span><b> Case '+(index+1)+'</b><details><summary>Trace identifiers</summary><p>Trace ID: '+esc(o.traceId)+'</p><p>W3C traceparent: '+esc(traceparent)+'</p></details></div>';
    var tabs='<div class="trace-tabs" role="tablist" aria-label="Trace views">'+tabBtn+'<button role="tab" aria-selected="false" class="trace-tab" data-trace-tab="contract">Technical details</button><button role="tab" aria-selected="false" class="trace-tab" data-trace-tab="otlp">Raw trace</button></div>';
    return intro+tabs+waterfall(o,index);};
  window.addEventListener('click',function(e){var tg=e.target.closest&&e.target.closest('[data-wf-toggle]');var row=e.target.closest&&e.target.closest('[data-wf-span]');if(!tg&&!row)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(tg){WF_COLLAPSED[tg.dataset.wfToggle]=!WF_COLLAPSED[tg.dataset.wfToggle];}else{WF_SEL=WF_SEL===row.dataset.wfSpan?null:row.dataset.wfSpan;}
    var box=document.getElementById('caseTrace');var c=currentReviewCase();if(box&&c)box.innerHTML=renderTrace(c,traceGlobal);},true);
})();
