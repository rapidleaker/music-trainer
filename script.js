const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 30;

/*
 * 五線譜の位置：
 * 上から 65, 90, 115, 140, 165
 * 1つの音程（線→間、間→線）は 12.5px。
 *
 * 音符の中心 noteY を唯一の基準値にし、
 * 黒丸の cy と棒の接続点 y1 を同じ noteY から計算する。
 * これがVer.1.1での位置ズレ修正ポイント。
 */
const notes = [
  { name: "ド", pitch: "C4", y: 190 },
  { name: "レ", pitch: "D4", y: 177.5 },
  { name: "ミ", pitch: "E4", y: 165 },
  { name: "ファ", pitch: "F4", y: 152.5 },
  { name: "ソ", pitch: "G4", y: 140 },
  { name: "ラ", pitch: "A4", y: 127.5 },
  { name: "シ", pitch: "B4", y: 115 },
  { name: "ド", pitch: "C5", y: 102.5 },
  { name: "レ", pitch: "D5", y: 90 },
  { name: "ミ", pitch: "E5", y: 77.5 }
];

let currentNote;
let questionCount = 0;
let correctCount = 0;
let score = 0;
let combo = 0;
let bestCombo = 0;
let level = 1;
let timeLeft = TIME_LIMIT;
let timerId = null;
let answered = false;

const noteHead = document.getElementById("noteHead");
const stem = document.getElementById("stem");
const ledgerLines = document.getElementById("ledgerLines");
const answerButtons = [...document.querySelectorAll("#answers button")];
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("nextButton");

function randomNote() {
  return notes[Math.floor(Math.random() * notes.length)];
}

function drawNote(note) {
  const noteY = note.y;

  // 黒丸の「中心」を noteY にする。
  noteHead.setAttribute("cx", "485");
  noteHead.setAttribute("cy", String(noteY));

  // 棒は黒丸の右端から真上へ。
  stem.setAttribute("x1", "502");
  stem.setAttribute("x2", "502");
  stem.setAttribute("y1", String(noteY));
  stem.setAttribute("y2", String(noteY - 65));

  ledgerLines.innerHTML = "";

  // 低いド（第5線より下）の加線
  if (noteY >= 190) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "455");
    line.setAttribute("x2", "515");
    line.setAttribute("y1", "190");
    line.setAttribute("y2", "190");
    ledgerLines.appendChild(line);
  }
}

function updateUI() {
  document.getElementById("questionNumber").textContent =
    Math.min(questionCount + 1, TOTAL_QUESTIONS);
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("answeredCount").textContent = questionCount;
  document.getElementById("accuracy").textContent =
    questionCount ? Math.round(correctCount / questionCount * 100) + "%" : "0%";
  document.getElementById("combo").textContent = combo;
  document.getElementById("bestCombo").textContent = bestCombo;
  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;
  document.getElementById("timer").textContent = timeLeft;
}

function updateLevel() {
  level = Math.max(1, Math.floor(score / 300) + 1);
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_LIMIT;
  updateUI();

  timerId = setInterval(() => {
    if (answered) return;

    timeLeft -= 1;
    updateUI();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      answer(null);
    }
  }, 1000);
}

function newQuestion() {
  if (questionCount >= TOTAL_QUESTIONS) {
    finish();
    return;
  }

  currentNote = randomNote();
  answered = false;

  drawNote(currentNote);
  feedback.textContent = "";
  feedback.className = "feedback";
  nextButton.disabled = true;

  answerButtons.forEach(button => {
    button.disabled = false;
    button.classList.remove("correct", "wrong");
  });

  updateUI();
  startTimer();
}

function answer(selectedNote) {
  if (answered) return;

  answered = true;
  clearInterval(timerId);
  answerButtons.forEach(button => button.disabled = true);

  const correct = selectedNote === currentNote.name;

  if (correct) {
    correctCount++;
    combo++;
    bestCombo = Math.max(bestCombo, combo);

    // 基本点100 + 連続正解ボーナス + 残り時間ボーナス
    score += 100 + Math.min(combo - 1, 10) * 20 + Math.max(0, timeLeft) * 2;

    feedback.textContent = combo >= 3
      ? `正解！ 🔥 ${combo} COMBO!`
      : "正解！";
    feedback.className = "feedback correct-text";

    const selectedButton = answerButtons.find(
      button => button.dataset.note === selectedNote
    );
    if (selectedButton) selectedButton.classList.add("correct");
  } else {
    combo = 0;

    feedback.textContent = selectedNote === null
      ? `時間切れ！ 正解は「${currentNote.name}」`
      : `不正解。正解は「${currentNote.name}」`;
    feedback.className = "feedback wrong-text";

    const selectedButton = answerButtons.find(
      button => button.dataset.note === selectedNote
    );
    if (selectedButton) selectedButton.classList.add("wrong");

    const correctButton = answerButtons.find(
      button => button.dataset.note === currentNote.name
    );
    if (correctButton) correctButton.classList.add("correct");
  }

  updateLevel();
  updateUI();
  nextButton.disabled = false;
}

function finish() {
  clearInterval(timerId);
  document.getElementById("quizCard").classList.add("hidden");
  document.getElementById("resultCard").classList.remove("hidden");

  const accuracy = Math.round(correctCount / TOTAL_QUESTIONS * 100);
  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalCorrect").textContent = correctCount;
  document.getElementById("finalAccuracy").textContent = accuracy + "%";

  let message = "まずは五線譜を見ることに慣れていきましょう。";
  if (accuracy === 100) message = "完璧です！素晴らしいです！ 🎉";
  else if (accuracy >= 80) message = "かなり良いです！この調子で反復しましょう。";
  else if (accuracy >= 60) message = "順調です。繰り返すほど音名を素早く判断できるようになります。";

  document.getElementById("resultMessage").textContent = message;
}

function restart() {
  clearInterval(timerId);
  questionCount = 0;
  correctCount = 0;
  score = 0;
  combo = 0;
  bestCombo = 0;
  level = 1;

  document.getElementById("resultCard").classList.add("hidden");
  document.getElementById("quizCard").classList.remove("hidden");

  newQuestion();
}

answerButtons.forEach(button => {
  button.addEventListener("click", () => answer(button.dataset.note));
});

nextButton.addEventListener("click", newQuestion);

document.getElementById("giveUpButton").addEventListener("click", () => {
  if (!answered && confirm("トレーニングを終了しますか？")) {
    finish();
  }
});

document.getElementById("restartButton").addEventListener("click", restart);

updateUI();
newQuestion();
