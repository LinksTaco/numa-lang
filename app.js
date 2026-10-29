const WORDS = [
  {word:"ava", meaning:"water", note:"Provisional root", core:true},
  {word:"keto", meaning:"fire", note:"Provisional root", core:true},
  {word:"senu", meaning:"sky", note:"Provisional root"},
  {word:"doma", meaning:"earth, ground", note:"Provisional root"},
  {word:"pali", meaning:"person", note:"Provisional root", core:true},
  {word:"navi", meaning:"friend", note:"Provisional root", core:true},
  {word:"mako", meaning:"house, home", note:"Current standardized spelling; provisional root", core:true},
  {word:"Šari", meaning:"tree", note:"Provisional root"},
  {word:"tavi", meaning:"animal", note:"Provisional root"},
  {word:"luma", meaning:"light", note:"Provisional root"},
  {word:"zenu", meaning:"night, darkness", note:"Provisional root"},
  {word:"kavi", meaning:"day", note:"Provisional root"},
  {word:"ranu", meaning:"sun", note:"Provisional root"},
  {word:"sali", meaning:"moon", note:"Provisional root"},
  {word:"veta", meaning:"go, move", note:"Provisional root", core:true},
  {word:"naku", meaning:"come, arrive", note:"Provisional root"},
  {word:"penu", meaning:"see, look", note:"Provisional root", core:true},
  {word:"ravi", meaning:"know", note:"Provisional root"},
  {word:"kuma", meaning:"eat", note:"Provisional root", core:true},
  {word:"sova", meaning:"drink", note:"Provisional root"},
  {word:"yavi", meaning:"speak, say", note:"“Tell” extension is not finalized", core:true},
  {word:"telu", meaning:"hear, listen", note:"Provisional root"},
  {word:"banu", meaning:"make, create", note:"Provisional root"},
  {word:"davi", meaning:"give", note:"Provisional root"},
  {word:"mita", meaning:"want, desire", note:"Provisional root", core:true},
  {word:"kori", meaning:"like, enjoy", note:"Provisional root", core:true},
  {word:"nima", meaning:"child", note:"Provisional root"},
  {word:"suma", meaning:"sleep, rest", note:"Provisional root"},
  {word:"yuna", meaning:"happy, happiness", note:"Provisional root"},
  {word:"moru", meaning:"food, meal", note:"Provisional root", core:true},
  {word:"kesa", meaning:"walk", note:"Provisional root"},
  {word:"pira", meaning:"run", note:"Provisional root"},
  {word:"nora", meaning:"see you later, goodbye", note:"Provisional root"},
  {word:"eya", meaning:"yes", note:"Provisional root", core:true},
  {word:"non", meaning:"no (standalone response)", note:"Distinct from the negation prefix no-", core:true},
  {word:"ani", meaning:"and; with", note:"Meaning depends on syntax and context", core:true},
  {word:"Ñam", meaning:"before", note:"Provisional root"},
  {word:"Ñom", meaning:"after", note:"Provisional root"},
  {word:"toma", meaning:"time", note:"Provisional root"},
  {word:"lan", meaning:"stream, waterway", note:"Separate from ava (“water”); provisional"},
  {word:"Šun", meaning:"peace, calm", note:"Provisional root"},
  {word:"ñai", meaning:"good", note:"User-selected vocabulary", core:true},
  {word:"Misa", meaning:"I, me", note:"Current chosen pronoun", core:true},
  {word:"Tim", meaning:"you", note:"Current chosen pronoun", core:true},
  {word:"Po", meaning:"he", note:"Current chosen pronoun"},
  {word:"Pa", meaning:"she", note:"Current chosen pronoun"},
  {word:"Pe", meaning:"ungendered / gender-unspecified third-person pronoun", note:"Current chosen pronoun"}
];
const STORAGE_KEY = "numa-learning-progress-v1";
const defaultState = () => ({known:[], seen:0, lastStudy:null, studyIndex:0, dailyIndex:0});
let state = loadState();
let studyWords = [];
let isFlipped = false;
let quiz = {items:[],index:0,score:0,answered:false,finished:false};
let installPrompt = null;
const $ = id => document.getElementById(id);
function loadState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch{return defaultState()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderProgress()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2300)}
function renderProgress(){
  const total=WORDS.length, known=new Set(state.known).size;
  $("progressLabel").textContent=`${known} mastered`;
  $("progressBar").style.width=`${Math.min(100,known/total*100)}%`;
  $("wordCount").textContent=`${total} words in dictionary`;
  const today=new Date().toISOString().slice(0,10);
  $("streakLabel").textContent=state.lastStudy===today?"Studied today — nice work":"A few minutes counts";
}
function setTab(tab){
  if(tab==="quiz"){$("view-quiz").classList.remove("hidden");document.querySelectorAll(".view").forEach(v=>{if(v.id!=="view-quiz")v.classList.add("hidden")});document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));return}
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("hidden",v.id!==`view-${tab}`));
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  if(tab==="study")renderCard();
  if(tab==="dictionary")renderDictionary();
  window.scrollTo({top:0,behavior:"smooth"});
}
function go(tab){setTab(tab);if(tab==="quiz")startQuiz()}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.tab)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
function renderDaily(){
  const item=WORDS[state.dailyIndex%WORDS.length];
  $("dailyWord").textContent=item.word;$("dailyMeaning").textContent=item.meaning;$("dailyNote").textContent=item.note;
}
$("dailyFlip").addEventListener("click",()=>{state.dailyIndex=(state.dailyIndex+7)%WORDS.length;saveState();renderDaily()});

function getStudyWords(){
  return WORDS.filter(w=>$("studySet").value==="core"?w.core:w);
}
function renderCard(){
  studyWords=getStudyWords();
  if(!studyWords.length)return;
  state.studyIndex=((state.studyIndex%studyWords.length)+studyWords.length)%studyWords.length;
  const item=studyWords[state.studyIndex];
  const english=$("studyDirection").value==="english";
  $("cardCounter").textContent=`CARD ${state.studyIndex+1} / ${studyWords.length}`;
  $("cardPrompt").textContent=english?item.meaning:item.word;
  $("cardAnswer").textContent=english?item.word:item.meaning;
  $("cardAnswer").classList.toggle("hidden",!isFlipped);
  $("cardHint").classList.toggle("hidden",isFlipped);
  $("ratingActions").classList.toggle("hidden",!isFlipped);
  $("flashcard").setAttribute("aria-label",isFlipped?"Flashcard answer shown":"Flip flashcard to reveal answer");
}
function flipCard(){isFlipped=!isFlipped;renderCard()}
$("flashcard").addEventListener("click",flipCard);
$("studyDirection").addEventListener("change",()=>{isFlipped=false;renderCard()});
$("studySet").addEventListener("change",()=>{state.studyIndex=0;isFlipped=false;renderCard()});
$("prevCard").addEventListener("click",()=>{state.studyIndex--;isFlipped=false;renderCard()});
$("nextCard").addEventListener("click",()=>{state.studyIndex++;isFlipped=false;renderCard()});
document.querySelectorAll("[data-rate]").forEach(b=>b.addEventListener("click",()=>{
  const item=studyWords[state.studyIndex];
  state.seen=(state.seen||0)+1;
  if(b.dataset.rate==="known"){if(!state.known.includes(item.word))state.known.push(item.word);toast("Marked as mastered. Nice!")}
  else{state.known=state.known.filter(w=>w!==item.word);toast("Added back to your review pile.")}
  state.lastStudy=new Date().toISOString().slice(0,10);saveState();
  state.studyIndex++;isFlipped=false;renderCard();
}));

function startQuiz(){
  const pool=WORDS.filter(w=>w.word!=="ñai" || true);
  const shuffled=[...pool].sort(()=>Math.random()-.5).slice(0,10);
  quiz={items:shuffled,index:0,score:0,answered:false,finished:false};
  $("nextQuestion").classList.add("hidden");$("restartQuiz").classList.add("hidden");
  renderQuestion();
}
function renderQuestion(){
  if(quiz.index>=quiz.items.length){quiz.finished=true;$("quizProgress").textContent="ROUND COMPLETE";$("quizScore").textContent=`Score: ${quiz.score}/${quiz.items.length}`;$("quizQuestion").textContent="Round complete."; $("quizOptions").innerHTML="";$("quizFeedback").textContent=`You got ${quiz.score} out of ${quiz.items.length}. Every round is practice, not a test.`;$("nextQuestion").classList.add("hidden");$("restartQuiz").classList.remove("hidden");return}
  const item=quiz.items[quiz.index], askNuma=Math.random()<.5;
  quiz.currentDirection=askNuma?"numa":"english";
  $("quizProgress").textContent=`QUESTION ${quiz.index+1} / ${quiz.items.length}`;$("quizScore").textContent=`Score: ${quiz.score}`;
  $("quizQuestion").textContent=askNuma?`What does “${item.word}” mean?`:`Which Numa word means “${item.meaning}”?`;
  const options=[item,...WORDS.filter(w=>w.word!==item.word).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
  $("quizOptions").innerHTML="";
  options.forEach(opt=>{const btn=document.createElement("button");btn.className="quiz-option";btn.textContent=askNuma?opt.meaning:opt.word;btn.addEventListener("click",()=>answerQuestion(btn,opt,item));$("quizOptions").appendChild(btn)});
  $("quizFeedback").textContent="";$("nextQuestion").classList.add("hidden");$("restartQuiz").classList.add("hidden");quiz.answered=false;
}
function answerQuestion(button,chosen,correct){
  if(quiz.answered)return;quiz.answered=true;
  const right=chosen.word===correct.word;
  if(right){quiz.score++;if(!state.known.includes(correct.word))state.known.push(correct.word);state.lastStudy=new Date().toISOString().slice(0,10);saveState()}
  [...$("quizOptions").children].forEach(b=>{b.disabled=true;const answerText=b.textContent;const correctText=quiz.currentDirection==="numa"?correct.meaning:correct.word;if(answerText===correctText)b.classList.add("correct")});
  if(!right)button.classList.add("wrong");
  $("quizFeedback").textContent=right?"Correct — nicely remembered.":`Not quite. ${correct.word} means “${correct.meaning}.”`;
  $("quizScore").textContent=`Score: ${quiz.score}`;$("nextQuestion").classList.remove("hidden");
}
$("nextQuestion").addEventListener("click",()=>{quiz.index++;renderQuestion()});
$("restartQuiz").addEventListener("click",startQuiz);

function renderDictionary(){
  const q=$("dictionarySearch").value.trim().toLocaleLowerCase();
  const filtered=WORDS.filter(w=>`${w.word} ${w.meaning} ${w.note}`.toLocaleLowerCase().includes(q));
  $("dictionaryResults").textContent=`${filtered.length} ${filtered.length===1?"word":"words"}`;
  $("dictionaryList").innerHTML=filtered.map(w=>`<article class="dictionary-item"><div class="dictionary-word">${escapeHtml(w.word)}</div><div class="dictionary-definition">${escapeHtml(w.meaning)}<small>${escapeHtml(w.note)}</small></div>${state.known.includes(w.word)?'<span class="status-pill">Mastered</span>':''}</article>`).join("")||'<div class="panel muted">No matching words. Try another search.</div>';
}
$("dictionarySearch").addEventListener("input",renderDictionary);
$("clearSearch").addEventListener("click",()=>{$("dictionarySearch").value="";renderDictionary();$("dictionarySearch").focus()});
$("exportProgress").addEventListener("click",()=>{
  const payload={app:"Numa Learning",version:1,exportedAt:new Date().toISOString(),progress:state};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="numa-progress.json";a.click();URL.revokeObjectURL(url);toast("Progress export created.");
});
$("resetProgress").addEventListener("click",()=>{
  if(confirm("Reset all saved Numa study progress on this device? Your dictionary will not be deleted.")){state=defaultState();saveState();renderDaily();renderDictionary();toast("Study progress reset.")}
});
renderProgress();renderDaily();renderCard();renderDictionary();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("installButton").classList.remove("hidden")});
$("installButton").addEventListener("click",async()=>{if(!installPrompt){toast("Use your browser menu and choose “Install app” or “Add to Home screen.”");return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installButton").classList.add("hidden")});
window.addEventListener("appinstalled",()=>toast("Numa is installed on your device."));
