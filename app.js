'use strict';
const byId=Object.fromEntries(SCREENS.map(x=>[x.id,x]));
const moduleOf=id=>MODULES.find(m=>m.screens.includes(id));
const personas={company:'Company owner',scope:'Scope specialist',audit:'Lead assessor',alex:'Alex — ENG-A only',curator:'Catalogue curator',expert:'Qualified TAS expert',rights:'Rights steward',ops:'Service operator'};
let role='company',workspace='Company',tab='overview',result='',current='SCR11';
const initial=()=>({approved:false,rights:false,published:false,local:false,adopted:false,amended:false,upload:'Not started',version:1,reuse:false,relevance:'Limited',dispute:true,assembled:false,issued:false,issueCount:0,revoked:false,draft:false,task:false,collection:'Partial',events:[],fields:{}});
let state=initial();
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function allowed(id){
const n=+id.slice(3);
if(['curator','expert','rights'].includes(role))return [2,3,4,5,6,7,8,22,25,26,27,28].includes(n);
if(role==='ops')return [1,2,14,15,25,26,29,30,31,32].includes(n);
if(role==='alex')return !state.revoked&&[2,12,13,16,17,18,19,20,21,25,26,27,28].includes(n);
if(role==='audit')return [2,9,10,12,13,16,17,18,19,20,21,23,24,25,26,27,28,32].includes(n);
return [1,2,9,10,11,12,13,14,15,17,20,21,23,24,25,26,27,28,31,32].includes(n);
}
const group=id=>{const n=+id.slice(3);if([3,4,5,6,7,8,22].includes(n))return 'Curation';if([16,17,18,19,20,21].includes(n))return 'Auditor';if([14,15,29,30].includes(n))return 'Administration';return 'Company'};
function setOptions(){document.querySelector('#persona').innerHTML=Object.entries(personas).map(([k,v])=>`<option value="${k}" ${k===role?'selected':''}>${esc(v)}</option>`).join('');
const groups=[...new Set(SCREENS.filter(x=>allowed(x.id)).map(x=>group(x.id)))];if(!groups.includes(workspace))workspace=groups[0]||'Company';
document.querySelector('#workspace').innerHTML=groups.map(g=>`<option ${g===workspace?'selected':''}>${g}</option>`).join('');}
function statusText(){return state.published?'REL-02 active':state.approved?'Authorised · execution blocked by current distribution rights':'Awaiting exact expert authorisation';}
function log(t){state.events.unshift(t);result=t;}
function fields(s){return s.fields.map(([label,value],i)=>`<label>${esc(label)}<input data-field="${i}" value="${esc(role==='alex'&&(String(value).includes('ENG-B')||String(value).includes('USE-B'))?'Outside this persona context':state.fields[s.id]?.[i]??value)}"></label>`).join('');}
function link(id){return allowed(id)?`<a href="#${id}">${esc(byId[id].title)}</a>`:'';}
function paint(){
current=(location.hash||'#SCR11').slice(1);setOptions();
document.querySelector('#nav').innerHTML=SCREENS.filter(x=>allowed(x.id)&&(group(x.id)===workspace||x.workspace==='All')).map(x=>`<a class="${x.id===current?'active':''}" href="#${x.id}">${esc(x.title)}</a>`).join('');
const root=document.querySelector('#main');document.querySelector('#foot').textContent='Design review edition 1.0 · No live data, source acquisition, external delivery or professional decision is performed.';
if(!byId[current]||!allowed(current)){root.innerHTML='<div class="deny"><h1>Context unavailable</h1><p>This simulated persona does not have access to the requested context.</p><p>Choose an available navigation entry or a different persona simulation.</p></div>';return;}
const s=byId[current],m=moduleOf(current);
let rows=s.rows.map(r=>r.slice());if(role==='alex'){rows=rows.filter(r=>!r.join(' ').includes('ENG-B')&&!r.join(' ').includes('USE-B'));}if(['curator','expert','rights'].includes(role)&&s.id==='SCR27')rows=rows.filter(r=>!r[0].startsWith('EV-'));
if(current==='SCR07')rows[0][3]=state.approved?'Authorised':'Awaiting expert authority';
if(current==='SCR21')rows[1][3]=state.issued?'Issued in simulation':state.assembled?'Assembled candidate':'Draft, not issued';
if(current==='SCR13'&&role!=='alex')rows[1][2]=state.relevance;
if(current==='SCR19'&&role!=='alex')rows[0][1]=state.relevance;
if(current==='SCR15'&&state.collection.startsWith('50')){rows[1][2]='20';rows[1][3]='Captured on eligible retry';}
let status='';
if(['SCR07','SCR08','SCR04'].includes(current))status=statusText();
if(['SCR23','SCR24','SCR09'].includes(current))status=`PER-A: Affected · PER-B: Unknown | Preparation ${state.adopted?'REL-02':'REL-01'} | ENG-B ${state.amended?'REL-02':'REL-01'}`;
if(['SCR12','SCR13'].includes(current))status=`New intake: ${state.upload} · Current preparation evidence V${state.version} · Historical report retains V1`;
if(current==='SCR15')status=`RUN-01: ${state.collection}. Complete estate remains a separate declaration.`;
if(current==='SCR21')status=`REPORT-B-DRAFT: ${state.issued?'Issued in simulation':state.assembled?'Assembled; awaiting issuer authority':'Draft'} · REPORT-A-01 remains REL-01 / EV-01 V1 · Preserved new issue receipts: ${state.issueCount}`;
root.innerHTML=`<div class="eyebrow">${esc(s.workspace==='Curation'?'TAS EXPERT CURATION':s.workspace.toUpperCase())} WORKSPACE</div><h1>${esc(s.title)}</h1><p class="lead">${esc(s.lead)}</p><div class="context"><span>${['curator','expert','rights'].includes(role)?'Shared catalogue':'Northstar · synthetic payments group'}</span><span>Persona: ${esc(personas[role])}</span><span>${role==='alex'?'ENG-A / PER-A · export denied':'Exact records and current permissions'}</span></div>
<div class="tabs"><button data-tab="overview" class="${tab==='overview'?'active':''}">Workspace</button><button data-tab="fields" class="${tab==='fields'?'active':''}">Record details</button><button data-tab="rules" class="${tab==='rules'?'active':''}">Rules and lifecycle</button></div>
${status?`<div class="status ${state.published&&current==='SCR08'?'ok':''}">${esc(status)}</div>`:''}
${tab==='overview'?`<div class="grid"><section><div class="card"><h2>Current records</h2><table><thead><tr>${s.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="card"><h2>Continue the journey</h2><div class="links">${s.links.map(link).join('')||'<span class="tiny">No further destination for this simulated persona.</span>'}</div></div></section><section><div class="card fields"><h2>${s.fields.length?'Action details':'Execution controls'}</h2>${fields(s)}<div class="actions">${s.actions.map(([a,t])=>`<button data-action="${a}">${esc(t)}</button>`).join('')}</div><p class="tiny">Values and actions are illustrative. Required human and current-policy checks are simulated.</p></div></section></div>`:tab==='fields'?`<div class="card"><h2>${esc(m.name)} records</h2><p>${esc(m.records)}</p>${m.fields.map(([a,b])=>`<div class="formline"><strong>${esc(a)}</strong>${esc(b)}</div>`).join('')}</div>`:`<div class="card"><h2>Controlled progression</h2><ol>${m.steps.map(([a,b])=>`<li><strong>${esc(a)}.</strong> ${esc(b)}</li>`).join('')}</ol>${m.rules.map(([a,b])=>`<div class="rule"><strong>${esc(a)}</strong><p>${esc(b)}</p></div>`).join('')}<p>${esc(m.edges)}</p></div>`}
${result?`<div class="result" role="status"><h2>Simulation result</h2><div>${esc(result)}</div></div>`:''}
${state.events.length?`<details class="card"><summary>Session activity</summary><ol class="timeline">${state.events.slice(0,12).map(t=>`<li>${esc(t)}</li>`).join('')}</ol></details>`:''}`;
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;paint()});
document.querySelectorAll('[data-field]').forEach(i=>i.oninput=()=>{(state.fields[current]??=[])[+i.dataset.field]=i.value;if(current==='SCR21'){state.assembled=false;state.issued=false;}});
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>act(b.dataset.action));
}
function need(roles){if(!roles.includes(role)){log('Blocked: this action requires '+roles.map(r=>personas[r]).join(' or ')+'. Changing the simulated persona demonstrates a separate human role; it does not grant production access.');return false;}return true;}
function auto(){if(state.approved&&state.rights&&!state.published){state.published=true;state.events.unshift('Automatic execution: REL-02 activated once after current guards passed. No additional human publish request.');return 'Automatic guarded execution activated REL-02 once.';}return statusText()+'.';}
function act(a){
const values=state.fields[current]||byId[current].fields.map(x=>x[1]);
switch(a){
case 'authorise':if(need(['expert'])){state.approved=true;log('Exact subject SUB-02 authorised by qualified expert. '+auto());}break;
case 'renew':if(need(['rights'])){state.rights=true;log('Distribution permission renewed for unchanged exact subject. '+auto());}break;
case 'return':if(need(['expert'])){state.approved=false;log('Subject returned with reasons. A new exact subject must be reviewed; earlier active release history is not edited.');}break;
case 'refresh':log(statusText()+'. Status inspection does not override a guard.');break;
case 'mapping':if(need(['curator','expert'])){if(!['Equivalent','Subsumed','Extends','Partial','Conflicting','Orphan'].includes(values[2])){log('Invalid relationship. Select one of the six defined types.');break;}if((values[2]==='Orphan')!==(!values[1])){log('Invalid target: Orphan requires no target; every other type requires an actual target.');break;}state.approved=false;log('New mapping draft recorded as '+(values[2]||'Extends')+'. Exact meaning changed: prior unused approval is not carried forward. Published history is unchanged.');}break;
case 'orphan':if(need(['curator','expert'])){state.fields.SCR05=['B-UNMAPPED-r1','','Orphan','No reviewed neutral target exists'];state.approved=false;log('Orphan candidate saved with no target requirement. No fabricated coverage and no approval inherited.');}break;
case 'localreview':if(need(['scope'])){if(!state.published)log('Blocked: REL-02 is not active. Complete catalogue authorisation and current rights first.');else{state.local=true;log('Exact local pack reviewed: PER-A Affected and PER-B Unknown. This has not adopted preparation or amended a mission.');}}break;
case 'adopt':if(need(['company'])){if(!state.published||!state.local)log('Blocked: active REL-02 and exact local review are required.');else{state.adopted=true;log('Preparation baseline adopted as REL-02. ENG-A and ENG-B remain on their own snapshots.');}}break;
case 'amend':if(need(['audit'])){if(!state.published||!state.local)log('Blocked: new release and reviewed local impact are required.');else{state.amended=true;log('Separate ENG-B amendment authorised in simulation. ENG-A and REPORT-A-01 remain REL-01 / V1.');}}break;
case 'upload':if(need(['company'])){state.upload='Quarantined';log('Synthetic file received into quarantine. It is not available for review and no relevance decision exists.');}break;
case 'scan':if(need(['company','ops'])){if(state.upload!=='Quarantined')log('No quarantined synthetic intake to admit.');else{state.upload='Available';log('Simulated isolated safety checks passed and custody was admitted. No evidence relevance or compliance result is implied.');}}break;
case 'reuse':if(need(['company','audit'])){state.reuse=true;log('New USE-B proposal recorded for its own purpose and period. Existing USE-A conclusion was not copied.');}break;
case 'relevance':if(need(['audit'])){if(!['Accepted','Limited','Rejected','NeedsInformation'].includes(values[1])){log('Invalid relevance decision; choose Accepted, Limited, Rejected or NeedsInformation.');break;}state.relevance=values[1];log('USE-B relevance recorded as '+(values[1]||'Limited')+' with reason: '+(values[2]||'PER-A only')+'. This does not establish sufficiency or change USE-A.');}break;
case 'version':if(need(['company'])){state.version++;log('A new synthetic version is available for future preparation. REPORT-A-01 and existing examined uses still reference V1.');}break;
case 'dispute':if(need(['company'])){state.dispute=true;log('Client dispute attributed to FIND-A-01 r1. Professional disposition remains separate and the original finding is preserved.');}break;
case 'assemble':if(need(['audit'])){state.assembled=true;log('Exact draft package assembled with named recipients and private notes excluded. No issue yet. Changing fields invalidates this candidate.');}break;
case 'issue':if(need(['audit'])){if(!state.assembled)log('Blocked: assemble and review the exact package first.');else if(state.issued)log('Existing simulated issue receipt returned; no duplicate issue.');else{state.issued=true;state.issueCount++;log('Exact package and audience authorised; simulated guarded issue completed. Delivery/acknowledgement are distinct. REPORT-A-01 is unchanged.');}}break;
case 'collect':if(need(['company','ops'])){state.collection='Partial: 49 of 50 requested systems';log('RUN-01 captured 49 records; one partition is unavailable. No complete estate declaration.');}break;
case 'retrycollection':if(need(['company','ops'])){state.collection='50 of 50 requested captured';log('Missing partition reconciled without duplicate capture. Requested-set capture is complete; declared estate completeness remains unresolved.');}break;
case 'ai':if(need(['company','scope','audit','curator','expert'])){state.draft=true;log('Bounded simulated draft: PER-A is affected; PER-B remains unknown [CHANGE-01 / TRACE-01–02]. This is cited wording, not authority. No real model call or charge occurs.');}break;
case 'adoptdraft':if(!state.draft)log('No generated candidate to adopt.');else if(need(['company','scope','audit','curator','expert']))log('Wording kept in an attributed domain draft. No catalogue approval, baseline adoption or report issue occurred.');break;
case 'revoke':if(need(['company','ops'])){state.revoked=true;log('Alex grant revoked. Future simulated Alex views are blocked; prior historical authorship remains.');}break;
case 'export':if(need(['company','ops','audit']))log('Export preview contains permitted exact records and excludes private notes/restricted text. Unavailable external versions are listed; no file transfer or disposal performed.');break;
case 'close':if(need(['company','ops']))log('Closure preview: stop new work, reconcile export, assess holds/retention and external custody separately. Cancellation alone cannot delete history.');break;
case 'ack':log('Notice acknowledged only. No local review, adoption or engagement amendment.');break;
case 'defer':if(need(['company','scope']))log('Deferral reason and review date recorded. Source effective dates have not changed.');break;
case 'canceljob':if(need(['ops']))log('Optional job cancelled in simulation; uncertain provider effects still require reconciliation.');break;
default:{
const permissions={source:['curator','rights'],case:['curator','expert'],grant:['company','ops'],scope:['company','scope'],evaluate:['company','scope'],request:['company'],prepare:['company'],connection:['company','ops'],plan:['audit'],workpaper:['audit','alex'],sharefact:['audit','alex'],confirmstatement:['company','audit'],finding:['audit'],monitor:['curator','rights'],sponsor:['company','ops'],budget:['company','ops'],support:['ops'],job:['ops']};
if(need(permissions[a]||['company','scope','audit','alex','curator','expert','rights','ops']))log(({context:'Permitted context selected; old selections are cleared.',scope:'Declared limitation saved. Unknown is not converted to False.',evaluate:'Exact input evaluation preserves PER-B Unknown and its missing facts.',prepare:'Preparation review recorded. No assessor relevance or compliance outcome.',workpaper:'Workpaper revision saved with exact basis and private-note restriction.',sharefact:'Separate shared-fact draft created; private source note remains restricted.',confirmstatement:'Statement confirmation recorded as accuracy of testimony, not control effectiveness.',finding:'Professional disposition saved separately from the attributed client response.',monitor:'Source check found B-N1 r1. Curation and human review remain required.',search:'Permitted exact/lexical results returned without inference.',sponsor:'Prospective ENG-B sponsor transfer previewed. No duplicate activation, grant or ownership change.',budget:'Capped allowance preview only; explicit authorised spend acceptance is still required.',support:'Named bounded support preview created. No semantic or private-content authority.',task:'Coordination task resolved; underlying domain decision is unchanged.'})[a]||'Attributed draft or preview recorded in this simulation. Current domain permissions and approval boundaries remain in force.');
}}
paint();
}
document.querySelector('#persona').onchange=e=>{role=e.target.value;result='';tab='overview';setOptions();const first=SCREENS.find(x=>allowed(x.id));if(first)location.hash=first.id;paint();};
document.querySelector('#workspace').onchange=e=>{workspace=e.target.value;const first=SCREENS.find(x=>allowed(x.id)&&group(x.id)===workspace);if(first)location.hash=first.id;paint();};
document.querySelector('#reset').onclick=()=>{state=initial();result='Example reset. All changes were synthetic and session-only.';paint();};
window.onhashchange=()=>{tab='overview';result='';const id=location.hash.slice(1);if(byId[id]&&allowed(id))workspace=group(id);paint();};paint();
