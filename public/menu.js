function openKahoot() {
  document.getElementById("kahootFrame").style.display = "block";
}

function startTimer(ms) {
  const timerEl = document.getElementById("timer");

  if (ms === "infinite") {
    timerEl.textContent = "99:99";
    return;
  }

  let time = Math.floor(ms / 1000);

  const interval = setInterval(() => {
    const mins = String(Math.floor(time / 60)).padStart(2, '0');
    const secs = String(time % 60).padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;

    if (time <= 0) {
      clearInterval(interval);
      timerEl.textContent = "00:00";
    }

    time--;
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  startTimer(window.SERVER_TIME_LEFT);
});
