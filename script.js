const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const enemy = document.getElementById("enemy");
const powerUp = document.getElementById("powerUp");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const jumpBtn = document.getElementById("jumpBtn");
const pauseBtn = document.getElementById("pauseBtn");
const bgMusic = document.getElementById("bgMusic");
const leaderboard = document.getElementById("topScores");

let score = 0;
let level = 1;
let isJumping = false;
let isPaused = false;
let gameLoop;

let touchStartY = 0;
let touchEndY = 0;

function updateLeaderboard(newScore) {
  let scores = JSON.parse(localStorage.getItem("topScores")) || [];
  scores.push(newScore);
  scores.sort((a, b) => b - a);
  scores = scores.slice(0, 5);
  localStorage.setItem("topScores", JSON.stringify(scores));
  leaderboard.innerHTML = scores.map(s => `<li>${s}</li>`).join("");
}
updateLeaderboard(0);

function jump() {
  if (isJumping || isPaused) return;
  isJumping = true;
  player.classList.add("jump");
  setTimeout(() => {
    player.classList.remove("jump");
    isJumping = false;
  }, 500);
}

document.addEventListener("keydown", e => {
  if (e.code === "ArrowUp") jump();
});
jumpBtn.addEventListener("click", jump);

document.addEventListener("touchstart", e => {
  touchStartY = e.changedTouches[0].screenY;
});
document.addEventListener("touchend", e => {
  touchEndY = e.changedTouches[0].screenY;
  if (touchStartY - touchEndY > 50) jump();
});

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.innerText = isPaused ? "▶️ Resume" : "⏸️ Pause";
  if (isPaused) {
    clearInterval(gameLoop);
    obstacle.style.animationPlayState = "paused";
    enemy.style.animationPlayState = "paused";
    powerUp.style.animationPlayState = "paused";
  } else {
    startGameLoop();
    obstacle.style.animationPlayState = "running";
    enemy.style.animationPlayState = "running";
    powerUp.style.animationPlayState = "running";
  }
});

function startGameLoop() {
  gameLoop = setInterval(() => {
    if (isPaused) return;

    let playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));
    let obsLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left"));
    let enemyLeft = parseInt(window.getComputedStyle(enemy).getPropertyValue("left"));
    let powerLeft = parseInt(window.getComputedStyle(powerUp).getPropertyValue("left"));

    if ((obsLeft < 130 && obsLeft > 80 && playerBottom < 50) ||
        (enemyLeft < 130 && enemyLeft > 80 && playerBottom < 120)) {
      alert("Game Over! Final Score: " + score);
      updateLeaderboard(score);
      score = 0;
      level = 1;
      levelDisplay.innerText = "Level: 1";
      scoreDisplay.innerText = "Score: 0";
      obstacle.style.animationDuration = "2s";
      enemy.style.animationDuration = "3s";
    } else {
      score++;
      scoreDisplay.innerText = "Score: " + score;

      if (powerLeft < 130 && powerLeft > 80 && playerBottom > 100) {
        score += 10;
        powerUp.style.animation = "none";
        setTimeout(() => {
          powerUp.style.animation = "moveObs 4s linear infinite";
        }, 100);
      }

      if (score % 50 === 0) {
        level++;
        levelDisplay.innerText = "Level: " + level;
        obstacle.style.animationDuration = Math.max(0.8, 2 - level * 0.1) + "s";
        enemy.style.animationDuration = Math.max(1, 3 - level * 0.1) + "s";
      }
    }
  }, 100);
}
startGameLoop();

document.body.addEventListener("click", () => {
  bgMusic.play();
}, { once: true });
