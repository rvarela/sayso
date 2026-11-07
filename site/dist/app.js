const paths={
 root:{title:'What would you like to say?',hint:'Choose a sentence starter.',options:[['I need','needs','🙋‍♀️'],['I feel','feelings','💛'],['I want','wants','🤔'],['I am','states','👋'],['Please','please','🙏'],['Talk about…','topics','💬']]},
 needs:{title:'What do you need?',options:[['a drink','drink','🥤'],['food','food','🍲'],['the toilet','finish','🚻'],['help','help','🤝'],['my medicine','finish','💊'],['to rest','finish','🛏️']]},
 feelings:{title:'How do you feel?',options:[['happy','finish','😊'],['sad','finish','😔'],['worried','finish','😟'],['angry','finish','😠'],['tired','finish','😴'],['in pain','pain','🩹']]},
 wants:{title:'What do you want?',options:[['to eat','food','🍲'],['to drink','drink','🥤'],['to go','places','📍'],['to see','people','👥'],['to stop','finish','✋'],['to continue','finish','▶']]},
 states:{title:'Tell us more',options:[['comfortable','finish','🫶'],['too hot','finish','☀️'],['too cold','finish','❄️'],['confused','finish','❓'],['ready','finish','✓'],['not ready','finish','○']]},
 please:{title:'What would help?',options:[['speak slowly','finish','🐢'],['say that again','finish','↻'],['give me time','finish','⏳'],['write it down','finish','✏️'],['call someone','people','📞']]},
 topics:{title:'Choose a topic',add:false,options:[['Needs','needs','🤲'],['Feelings','feelings','💛'],['Pain','pain','🩹'],['Food & drink','food','🍲'],['People','people','👥'],['Places','places','📍']]},
 food:{title:'What would you like?',options:[['breakfast','finish','🍳'],['lunch','finish','🥪'],['dinner','finish','🍽️'],['a snack','finish','🍎'],['something sweet','finish','🍰']]},
 drink:{title:'What would you like to drink?',options:[['water','finish','💧'],['tea','finish','☕'],['coffee','finish','☕'],['juice','finish','🧃'],['milk','finish','🥛']]},
 pain:{title:'Where is the pain?',options:[['my head','severity','🧠'],['my chest','severity','🫁'],['my stomach','severity','◯'],['my back','severity','🧍'],['my arm','severity','💪'],['my leg','severity','🦵']]},
 severity:{title:'How strong is it?',options:[['a little','finish','●'],['moderate','finish','●●'],['very strong','finish','●●●']]},
 help:{title:'What kind of help?',options:[['sitting up','finish','🪑'],['standing up','finish','🧍'],['moving','finish','↔'],['calling someone','people','📞'],['understanding','finish','💬']]},
 people:{title:'Who?',options:[['my family','finish','🏠'],['my partner','finish','♥'],['a nurse','finish','＋'],['a doctor','finish','🩺'],['my caregiver','finish','🤝']]},
 places:{title:'Where?',options:[['home','finish','🏠'],['outside','finish','🌿'],['the bathroom','finish','🚻'],['my room','finish','🛏️'],['the hospital','finish','🏥']]},
 finish:{title:'Your message is ready',hint:'You can speak it, change a part, or add another thought.',options:[['Add another thought','root','＋']]}
};
const labels={needs:'I need…',feelings:'I feel…',wants:'I want…',states:'I am…',please:'Please…',people:'People',food:'Food & drink',places:'Places'};
let state={node:'root',trail:[],mode:'visual',voice:localStorage.getItem('sayso-voice')||'',custom:JSON.parse(localStorage.getItem('sayso-custom')||'[]'),usage:JSON.parse(localStorage.getItem('sayso-usage')||'{}')};
const $=s=>document.querySelector(s);
const quickSentences=['Yes.', 'No.', 'I need my caregiver.', 'I am in severe pain.', 'I am having trouble breathing.'];
const customQuick=JSON.parse(localStorage.getItem('sayso-quick')||'[]');
const favourites=JSON.parse(localStorage.getItem('sayso-favourites')||'[]');
const allQuick=()=>[...quickSentences,...favourites,...customQuick];
let quickOrder=JSON.parse(localStorage.getItem('sayso-quick-order')||'[]');
const saveQuickOrder=()=>localStorage.setItem('sayso-quick-order',JSON.stringify(quickOrder));
function removeFromQuickOrder(index){
 quickOrder=quickOrder.filter(i=>i!==index).map(i=>i>index?i-1:i);
 saveQuickOrder();
}
function insertIntoQuickOrder(index){
 quickOrder=quickOrder.map(i=>i>=index?i+1:i);
 saveQuickOrder();
}
const escapeHtml=text=>text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const message=()=>state.trail.map(part=>part.text).join(' ').replace(/ \./g,'.');
const complete=()=>state.trail.length>0 && ['finish','root','drink','food','help','severity','topics'].includes(state.node);

function phrase(text){
 const previous=state.trail.at(-1)?.text;
 const topic=state.trail.length===0||state.newThought;
 switch(state.node){
  case 'needs': return topic?'I need '+text:text;
  case 'feelings': return (topic?'I feel ':'')+(text==='in pain'?'pain':text);
  case 'food': return topic?'I would like '+text:previous==='food'||previous==='I need food'?'such as '+text:text;
  case 'drink': return /a drink$/.test(previous)?'such as '+text:text;
  case 'help': return text==='calling someone'?'calling':text==='understanding'?'understanding what you said':text;
  case 'please': return text==='call someone'?'call':text;
  case 'people': return topic?'I would like to talk to '+text:text;
  case 'places': return (topic?'I want to go ':'')+(['home','outside'].includes(text)?text:'to '+text);
  case 'pain': return topic?'I have pain in '+text:'in '+text;
  case 'severity': return '. The pain is '+({ 'a little':'mild',moderate:'moderate','very strong':'severe' }[text]||text);
  default: return text;
 }
}

function addWord(text, category, emoji){
 state.custom.push({id:String(Date.now()),text,category,emoji});
 localStorage.setItem('sayso-custom',JSON.stringify(state.custom));
}

function showMode(mode){
 for(const [name,view] of [['builder','#builderView'],['quick','#quickView'],['assess','#assessView']]){
  $(view).classList.toggle('hidden',name!==mode);
  $(`[data-action="${name}"]`).setAttribute('aria-pressed',name===mode);
 }
}

function showQuick(show){
 showMode(show?'quick':'builder');
 const entries=allQuick();
 quickOrder=[...new Set([...quickOrder,...entries.keys()])].filter(i=>i>=0&&i<entries.length);
 $('#quickView').innerHTML=quickOrder.map(i=>{
  const entry=entries[i];
  const {text,emoji}=typeof entry==='string'?{text:entry}:entry;
  const icon=emoji?`<span class="option-icon" aria-hidden="true">${escapeHtml(emoji)}</span>`:'';
  const card=`<button class="option-card" data-quick="${i}">${icon}<span class="option-text">${escapeHtml(text)}</span></button>`;
  if(i<quickSentences.length)return card;
  const label=i<quickSentences.length+favourites.length?'Unfavourite':'Remove';
  return `<div class="quick-row"><button class="quick-remove" data-remove-quick="${i}">${label}</button>${card}<button class="quick-more" aria-label="Actions for ${escapeHtml(text)}" aria-expanded="false">⋯</button></div>`;
 }).join('')
  + '<button class="option-card" data-action="add-quick"><span class="option-text">Add another</span><span class="option-arrow add-plus" aria-hidden="true">+</span></button>';
}

const pictureTrials=[
 {target:['🚗','Car'],choices:[['✈️','Plane'],['🚌','Bus'],['🚲','Bicycle']],answer:1},
 {target:['🐈','Cat'],choices:[['🐕','Dog'],['🪑','Chair'],['🍌','Banana']],answer:0},
 {target:['🍎','Apple'],choices:[['👟','Shoe'],['🔑','Key'],['🍐','Pear']],answer:2},
 {target:['👕','Shirt'],choices:[['🧦','Sock'],['🚂','Train'],['🍇','Grapes']],answer:0},
 {target:['🥄','Spoon'],choices:[['🎸','Guitar'],['🍴','Fork'],['🏠','House']],answer:1},
 {target:['🦆','Duck'],choices:[['📚','Books'],['🧤','Glove'],['🐓','Rooster']],answer:2}
];
const actionTrials=[
 ['🏊‍♀️','she','Woman swimming'],
 ['🏃‍♂️','he','Man running'],
 ['🚴‍♀️','she','Woman cycling'],
 ['🤹‍♂️','he','Man juggling'],
 ['💃','she','Woman dancing'],
 ['🧗‍♂️','he','Man climbing'],
 ['🏄‍♀️','she','Woman surfing'],
 ['🏋️‍♂️','he','Man lifting weights']
];
const exercises={
 pictures:{title:'Find the similar picture',trials:pictureTrials},
 actions:{title:'Finish the sentence',trials:actionTrials}
};
let exercise=null, trialIndex=0, matches=0;

function renderAssess(){
 const view=$('#assessView');
 if(!exercise){
  view.innerHTML='<div class="prompt-block"><h1 tabindex="-1">Assess</h1><p>Therapist-led picture exercises.</p></div><div class="option-list">'
   +Object.entries(exercises).map(([id,{title}])=>`<button class="option-card" data-exercise="${id}"><span class="option-text">${title}</span><span class="option-arrow" aria-hidden="true">›</span></button>`).join('')
   +'</div><p>Informal exercises. Use your own clinical judgement when interpreting responses.</p>';
 }else{
  const {title,trials}=exercises[exercise];
  const trial=trials[trialIndex];
  if(!trial){
   const summary=exercise==='pictures'?`${matches} of ${trials.length} matched the expected picture.`:'All action pictures shown.';
   view.innerHTML=`<div class="prompt-block"><h1 tabindex="-1">Exercise complete</h1><p>${summary}</p></div><button class="secondary-button" data-action="assess-menu">Back to exercises</button>`;
  }else{
   const heading=exercise==='pictures'?title:`Usually ${trial[1]}…`;
   const [icon,label]=exercise==='pictures'?trial.target:[trial[0],trial[2]];
   view.innerHTML=`<div class="prompt-block assess-prompt"><p class="eyebrow">${trialIndex+1} of ${trials.length}</p><h1 tabindex="-1">${heading}</h1></div>
    <div class="assess-picture" role="img" aria-label="${label}">${icon}</div>`
    +(exercise==='pictures'
      ?`<div class="assess-choices">${trial.choices.map(([picture,name],i)=>`<button class="option-card" aria-label="${name}" data-match="${i}">${picture}</button>`).join('')}</div>`
      :'<button class="speak-button assess-next" data-action="assess-next">Next</button>');
  }
 }
 view.querySelector('h1').focus({preventScroll:true});
}

function revealQuickAction(row, open){
 row.classList.toggle('revealed',open);
 row.querySelector('.quick-more').setAttribute('aria-expanded',open);
}

let quickSwipe;
let drag;
function endDrag(){
 if(!drag)return;
 clearTimeout(drag.timer);
 drag.item.classList.remove('quick-dragging');
 drag.item.style.removeProperty('--drag-y');
}

function moveQuickCard(clientY){
 const {item,startTop,y}=drag;
 const siblings=Array.from($('#quickView').children).filter(node=>node!==item);
 const center=startTop+item.offsetHeight/2+clientY-y;
 const next=siblings.find(node=>!node.matches('[data-action="add-quick"]') && center<node.offsetTop+node.offsetHeight/2)
  || $('[data-action="add-quick"]');
 if(item.nextElementSibling!==next){
  const oldPositions=siblings.map(node=>node.getBoundingClientRect().top);
  siblings.forEach(node=>node.getAnimations().filter(animation=>animation.id==='quick-shift').forEach(animation=>animation.cancel()));
  next.before(item);
  const newPositions=siblings.map(node=>node.getBoundingClientRect().top);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   siblings.forEach((node,i)=>{
    const offset=oldPositions[i]-newPositions[i];
    if(offset)node.animate([{translate:`0 ${offset}px`},{translate:'0 0'}],{id:'quick-shift',duration:180,easing:'ease-out'});
   });
  }
 }
 item.style.setProperty('--drag-y',clientY-y+startTop-item.offsetTop+'px');
}
$('#quickView').addEventListener('pointerdown',event=>{
 if(!event.isPrimary||event.button!==0)return;
 const row=event.target.closest('.quick-row');
 quickSwipe=row&&{row,x:event.clientX,y:event.clientY};
 const card=event.target.closest('[data-quick]');
 if(!card)return;
 const item=row||card;
 drag={item,startTop:item.offsetTop,x:event.clientX,y:event.clientY,active:false};
 drag.timer=setTimeout(()=>{
  drag.active=true;
  quickSwipe=null;
  if(row)revealQuickAction(row,false);
  $('#quickView').setPointerCapture(event.pointerId);
  item.classList.add('quick-dragging');
 },350);
});
$('#quickView').addEventListener('pointermove',event=>{
 if(!drag)return;
 const dy=event.clientY-drag.y;
 if(drag.active)moveQuickCard(event.clientY);
 else if(Math.hypot(event.clientX-drag.x,dy)>10){endDrag();drag=null;}
});
$('#quickView').addEventListener('touchmove',event=>{
 if(drag?.active&&event.cancelable)event.preventDefault();
},{passive:false});
$('#quickView').addEventListener('pointerleave',()=>{
 if(!drag?.active){endDrag();drag=null;quickSwipe=null;}
});
$('#quickView').addEventListener('contextmenu',event=>{
 if(event.target.closest('[data-quick]'))event.preventDefault();
});
$('#quickView').addEventListener('pointercancel',()=>{
 const active=drag?.active;
 quickSwipe=null;
 endDrag();
 drag=null;
 if(active)showQuick(true);
});
$('#quickView').addEventListener('pointerup',event=>{
 if(drag?.active){
  const item=drag.item;
  const offset=item.style.getPropertyValue('--drag-y')||'0px';
  quickOrder=Array.from($('#quickView').querySelectorAll('[data-quick]'),card=>Number(card.dataset.quick));
  endDrag();
  drag=null;
  saveQuickOrder();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   item.animate([{transform:`translateY(${offset}) scale(1.025)`},{transform:'none'}],{duration:180,easing:'ease-out'});
  }
  return;
 }
 endDrag();
 drag=null;
 if(!quickSwipe)return;
 const {row,x,y}=quickSwipe;
 quickSwipe=null;
 const dx=event.clientX-x;
 if(Math.abs(dx)<40||Math.abs(dx)<=Math.abs(event.clientY-y))return;
 revealQuickAction(row,dx<0);
 const suppressClick=event=>event.stopPropagation();
 row.addEventListener('click',suppressClick,{capture:true,once:true});
 setTimeout(()=>row.removeEventListener('click',suppressClick,true),0);
});

$('#quickForm').addEventListener('submit',event=>{
 event.preventDefault();
 const text=$('#quickText').value.trim();
 if(!text)return;
 customQuick.push({text,emoji:$('#quickEmoji').value.trim()});
 localStorage.setItem('sayso-quick',JSON.stringify(customQuick));
 $('#quickDialog').close();
 showQuick(true);
 $('[data-action="add-quick"]').focus();
});
let availableVoices=[];
function preferredVoice(voices){const english=voices.filter(v=>/^en([-_]|$)/i.test(v.lang));const preferred=/natural|online|sonia|jenny|aria|libby|ava|samantha|zira|google uk english female/i;return english.find(v=>preferred.test(v.name))||english.find(v=>v.default)||english[0]||voices[0]}
function loadVoices(){if(!('speechSynthesis'in window))return;availableVoices=speechSynthesis.getVoices();if(!availableVoices.length)return;const selected=availableVoices.find(v=>v.voiceURI===state.voice)||preferredVoice(availableVoices);if(!state.voice&&selected){state.voice=selected.voiceURI;localStorage.setItem('sayso-voice',state.voice)}const select=$('#voiceSelect');if(!select)return;const english=availableVoices.filter(v=>/^en([-_]|$)/i.test(v.lang));const choices=english.length?english:availableVoices;select.innerHTML=choices.map(v=>`<option value="${v.voiceURI.replace(/"/g,'&quot;')}" ${v.voiceURI===state.voice?'selected':''}>${v.name} (${v.lang})</option>`).join('')}
function speak(text){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);const voice=availableVoices.find(v=>v.voiceURI===state.voice)||preferredVoice(availableVoices);if(voice)u.voice=voice;u.rate=.9;u.pitch=1;speechSynthesis.speak(u)}
function optionsFor(node){let opts=[...(paths[node].options||[])];state.custom.filter(x=>x.category===node).forEach(x=>opts.push([x.text,'finish',escapeHtml(x.emoji||'⭐')]));return opts.sort((a,b)=>(state.usage[b[0]]||0)-(state.usage[a[0]]||0))}
function render(){const data=paths[state.node];$('#screenTitle').textContent=data.title;$('#screenHint').textContent=data.hint||'Tap an option. It will be spoken and added to your message.';$('#eyebrow').textContent=state.node==='root'?'Let’s find the words':'Keep going';
 const composer=$('#composer');composer.classList.toggle('hidden',!state.trail.length);$('#speakSentence').classList.toggle('hidden',!state.trail.length);$('#sentenceCrumbs').innerHTML=state.trail.map((x,i)=>`<button class="crumb" data-crumb="${i}" title="Change what comes next">${escapeHtml(x.text)}</button>`).join('');
 const saved=favourites.includes(message());
 $('#favourite').disabled=!complete();
 $('#favourite').textContent=saved?'★':'☆';
 $('#favourite').setAttribute('aria-pressed',saved);
 $('#favourite').setAttribute('aria-label',saved?'Remove favourite':'Save favourite');
 $('#inlineAdd').classList.toggle('hidden',['root','topics','finish'].includes(state.node));
 const list=optionsFor(state.node);$('#optionList').innerHTML=list.map((o,i)=>`<button class="option-card" role="listitem" data-option="${i}">${state.mode==='visual'?`<span class="option-icon">${o[2]}</span>`:''}<span class="option-text">${escapeHtml(o[0])}</span><span class="option-arrow">›</span></button>`).join('');
}
function choose(index){
 const node=state.node, o=optionsFor(node)[index];
 if(!o)return;
 speak(o[0]);
 state.usage[o[0]]=(state.usage[o[0]]||0)+1;
 localStorage.setItem('sayso-usage',JSON.stringify(state.usage));
 if(node==='finish') state.newThought=true;
 else if(paths[node].add!==false&&o[1]!=='topics'){
  const text=phrase(o[0]);
  state.trail.push({text:state.newThought?'. '+text:text,node,next:o[1]});
  state.newThought=false;
 }
 state.node=o[1];
 render();
}
function showSettings(show){$('#patientView').classList.toggle('hidden',show);$('#settingsView').classList.toggle('hidden',!show);renderCustom();scrollTo(0,0)}
function renderCustom(){
 const box=$('#customItems');
 $('#customCount').textContent=state.custom.length;
 const groups=new Map();
 for(const item of state.custom){
  if(!groups.has(item.category))groups.set(item.category,[]);
  groups.get(item.category).push(item);
 }
 box.innerHTML=Array.from(groups,([category,items])=>`<section class="custom-group"><h3>${escapeHtml(labels[category]||paths[category]?.title||category)}</h3>${items.map(x=>`<div class="custom-item"><span>${escapeHtml(x.text)}</span><button class="remove-button" data-remove="${escapeHtml(x.id)}">Remove</button></div>`).join('')}</section>`).join('')||'<p class="empty-state">No personal words added yet.</p>';
}
document.addEventListener('change',e=>{if(e.target.id==='voiceSelect'){state.voice=e.target.value;localStorage.setItem('sayso-voice',state.voice);speak('This is how I will sound.')}});
$('#inlineForm').addEventListener('submit',event=>{
 event.preventDefault();
 const text=$('#inlineWord').value.trim();
 if(!text)return;
 addWord(text,state.node,$('#wordEmoji').value.trim());
 $('#wordDialog').close();
 render();
 $('#inlineAdd').focus();
});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.option!=null)return choose(+b.dataset.option);if(b.dataset.crumb!=null){const i=+b.dataset.crumb;state.trail=state.trail.slice(0,i+1);state.node=state.trail[i].next;state.newThought=false;return render()}if(b.dataset.remove){state.custom=state.custom.filter(x=>x.id!==b.dataset.remove);localStorage.setItem('sayso-custom',JSON.stringify(state.custom));return renderCustom()}
 if(b.classList.contains('quick-more')){
  const row=b.closest('.quick-row');
  return revealQuickAction(row,!row.classList.contains('revealed'));
 }
 if(b.dataset.removeQuick!=null){
  const index=Number(b.dataset.removeQuick)-quickSentences.length;
  const isFavourite=index<favourites.length;
  const list=isFavourite?favourites:customQuick;
  list.splice(isFavourite?index:index-favourites.length,1);
  removeFromQuickOrder(Number(b.dataset.removeQuick));
  localStorage.setItem(isFavourite?'sayso-favourites':'sayso-quick',JSON.stringify(list));
  render();
  showQuick(true);
  $('[data-action="add-quick"]').focus();
  return;
 }
 if(b.dataset.quick!=null){
  const entry=allQuick()[Number(b.dataset.quick)];
  return speak(typeof entry==='string'?entry:entry.text);
 }
 if(b.dataset.action==='add-quick'){
  $('#quickForm').reset();
  return $('#quickDialog').showModal();
 }
 if(b.dataset.action==='cancel-quick')return $('#quickDialog').close();
 if(b.dataset.action==='add-word'){
  $('#inlineForm').reset();
  return $('#wordDialog').showModal();
 }
 if(b.dataset.action==='cancel-word')return $('#wordDialog').close();
 if(b.dataset.action==='quick'||b.dataset.action==='builder')return showQuick(b.dataset.action==='quick');
 if(b.dataset.action==='assess'){showMode('assess');return renderAssess();}
 if(b.dataset.exercise){
  exercise=b.dataset.exercise;
  trialIndex=0;
  matches=0;
  return renderAssess();
 }
 if(b.dataset.action==='assess-menu'){exercise=null;return renderAssess();}
 if(b.dataset.match!=null){
  if(Number(b.dataset.match)===pictureTrials[trialIndex].answer)matches++;
  trialIndex++;
  return renderAssess();
 }
 if(b.dataset.action==='assess-next'){trialIndex++;return renderAssess();}
 if(b.dataset.action==='speak-sentence')return speak(message());
 if(b.dataset.action==='home'||b.dataset.action==='clear'||b.dataset.action==='undo')state.newThought=false;
 if(b.dataset.action==='home')showQuick(false);
 if(b.dataset.action==='favourite'){
  if(!complete())return;
  const index=favourites.indexOf(message());
  if(index<0){
   insertIntoQuickOrder(quickSentences.length+favourites.length);
   favourites.push(message());
  }else{
   favourites.splice(index,1);
   removeFromQuickOrder(quickSentences.length+index);
  }
  localStorage.setItem('sayso-favourites',JSON.stringify(favourites));
  return render();
 }
 const a=b.dataset.action;if(a==='settings')showSettings(true);if(a==='close-settings')showSettings(false);if(a==='home'){state.node='root';state.trail=[];render()}if(a==='undo'){const last=state.trail.pop();state.node=last?.node||'root';render()}if(a==='clear'){state.node='root';state.trail=[];render()}if(a==='speak-sentence')speak(state.trail.map(x=>x.text).join(' '));if(a==='preview-voice')speak('Hello. This is the voice I will use to help you communicate.');if(a==='add-custom'){const input=$('#customLabel'),text=input.value.trim();if(!text)return $('#formStatus').textContent='Please enter a word or phrase.';state.custom.push({id:String(Date.now()),text,category:$('#categorySelect').value});localStorage.setItem('sayso-custom',JSON.stringify(state.custom));input.value='';$('#formStatus').textContent=`Added “${text}”.`;renderCustom()}if(a==='reset-learning'){state.usage={};localStorage.removeItem('sayso-usage');b.textContent='Reset ✓';setTimeout(()=>b.textContent='Reset',1200)}});
if('speechSynthesis'in window){speechSynthesis.addEventListener('voiceschanged',loadVoices);loadVoices()}
render();
