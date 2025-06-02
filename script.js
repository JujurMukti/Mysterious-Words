const wordSubmitted = document.getElementById('word-submitted');
const gameTimerDisplay = document.getElementById('game-timer');
const countdownElement = document.getElementById('countdown');
const inputView = document.getElementById("input-view");
const inputMode = document.getElementById("input-mode");
const keyboard = document.getElementById("keyboard");
const firstRow = document.getElementById("row1");
const secondRow = document.getElementById("row2");
const thirdRow = document.getElementById("row3");
const team = document.querySelectorAll('.team h2');

const soundTyping = document.getElementById("sound-typing");
const soundCountdown = document.getElementById("sound-countdown");
const soundWrong = document.getElementById('sound-wrong');
const soundCorrect = document.getElementById('sound-correct');
const soundAttention = document.getElementById('sound-attention');

let gameTime = 900;
let correctWord = 0;
let keyLayout = 0;
let wordList = [];
let start = false;
let isCountingDown = false;
let gameActive = false;
let valid = false;
let endgame = false;
let editorMode = false;
let countdownInterval = null;
let teamName = team[0].textContent;
let isRed = false;
let inputBuffer = "";
let mode = "code";
let getWords = [];
let submittedWords = [];
let activeLetters = [];
let codeOpened = { AIBMNKRP: 0, UETWH: 0, OYL: 0 };
let positions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 18, 19, 24, 25, 26];
let letterPositions = ["W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "H", "K", "L", "B", "N", "M"];

const letterGroups = {
  group1: ["A", "I", "B", "M", "N", "K", "R", "P"],
  group2: ["U", "E", "T", "W", "H"],
  group3: ["O", "Y", "L"]
};

const codeMap = {
  12: letterGroups.group1,
  BMR742: letterGroups.group1,
  13: letterGroups.group2,
  U2ETWH: letterGroups.group2,
  14: letterGroups.group3,
  YOLO55: letterGroups.group3
};

function updateTimers() {
  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;
  gameTimerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (isRed && gameTime === 719) {
    isRed = false;
    gameTimerDisplay.style.color = '#fff';
    setTimeout(() => playSound(soundAttention), 1000);
  }
}

function resetGame() {
  gameTime = 900;
  correctWord = 0;
  updateTimers();
  inputBuffer = "";
  mode = "code";
  teamName = team.textContent;
  inputMode.textContent = "MODE: CODE";
  inputView.textContent = "";
  wordSubmitted.textContent = "WORD SUBMITTED: 0";
  submittedWords = [];
  document.querySelectorAll('.key-button').forEach(btn => {
    btn.disabled = true;
  });
  activeLetters = [];
  start = false;
  isCountingDown = false;
  gameActive = false;
  valid = false;
  endgame = false;
  editorMode = false;
  isRed = false;
  gameTimerDisplay.style.color = '#fff';
  team.forEach((list) => list.textContent = `TEAM'S NAME`);
  countdownInterval = null;
  codeOpened = { AIBMNKRP: 0, UETWH: 0, OYL: 0 };
}

function startCountdown(text) {
  if (isCountingDown) return;
  playSound(soundCountdown);
  isCountingDown = true;

  let count = 3;
  countdownElement.style.display = 'block';
  countdownElement.style.opacity = '1';
  countdownElement.textContent = count;

  countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownElement.textContent = count;
    } else if (count === 0) {
      countdownElement.textContent = text;
      if (text === 'START!') {
        gameTime--;
        updateTimers();
      }

      if (text === 'GAME OVER!') {
        console.log(`Jumlah jawaban benar: ${correctWord}`);
        console.log(`Jumlah kata yang dimasukkan: ${submittedWords.length}`);
        console.log(`Kode "AIBMNKRP": ${codeOpened['AIBMNKRP']}`);
        console.log(`Kode "UETWH": ${codeOpened['UETWH']}`);
        console.log(`Kode "OYL": ${codeOpened['OYL']}`);
        inputView.textContent = ""; 
        gameActive = false;
        endgame = true;
        return;
      } 
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;
      countdownElement.style.opacity = '0';
      setTimeout(() => {
        countdownElement.style.display = 'none';
      }, 500);
      isCountingDown = false;
      if (text === 'START!') {
        gameActive = true;
      }
    }
  }, 1000);
}

function playSound(sound) {
  sound.pause();
  sound.currentTime = 0;
  sound.volume = 0.5;
  sound.play();
}

function updateKeyboard() {
  for (i = 0; i < getWords.length; i++) {
    const button = document.getElementById(`key-${getWords[i]}`)
    button.disabled = false;
    button.classList.add("valid");
    setTimeout(() => {
      button.classList.remove("valid");
    }, 300);
  }
  getWords = [];
}

function renderKeyboard() {
  for (let i = 1; i <= 10; i++) {
    const button = document.createElement('button');
    button.classList.add("key-button");
    button.disabled = true;
    if (positions.includes(i)) {
      button.textContent = letterPositions[keyLayout];
      button.id = `key-${letterPositions[keyLayout]}`;
      keyLayout++;
    }
    firstRow.appendChild(button);
  }
  for (let i = 11; i <= 19; i++) {
    const button = document.createElement('button');
    button.classList.add("key-button");
    button.disabled = true;
    if (positions.includes(i)) {
      button.textContent = letterPositions[keyLayout];
      button.id = `key-${letterPositions[keyLayout]}`;
      keyLayout++;
    }
    secondRow.appendChild(button);
  }
  for (let i = 20; i <= 26; i++) {
    const button = document.createElement('button');
    button.classList.add("key-button");
    button.disabled = true;
    if (positions.includes(i)) {
      button.textContent = letterPositions[keyLayout];
      button.id = `key-${letterPositions[keyLayout]}`;
      keyLayout++;
    }
    thirdRow.appendChild(button);
  }
}

function handleSubmit() {
  const input = inputBuffer.toUpperCase();
  if (mode === "code") {
    if (codeMap[input]) {
      codeMap[input].forEach(letter => activeLetters.push(letter));
      codeMap[input].forEach(letter => getWords.push(letter));
      codeOpened[codeMap[input].join('')] = 1;
      playSound(soundCorrect);
      updateKeyboard();
    } else {
      playSound(soundWrong);
      document.querySelectorAll('.key-button').forEach(btn => {
        btn.classList.add("pressed-false");
        setTimeout(() => btn.classList.remove("pressed-false"), 300);
      });
    }
  } else {
    if (input.length > 0) {
      if (wordList.includes(input.toLowerCase()) && !submittedWords.includes(input)) correctWord++;
      submittedWords.push(input);
      wordSubmitted.textContent = `WORD SUBMITTED: ${submittedWords.length}`;
    }
  }
  inputBuffer = "";
  inputView.textContent = "";
}

document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      soundCountdown.pause();
      soundCountdown.currentTime = 0;
      countdownInterval = null;
    }
    isCountingDown = false;
    countdownElement.style.opacity = '0';
    countdownElement.style.display = 'none';
    resetGame();
    return;
  }

  if (e.code === 'Space') {
    if (endgame) return;

    if (!gameActive) {
      if (editorMode) {
        if (!teamName.endsWith(' ')) teamName += ' ';
      } else if (!isCountingDown) startCountdown('START!');
    } else if (!isRed) {
      if (mode === "code") {
        mode = "word";
        inputView.style.color = '#83b157';
        inputView.style.border = '2px dashed #83b157';
        inputMode.innerHTML = `<div id="input-mode">MODE: <strong style="color:#83b157">${mode.toUpperCase()}</strong></div>`;
      } else {
        mode = "code"
        inputView.style.color = '#000';
        inputView.style.border = '2px dashed #000';
        inputMode.innerHTML = `<div id="input-mode">MODE: <strong style="color:#000">${mode.toUpperCase()}</strong></div>`;
      }
      inputBuffer = "";
      inputView.textContent = "";
    }
    e.preventDefault();
    return;
  }

  if (e.key === 'Shift') { 
    if (!gameActive) {
      if (editorMode) {
        editorMode = false;
        wordSubmitted.textContent = "WORD SUBMITTED: 0";
      } else {
        editorMode = true;
        teamName = '';
        wordSubmitted.textContent = "EDITOR MODE";
    }
    }
  }

  if (e.key === 'Control') {
    if (!gameActive && editorMode) {
      isRed = !isRed;
      gameTimerDisplay.style.color = isRed ? '#fd6f6f' : '#fff';
    }
  }

  if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
    if (!gameActive) {
      if (editorMode) {
        teamName += e.key.toUpperCase();
        team.forEach((list) => list.textContent = teamName);
      }
    } else if (!isRed) {
      if (mode === 'word' && inputBuffer.length < 40) {
        const button = document.getElementById(`key-${e.key.toUpperCase()}`);
      if (button) {
        if (activeLetters.includes(e.key.toUpperCase())) {
          inputBuffer += e.key.toUpperCase();
          inputView.textContent = inputBuffer; 
          playSound(soundTyping); 
          button.classList.add("pressed");
          setTimeout(() => button.classList.remove("pressed"), 100);
        } else {
          playSound(soundTyping); 
          playSound(soundWrong);
          button.classList.add("pressed-false");
          setTimeout(() => button.classList.remove("pressed-false"), 100);
        }
       } 
      } else if (inputBuffer.length < 40) {
       inputBuffer += e.key.toUpperCase();
       inputView.textContent = inputBuffer;
       playSound(soundTyping); 
      }
    }
  }

  if (e.key === 'Backspace') {
    if (!gameActive) {
      if (editorMode) {
        teamName = teamName.slice(0, -1);
        team.forEach((list) => list.textContent = teamName);
      }
    } else if (!isRed) {
      if (inputBuffer.length > 0) {
      inputBuffer = inputBuffer.slice(0, -1);
      inputView.textContent = inputBuffer;
      playSound(soundTyping);
    }
    return;
    }
  }

  if (!gameActive) return;

  if (e.key === 'Enter' && !isRed) {
    handleSubmit();
    return;
  }

  if (e.key.length === 1 && e.key.match(/[0-9]/) && !isRed) {
    if (mode === 'code') {
      inputBuffer += e.key.toUpperCase();
      inputView.textContent = inputBuffer;
      playSound(soundTyping);
    }
  }
});

setInterval(() => {
  if (!gameActive) return;
  gameTime--;
  if (gameTime === 3) startCountdown('GAME OVER!');
  if (gameTime === 723 && isRed) startCountdown('ATTENTION!');
  updateTimers();
}, 1000);

function fetchWords() {
  fetch('wordlist.json')
    .then(res => res.json())
    .then(data => {
      wordList = data.words;
    });
}

fetchWords();
updateTimers();
renderKeyboard();
