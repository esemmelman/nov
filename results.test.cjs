const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();
function node(){return {hidden:true,textContent:'',children:[],append(...children){this.children.push(...children)},replaceChildren(){this.children=[]},setAttribute(){},scrollIntoView(){},focus(){}}}
const ctx={document:{getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('ballot.js','utf8')+`\nlet key=true,answers={};const $=id=>document.getElementById(id);function el(tag,text,cls){const n=document.createElement(tag);n.textContent=text;n.className=cls;return n}function selected(q){return answers[q.id]?.choices||[]}\n`+fs.readFileSync('results.js','utf8'),ctx);
function run(s){return vm.runInContext(s,ctx)}
assert.equal(run('ballot.length'),46);
assert.equal(run('ballot.every(q=>electionResults[q.id])'),true);
assert.equal(run('ballot.every(q=>electionResults[q.id].leaders.every(c=>q.options[Number(c)]))'),true);
assert.equal(run("comparison(ballot[0]).status"),'Not answered');
run("answers={governor:{choices:['0']},insurance:{choices:['0']},council:{choices:['0','3','6','8']},kelety:{choices:['0']},schools:{choices:['write0'],write0:'Example write-in'}}");
assert.equal(run("comparison(ballot.find(q=>q.id==='governor')).status"),'Matches leader');
assert.equal(run("comparison(ballot.find(q=>q.id==='insurance')).status"),'Different from leader');
assert.equal(run("comparison(ballot.find(q=>q.id==='council')).status"),'3 of 4 in leading 4');
assert.equal(run("comparison(ballot.find(q=>q.id==='kelety')).status"),'County totals only');
assert.equal(run("comparison(ballot.find(q=>q.id==='schools')).names[0]"),'Example write-in');
run("$('compare').onclick()");assert.equal(nodes.get('comparison').hidden,false);assert.equal(nodes.get('comparisonRows').children.length,46);
run('closeComparison();key=null;$(\'compare\').onclick()');assert.equal(nodes.get('comparisonRows').children.length,0);assert.equal(nodes.get('comparison').hidden,true);
assert.match(fs.readFileSync('app.js','utf8'),/function lock\(\)\{if\(typeof closeComparison/);
console.log('PASS: all 46 results mapped, unanswered/single/multiple/write-in choices, partial totals, comparison toggle and lock cleanup.');
