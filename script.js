"use strict";

const $ = id => document.getElementById(id);
const screens = ["home","noteSetup","noteGame","rhythmSetup","rhythmGame","result"];
let lastMode = "note";

function show(id) {
  screens.forEach(s => $(s).classList.toggle("hidden", s !== id));
  window.scrollTo(0,0);
}
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".backHome").forEach(function (button) {
    button.addEventListener("click", function () {
      show("home");
    });
  });

  document.getElementById("noteMode").addEventListener("click", function () {
    show("noteSetup");
  });

  document.getElementById("rhythmMode").addEventListener("click", function () {
    show("rhythmSetup");
  });
});

/* 音名データ
   step=0を中央ドとし、五線譜の一番下の線「ミ」から
   9音上がった位置に中央ドを配置します。
*/
const notes = [
  {name:"ラ", octave:2, step:-5},
  {name:"シ", octave:2, step:-4},
  {name:"ド", octave:3, step:-3},
  {name:"レ", octave:3, step:-2},
  {name:"ミ", octave:3, step:-1},
  {name:"ファ",octave:3, step:0},
  {name:"ソ", octave:3, step:1},
  {name:"ラ", octave:3, step:2},
  {name:"シ", octave:3, step:3},
  {name:"ド", octave:4, step:4},
  {name:"レ", octave:4, step:5},
  {name:"ミ", octave:4, step:6},
  {name:"ファ",octave:4, step:7},
  {name:"ソ", octave:4, step:8},
  {name:"ラ", octave:4, step:9},
  {name:"シ", octave:4, step:10},
  {name:"ド", octave:5, step:11},
  {name:"レ", octave:5, step:12},
  {name:"ミ", octave:5, step:13},
  {name:"ファ",octave:5, step:14},
  {name:"ソ", octave:5, step:15}
];
const noteLabels = ["ド","レ","ミ","ファ","ソ","ラ","シ"];
const ranges = {
  beginner:[2,8], intermediate:[2,11], advanced:[0,13]
};
let noteState = {};

notes.forEach((n,i) => {
  const text = `${n.name}${n.octave}`;
  $("customMin").add(new Option(text,i));
  $("customMax").add(new Option(text,i));
});
$("customMin").value = 2;
$("customMax").value = 8;
$("noteRange").onchange = () =>
  $("customRange").classList.toggle("hidden",$("noteRange").value !== "custom");

function drawStaff(svgId, note) {
  const svg = $(svgId);
  svg.innerHTML = "";
  const ns = "http://www.w3.org/2000/svg";
  const line = (x1,y1,x2,y2,w=2) => {
    const e=document.createElementNS(ns,"line");
    e.setAttribute("x1",x1); e.setAttribute("y1",y1);
    e.setAttribute("x2",x2); e.setAttribute("y2",y2);
    e.setAttribute("stroke","#102a43"); e.setAttribute("stroke-width",w);
    svg.appendChild(e);
  };
  const text = (x,y,t,size) => {
    const e=document.createElementNS(ns,"text");
    e.setAttribute("x",x); e.setAttribute("y",y);
    e.setAttribute("font-size",size); e.setAttribute("fill","#102a43");
    e.textContent=t; svg.appendChild(e);
  };
  const baseY=150, gap=14, x=340, y=baseY-note.step*gap/2;
  for(let i=0;i<5;i++) line(70,baseY-i*gap,530,baseY-i*gap);
  text(92,baseY-22,"𝄞",75);

  for(let s=-1;s<=15;s++) {
    if(s < 0 || s > 8) {
      const cy=baseY-s*gap/2;
      if(Math.abs(s)%2===0 || s===-1) line(x-25,cy,x+25,cy);
    }
  }
  const head=document.createElementNS(ns,"ellipse");
  head.setAttribute("cx",x); head.setAttribute("cy",y);
  head.setAttribute("rx",13); head.setAttribute("ry",9);
  head.setAttribute("fill","#102a43"); head.setAttribute("transform",`rotate(-18 ${x} ${y})`);
  svg.appendChild(head);

  if(note.step <= 0) line(x-12,y,x-12,y-62,3);
  else line(x+12,y,x+12,y+62,3);
}

function noteName(n) { return `${n.name}${n.octave}`; }
function startNoteGame() {
  let range = ranges[$("noteRange").value];
  if($("noteRange").value==="custom")
    range = [Number($("customMin").value),Number($("customMax").value)];
  noteState = {min:range[0],max:range[1],q:0,score:0,combo:0,best:0,correct:0,timer:null};
  show("noteGame"); nextNote();
}
$("startNote").onclick = startNoteGame;

function nextNote() {
  clearInterval(noteState.timer);
  if(noteState.q >= 10) return finishNote();
  noteState.q++;
  const index = noteState.min + Math.floor(Math.random()*(noteState.max-noteState.min+1));
  noteState.current = notes[index];
  noteState.left = Number($("noteTime").value);
  $("noteQuestion").textContent=`${noteState.q}/10`;
  $("noteCombo").textContent=noteState.combo;
  $("noteScore").textContent=noteState.score;
  $("noteRemain").textContent=noteState.left;
  drawStaff("staff",noteState.current);
  $("noteMessage").textContent="";
  $("noteChoices").innerHTML="";
  noteLabels.forEach(label => {
    const b=document.createElement("button");
    b.textContent=label; b.onclick=()=>answerNote(label);
    $("noteChoices").appendChild(b);
  });
  noteState.timer=setInterval(()=>{
    noteState.left--;
    $("noteRemain").textContent=noteState.left;
    if(noteState.left<=0) answerNote(null);
  },1000);
}
function answerNote(answer) {
  if(!noteState.current || noteState.lock) return;
  noteState.lock=true; clearInterval(noteState.timer);
  const ok=answer===noteState.current.name;
  if(ok) {
    noteState.correct++; noteState.combo++;
    noteState.best=Math.max(noteState.best,noteState.combo);
    noteState.score+=100+noteState.combo*10;
    $("noteMessage").textContent="正解！";
  } else {
    noteState.combo=0;
    $("noteMessage").textContent=answer===null?"時間切れ":"不正解";
  }
  $("noteCombo").textContent=noteState.combo;
  $("noteScore").textContent=noteState.score;
  setTimeout(()=>{noteState.lock=false; nextNote();},700);
}
function finishNote() {
  const rate=Math.round(noteState.correct/10*100);
  $("resultTitle").textContent="音名トレーニング結果";
  $("resultText").innerHTML=`スコア：<b>${noteState.score}</b><br>正答率：<b>${rate}%</b><br>ベストコンボ：<b>${noteState.best}</b>`;
  lastMode="note"; show("result");
}
$("giveUpNote").onclick=()=>{clearInterval(noteState.timer); finishNote();};

/* リズム */
const durations = {
  quarter:{duration:.25,type:"quarter",label:"タン"},
  half:{duration:.5,type:"half",label:"ターン"},
  eighth:{duration:.125,type:"eighth",label:"タタ"},
  sixteenth:{duration:.0625,type:"sixteenth",label:"タカタカ"}
};
let rhythmState={};

function randomPattern(beats, level) {
  let choices;

  if (level === "beginner") {
    choices = ["quarter", "half"];
  } else if (level === "intermediate") {
    choices = ["quarter", "half", "eighth"];
  } else {
    choices = ["quarter", "half", "eighth", "sixteenth"];
  }

  const result = [];
  let used = 0;

  while (used < beats) {
    const valid = choices.filter(function (key) {
      return durations[key].duration * 4 <= beats - used;
    });

    if (valid.length === 0) {
      valid.push("quarter");
    }

    const randomIndex = Math.floor(Math.random() * valid.length);
    const key = valid[randomIndex];
    const durationData = durations[key];
    const beatLength = durationData.duration * 4;

    result.push({
      duration: durationData.duration,
      type: durationData.type,
      label: durationData.label,
      startBeat: used,
      endBeat: used + beatLength
    });

    used += beatLength;
  }

  return result;
}
function patternId(p){return p.map(x=>x.type).join("-");}
function drawRhythm(pattern) {
  const svg=$("rhythmStaff"), ns="http://www.w3.org/2000/svg";
  svg.innerHTML="";
  const line=(a,b,c,d,w=2)=>{let e=document.createElementNS(ns,"line");
    [["x1",a],["y1",b],["x2",c],["y2",d]].forEach(v=>e.setAttribute(v[0],v[1]));
    e.setAttribute("stroke","#102a43");e.setAttribute("stroke-width",w);svg.appendChild(e)};
  for(let i=0;i<5;i++) line(20,110-i*12,680,110-i*12);
  const width=640/Math.max(1,pattern[pattern.length-1].endBeat);
  pattern.forEach(n=>{
    const x=35+n.startBeat*width+width*n.duration*2;
    const y=86;
    const head=document.createElementNS(ns,"ellipse");
    head.setAttribute("cx",x);head.setAttribute("cy",y);
    head.setAttribute("rx",11);head.setAttribute("ry",8);
    head.setAttribute("transform",`rotate(-18 ${x} ${y})`);
    head.setAttribute("fill",n.type==="half"?"white":"#102a43");
    head.setAttribute("stroke","#102a43");head.setAttribute("stroke-width",2);svg.appendChild(head);
    line(x+9,y,x+9,y-55,3);
    const flags=n.type==="eighth"?1:n.type==="sixteenth"?2:0;
    for(let i=0;i<flags;i++) {
      const yy=y-55+i*12;
      line(x+9,yy,x+31,yy+10,3);
      line(x+31,yy+10,x+31,yy+20,3);
    }
  });
}
function optionText(p){return p.map(x=>x.label).join(" ");}

function startRhythmGame() {
  rhythmState={q:0,score:0,combo:0,best:0,correct:0};
  show("rhythmGame"); nextRhythm();
}
$("startRhythm").onclick=startRhythmGame;

function nextRhythm() {
  if(rhythmState.q>=10) return finishRhythm();
  rhythmState.q++;
  const beats=Number($("meter").value);
  const correct=randomPattern(beats,$("rhythmLevel").value);
  const options=[correct];
  while(options.length<4) {
    const p=randomPattern(beats,$("rhythmLevel").value);
    if(!options.some(x=>patternId(x)===patternId(p))) options.push(p);
  }
  options.sort(()=>Math.random()-.5);
  rhythmState.correctPattern=correct;
  $("rhythmQuestion").textContent=`${rhythmState.q}/10`;
  $("rhythmCombo").textContent=rhythmState.combo;
  $("rhythmScore").textContent=rhythmState.score;
  $("rhythmMessage").textContent="";
  drawRhythm(correct);
  $("rhythmChoices").innerHTML="";
  options.forEach(p=>{
    const b=document.createElement("button");
    b.textContent=optionText(p);
    b.onclick=()=>answerRhythm(p);
    $("rhythmChoices").appendChild(b);
  });
}
function answerRhythm(p) {
  if(rhythmState.lock)return;
  rhythmState.lock=true;
  const ok=patternId(p)===patternId(rhythmState.correctPattern);
  if(ok){rhythmState.correct++;rhythmState.combo++;rhythmState.best=Math.max(rhythmState.best,rhythmState.combo);rhythmState.score+=100+rhythmState.combo*10; $("rhythmMessage").textContent="正解！";}
  else {rhythmState.combo=0;$("rhythmMessage").textContent="不正解　正解："+optionText(rhythmState.correctPattern);}
  $("rhythmCombo").textContent=rhythmState.combo;
  $("rhythmScore").textContent=rhythmState.score;
  setTimeout(()=>{rhythmState.lock=false;nextRhythm();},1000);
}
function finishRhythm() {
  $("resultTitle").textContent="リズムトレーニング結果";
  $("resultText").innerHTML=`スコア：<b>${rhythmState.score}</b><br>正答率：<b>${rhythmState.correct*10}%</b><br>ベストコンボ：<b>${rhythmState.best}</b>`;
  lastMode="rhythm";show("result");
}
$("giveUpRhythm").onclick=finishRhythm;
$("restart").onclick=()=>show(lastMode==="note"?"noteSetup":"rhythmSetup");

/* タップ練習 */
let tapTimer=null;
$("startTap").onclick=()=>{
  $("startTap").disabled=true;$("tapResult").textContent="";
  let count=3;
  $("countdown").textContent=count;
  tapTimer=setInterval(()=>{
    count--;
    $("countdown").textContent=count>0?count:"START!";
    if(count===0){clearInterval(tapTimer);beginTap();}
  },700);
};
function beginTap() {
  const p=rhythmState.correctPattern,bpm=120,beatMs=60000/bpm;
  rhythmState.tap={start:performance.now(),targets:p.map(n=>({...n,done:false})),result:{perfect:0,great:0,good:0,miss:0}};
  $("tapButton").classList.remove("hidden");
  rhythmState.tap.end=setTimeout(endTap,p[p.length-1].endBeat*beatMs+500);
}
$("tapButton").onpointerdown=e=>{
  e.preventDefault();
  const t=rhythmState.tap;if(!t)return;
  const now=performance.now()-t.start;
  let best=null,dist=Infinity;
  t.targets.forEach((x,i)=>{
    if(!x.done){const d=Math.abs(now-x.startBeat*500);if(d<dist){dist=d;best=i;}}
  });
  if(best===null)return;
  const target=t.targets[best];target.done=true;
  const r=t.result;
  if(dist<=50)r.perfect++;
  else if(dist<=100)r.great++;
  else if(dist<=200)r.good++;
  else r.miss++;
  showTapResult(r);
};
function endTap() {
  const t = rhythmState.tap;

  if (!t) {
    return;
  }

  t.targets.forEach(function (x) {
    if (!x.done) {
      x.done = true;
      t.result.miss++;
    }
  });

  showTapResult(t.result);
  $("tapButton").classList.add("hidden");
  $("startTap").disabled = false;
}

function showTapResult(r) {
  const total = r.perfect + r.great + r.good + r.miss;

  const accuracy = total
    ? Math.round(
        (r.perfect + r.great * 0.8 + r.good * 0.5) / total * 100
      )
    : 0;

  $("tapResult").innerHTML =
    "PERFECT " + r.perfect +
    " / GREAT " + r.great +
    " / GOOD " + r.good +
    " / MISS " + r.miss +
    "<br>リズム精度：" + accuracy + "%";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch(function () {});
  });
}
