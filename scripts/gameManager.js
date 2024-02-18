// enums
const Direction = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};

// classes
class Snake {
  constructor(headx, heady) {
    this.headx = headx;
    this.heady = heady;
    this.posx = snakeStartingPosx;
    this.posy = snakeStartingPosy;
    this.lastDir = null;
  }

  MoveLeft() {
    this.posx -= 25;
    this.lastDir = Direction.LEFT;
  }

  MoveRight() {
    this.posx += 25;
    this.lastDir = Direction.RIGHT;
  }

  MoveDown() {
    this.posy += 25;
    this.lastDir = Direction.DOWN;
  }

  MoveUp() {
    this.posy -= 25;
    this.lastDir = Direction.UP;
  }

  GetLength() {
    return document.getElementsByClassName("snakeBody").length;
  }
}

class Apple {
  constructor() {
    this.posx = snake.posx;
    this.posy = snake.posy;
  }

  ReplaceApplePosition() {
    this.posx = Math.floor(Math.random() * (mapWidth / 25)) * 25;
    this.posy = Math.floor(Math.random() * (mapHeight / 25)) * 25;

    if (this.posx === snake.headx && snake.heady === this.posy)
      this.ReplaceApplePosition();

    const bodyEls = document.getElementsByClassName("snakeBody");

    Array.from(bodyEls).forEach((element) => {
      if (element.style.top == this.posy && element.style.left == this.posx)
        this.ReplaceApplePosition();
    });
  }
}

// global variables
const mapRealWidth = 10;
const mapRealHegith = 10;
const mapWidth = mapRealWidth * 25; // do not change
const mapHeight = mapRealHegith * 25; // do n ot chang
const snakeStartingPosx = 100;
const snakeStartingPosy = 100;
const updateInterval = 150; // in miliseconds
let bodyIndexToMove = 0; // do not change
const snakeEl = document.getElementById("snakeHead");
const appleEl = document.getElementById("apple");
let snake = new Snake(snakeStartingPosx, snakeStartingPosy);
let apple = new Apple();
let gameLost = false;
let intervalID;

// functions
Start();

function Start() {
  CreateMap();
  intervalID = setInterval(Update, updateInterval);
}

function Update() {
  // changin functions call order might break the game
  if (gameLost) {
    clearInterval(intervalID);
    GameOver();
    return;
  }
  MoveBodyPart();
  MoveSnakeHead();
  SetSnakePosition();
  UpdateApplePosition();
  CheckCollisions();
  DisplayScore();
}

function CreateMap() {
  const map = document.getElementById("map");
  map.style.width = mapWidth.toString() + "px";
  map.style.height = mapHeight.toString() + "px";

  // set username
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const name = urlParams.get("username");
  const usernameEl = document.getElementById("username");
  usernameEl.innerHTML = `User: ${name}`;

  //set high score
  const highScoreEl = document.getElementById("highScore");
  if (localStorage.getItem("highScore") === null) {
    highScoreEl.innerHTML = `high score: 0`;
  } else {
    highScoreEl.innerHTML = `high score: ${localStorage.getItem("highScore")}`;
  }
}

function SetSnakePosition() {
  snakeEl.style.top = snake.posy.toString() + "px";
  snakeEl.style.left = snake.posx.toString() + "px";
}

function MoveSnakeHead() {
  switch (snake.dir) {
    case Direction.DOWN:
      snake.MoveDown();
      snakeEl.style.transform = "rotateZ(180deg)";
      break;
    case Direction.RIGHT:
      snake.MoveRight();
      snakeEl.style.transform = "rotateZ(90deg)";
      break;
    case Direction.UP:
      snake.MoveUp();
      snakeEl.style.transform = "rotateZ(0deg)";
      break;
    case Direction.LEFT:
      snake.MoveLeft();
      snakeEl.style.transform = "rotateZ(-90deg)";
      break;
  }
}

function UpdateApplePosition() {
  if (snake.posx === apple.posx && snake.posy === apple.posy) {
    apple.ReplaceApplePosition();
    ExtandSnake();
  }

  appleEl.style.left = apple.posx.toString() + "px";
  appleEl.style.top = apple.posy.toString() + "px";
}

function MoveBodyPart() {
  const bodyEls = document.getElementsByClassName("snakeBody");
  bodyEls[bodyIndexToMove].style.left = snake.posx.toString() + "px";
  bodyEls[bodyIndexToMove].style.top = snake.posy.toString() + "px";

  if (bodyIndexToMove == bodyEls.length - 1) bodyIndexToMove = 0;
  else bodyIndexToMove++;
}

function ExtandSnake() {
  bodyEl = document.createElement("div");
  bodyEl.classList.add("snakeBody");
  bodyEl.style.left = -400 + "px";
  const map = document.getElementById("map");
  map.appendChild(bodyEl);
}

function CheckCollisions() {
  CheckWallCollisions();
  if (document.getElementsByClassName("snakeBody").length > 3)
    CheckSnakeCollision();

  function CheckWallCollisions() {
    if (snake.posx == -25 || snake.posx == mapWidth) gameLost = true;
    if (snake.posy == -25 || snake.posy == mapHeight) gameLost = true;
  }

  function CheckSnakeCollision() {
    const bodyEls = document.getElementsByClassName("snakeBody");
    Array.from(bodyEls).forEach((element) => {
      if (
        snake.posx == parseInt(element.style.left) &&
        snake.posy == parseInt(element.style.top)
      ) {
        gameLost = true;
      }
    });
  }
}

function GetScore() {
  let score = snake.GetLength() - 2;
  if (score < 0) score = 0;

  return score;
}

function DisplayScore() {
  let score = GetScore();

  scoreEl = document.getElementById("score");
  scoreEl.innerHTML = `score: ${score}`;
}

function GameOver() {
  if (
    localStorage.getItem("highScore") === null ||
    GetScore() > localStorage.getItem("highScore")
  ) {
    localStorage.setItem("highScore", GetScore());
    const highScoreEl = document.getElementById("highScore");
    highScoreEl.innerHTML = `high score: ${localStorage.getItem("highScore")}`;
  }

  const gameOverEl = document.createElement("div");
  gameOverEl.innerHTML = `
    <h1 class="gameOverText">Game Lost</h1>
    <button onclick="location.reload()">Retry</button>
  `;
  gameOverEl.classList.add("gameOverScreen");

  //
}

// events
document.addEventListener("keydown", function (event) {
  if (event.keyCode === 40) {
    // down arrow
    if (snake.lastDir != Direction.UP) snake.dir = Direction.DOWN;
  } else if (event.keyCode === 39) {
    // right arrow
    if (snake.lastDir != Direction.LEFT) snake.dir = Direction.RIGHT;
  } else if (event.keyCode === 37) {
    // left arrow
    if (snake.lastDir != Direction.RIGHT) snake.dir = Direction.LEFT;
  } else if (event.keyCode === 38) {
    // up arrow
    if (snake.lastDir != Direction.DOWN) snake.dir = Direction.UP;
  }
});
