(function () {
  // ---------- ตัวแปรสถานะเกม ----------
  let secretNumber = null; // เลขลับ (0-100)
  let attempts = 0; // จำนวนครั้งที่ทายแล้ว
  let gameActive = true; // เกมยังไม่จบ (ถ้าทายถูก = false จนกว่ากด new / reset)
  let timerInterval = null; // ตัวจับเวลา
  let startTime = null; // เวลาเริ่มต้น (timestamp ms)
  let isTimerRunning = false; // สถานะนาฬิกาเดินอยู่ไหม

  // DOM elements
  const guessInput = document.getElementById("guessInput");
  const guessBtn = document.getElementById("guessBtn");
  const resetBtn = document.getElementById("resetBtn");
  const newGameBtn = document.getElementById("newGameBtn");
  const attemptSpan = document.getElementById("attemptCount");
  const timerDisplaySpan = document.getElementById("timerDisplay");
  const clueMainSpan = document.getElementById("clueMain");
  const subMessageDiv = document.getElementById("subMessage");

  // ---------- ฟังก์ชันช่วยเหลือ ----------
  function formatTime(seconds) {
    return seconds.toFixed(1);
  }

  function updateAttemptsUI() {
    attemptSpan.innerText = attempts;
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isTimerRunning = false;
  }

  function resetTimerToZero() {
    stopTimer();
    isTimerRunning = false;
    startTime = null;
    timerDisplaySpan.innerText = "0.0";
  }

  function startFreshTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isTimerRunning = false;
    startTime = null;
    timerDisplaySpan.innerText = "0.0";

    if (secretNumber !== null && gameActive === true) {
      startTime = Date.now();
      isTimerRunning = true;
      timerInterval = setInterval(() => {
        if (!isTimerRunning) return;
        if (startTime && gameActive) {
          const elapsed = (Date.now() - startTime) / 1000;
          timerDisplaySpan.innerText = formatTime(elapsed);
        }
      }, 100);
    }
  }

  function initNewGame(randomSecret) {
    stopTimer();
    resetTimerToZero();
    secretNumber = randomSecret;
    attempts = 0;
    gameActive = true;
    updateAttemptsUI();
    guessInput.value = "";
    guessInput.disabled = false;
    guessBtn.disabled = false;
    clueMainSpan.innerHTML = "✨ ทายเลข 0-100 ✨";
    subMessageDiv.innerHTML = "💡 ป้อนตัวเลขแล้วกด 'ทายเลย' รับคำใบ้!";
    startFreshTimer();
    console.log("(Dev) เลขลับใหม่:", secretNumber);
  }

  function resetSameNumber() {
    if (secretNumber === null) {
      const newNum = Math.floor(Math.random() * 101);
      secretNumber = newNum;
    }
    stopTimer();
    resetTimerToZero();
    attempts = 0;
    gameActive = true;
    updateAttemptsUI();
    guessInput.value = "";
    guessInput.disabled = false;
    guessBtn.disabled = false;
    clueMainSpan.innerHTML = "🔄 เริ่มนับใหม่! เลขเดิมเดิม ทายได้เลย";
    subMessageDiv.innerHTML = `เลขลับยังคงเดิม (0-100) ขอให้โชคดี!`;
    startFreshTimer();
    console.log("รีเซ็ตเกมด้วยเลขเดิม:", secretNumber);
  }

  function randomNewGame() {
    const newSecret = Math.floor(Math.random() * 101);
    initNewGame(newSecret);
  }

  function handleGuess() {
    if (!gameActive) {
      clueMainSpan.innerHTML = "🏆 คุณทายถูกแล้ว! 🏆";
      subMessageDiv.innerHTML =
        "🎉 กด 'เล่นใหม่ (เลขเดิม)' หรือ 'สุ่มเลขใหม่' เพื่อเล่นต่อ 🎉";
      return;
    }

    if (secretNumber === null) {
      secretNumber = Math.floor(Math.random() * 101);
      startFreshTimer();
    }

    let rawValue = guessInput.value.trim();
    if (rawValue === "") {
      clueMainSpan.innerHTML = "⚠️ กรุณาใส่ตัวเลขก่อน!";
      subMessageDiv.innerHTML = "🔢 ตัวเลขต้องอยู่ในช่วง 0 ถึง 100 เท่านั้น";
      return;
    }

    const guess = Number(rawValue);
    if (isNaN(guess) || !Number.isInteger(guess) || guess < 0 || guess > 100) {
      clueMainSpan.innerHTML = "❌ ตัวเลขไม่ถูกต้อง ❌";
      subMessageDiv.innerHTML = "ต้องเป็นจำนวนเต็มระหว่าง 0 - 100 เท่านั้น!";
      return;
    }

    attempts++;
    updateAttemptsUI();

    if (guess === secretNumber) {
      gameActive = false;
      stopTimer();
      isTimerRunning = false;
      let finalTime = timerDisplaySpan.innerText;
      clueMainSpan.innerHTML = `🎉🎉 ถูกต้อง! ตัวเลขคือ ${secretNumber} 🎉🎉`;
      subMessageDiv.innerHTML = `✅ คุณทายถูกใน ${attempts} ครั้ง  เวลา ${finalTime} วินาที ✅  กดปุ่มใดก็ได้เพื่อเล่นต่อ`;
      return;
    } else if (guess < secretNumber) {
      clueMainSpan.innerHTML = `📈 น้อยเกินไป! เลขของคุณ ${guess} น้อยกว่าเลขลับ`;
      subMessageDiv.innerHTML = `👉 ลองใส่ตัวเลขที่มากกว่า ${guess} ขึ้นไป (0-100)`;
    } else {
      clueMainSpan.innerHTML = `📉 มากเกินไป! เลขของคุณ ${guess} มากกว่าเลขลับ`;
      subMessageDiv.innerHTML = `👉 ลองใส่ตัวเลขที่น้อยกว่า ${guess} (0-100)`;
    }

    guessInput.value = "";
    guessInput.focus();

    if (gameActive && !isTimerRunning && secretNumber !== null) {
      if (!timerInterval) {
        startFreshTimer();
      }
    }
  }

  function initialGame() {
    const firstSecret = Math.floor(Math.random() * 101);
    secretNumber = firstSecret;
    attempts = 0;
    gameActive = true;
    updateAttemptsUI();
    resetTimerToZero();
    guessInput.value = "";
    clueMainSpan.innerHTML = "🔢 ทายเลข 0-100 ได้เลย! 🔢";
    subMessageDiv.innerHTML =
      "💪 พิมพ์ตัวเลขแล้วกดทายเลย ระบบจะจับเวลาและนับจำนวนครั้ง";
    startFreshTimer();
    console.log("เกมเริ่มต้น เลขลับ:", secretNumber);
  }

  // Event Listeners
  guessBtn.addEventListener("click", () => {
    handleGuess();
  });

  guessInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleGuess();
    }
  });

  resetBtn.addEventListener("click", () => {
    resetSameNumber();
    guessInput.focus();
  });

  newGameBtn.addEventListener("click", () => {
    randomNewGame();
    guessInput.focus();
  });

  guessInput.addEventListener("wheel", (e) => {
    e.preventDefault();
  });

  // เริ่มเกม
  initialGame();
})();