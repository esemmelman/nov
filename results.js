// Public preliminary returns checked November 4, 2026 (Pacific time).
// No personal choices belong in this file. Values refer to ballot option indices.
const RESULT_DATE='November 4, 2026';
const BOOK='https://theballotbook.com/results';
const OC_RESULTS='https://www.livevoterturnout.com/ENR/orangecaenr/24/en/phkv4sV_Index_24.html';
const electionResults={};
function result(id,leaders,detail,source=BOOK,partial=false){electionResults[id]={leaders:leaders.map(String),detail,source,partial}}
[
 ['governor',0,'Xavier Becerra leads · 63.9%'],
 ['lieutenant',0,'Fiona Ma leads · 63.8%'],
 ['secretary',0,'Shirley N. Weber leads · 64.7%'],
 ['controller',1,'Malia M. Cohen leads · 63.8%'],
 ['treasurer',0,'Eleni Kounalakis leads · 64.0%'],
 ['attorney',1,'Rob Bonta leads · 63.8%'],
 ['insurance',1,'Jane Kim leads · 52.0%'],
 ['schools',0,'Richard Barrera leads · 57.1%'],
 ['groban',0,'Yes leads · 70.7%'],
 ['evans',0,'Yes leads · 71.4%']
].forEach(([id,index,text])=>result(id,[index],text));
result('equalization',[0],'Tom Umberg leads · 56.4%',BOOK+'?category=boe');
result('congress',[1],'Robert Garcia leads · 59.6%',BOOK+'?category=congressional');
result('senate',[0],'Chris Duncan leads · 50.2%',BOOK+'?category=senate');
result('assembly',[1],'Tri Ta leads · 50.8%',BOOK+'?category=assembly');
result('college',[0],'Kim Carr leads · 65.8%',BOOK+'?county=Orange');
result('cityattorney',[0],'Mike Vigliotta · 100% of reported candidate votes',OC_RESULTS);
result('council',[9,6,8,3],'Top four: Casey McKeon (12.7%), Pat Burns (12.4%), Andrew Gruel (11.8%), Ben Davis (11.5%)',BOOK+'/county/Orange/city-of-huntington-beach-member-city-council');
// County-only judicial returns are deliberately excluded from full-result matches.
Object.entries({kelety:71.28,castillo:70.85,do:61.71,dato:75.63,bermudez:69.70,rodriguez:70.94,rubin:69.95,lee:70.03,raphael:70.59,motoike:63.36,delaney:70.44,scott:70.57,servino:71.09,gooding:70.46,macaulay:63.73}).forEach(([id,pct])=>result(id,[0],`Yes leads in Orange County · ${pct}% · full court-district result unverified`,OC_RESULTS,true));
Object.entries({1:59.4,2:59.6,3:58.7,4:48.0,5:50.3,37:61.0,38:55.7,39:41.4,40:44.4,41:47.6,42:54.3,43:45.1,44:18.2,45:45.9}).forEach(([n,yes])=>{const lead=yes>50?'Yes':'No',pct=yes>50?yes:100-yes;result('prop'+n,[yes>50?0:1],`${lead} leads · ${pct.toFixed(1)}%`,BOOK+'?category=propositions')});

function comparison(q){
 const choices=selected(q),r=electionResults[q.id];
 const names=choices.map(c=>q.options[Number(c)]?.name||answers[q.id]?.[c]||'Unnamed write-in');
 let status='Not answered',kind='neutral';
 if(choices.length){
  if(!r)status='Result unavailable';
  else if(r.partial)status='County totals only';
  else if(q.max>1){const hits=choices.filter(c=>r.leaders.includes(c)).length;status=`${hits} of ${choices.length} in leading ${q.max}`;kind=hits===choices.length?'match':'different'}
  else {const match=r.leaders.includes(choices[0]);status=match?'Matches leader':'Different from leader';kind=match?'match':'different'}
 }
 return {names,status,kind,result:r};
}
function renderComparison(){
 if(!key)return;
 const body=$('comparisonRows');body.replaceChildren();
 let matches=0,different=0,partial=0,unanswered=0;
 ballot.forEach(q=>{
  const c=comparison(q),row=el('tr');
  if(!selected(q).length)unanswered++;else if(c.result?.partial||!c.result)partial++;else if(c.kind==='match')matches++;else different++;
  const title=el('th',q.title);title.scope='row';
  const choice=el('td',c.names.join(', ')||'Not answered');
  const reported=el('td',c.result?.detail||'Result not yet verified');
  if(c.result){const a=el('a','View source');a.href=c.result.source;a.target='_blank';a.rel='noopener noreferrer';reported.append(el('br'),a)}
  const status=el('td',c.status,c.kind);row.append(title,choice,reported,status);body.append(row);
 });
 $('comparisonSummary').textContent=`${matches} contests match the leaders · ${different} differ or partly match · ${partial} have partial/unverified results · ${unanswered} unanswered`;
}
function closeComparison(){ $('comparison').hidden=true;$('comparisonRows').replaceChildren();$('comparisonSummary').textContent='';$('compare').setAttribute('aria-expanded','false') }
$('compare').onclick=()=>{if(!$('comparison').hidden){closeComparison();return}if(!key)return;renderComparison();$('comparison').hidden=false;$('compare').setAttribute('aria-expanded','true');$('comparison').scrollIntoView({behavior:'smooth',block:'start'})};
$('closeComparison').onclick=()=>{closeComparison();$('compare').focus()};
