document.getElementById("kahootBtn").addEventListener("click", () => {
  document.getElementById("kahootFrame").classList.add("show");
});

// Timer logic
let countdown = 60 * 60;
let timerDisplay = document.getElementById("timer");
let timer = setInterval(function() {
  let minutes = Math.floor(countdown / 60);
  let seconds = countdown % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  countdown--;

  if (countdown < 0) {
    clearInterval(timer);
  }
}, 1000);
