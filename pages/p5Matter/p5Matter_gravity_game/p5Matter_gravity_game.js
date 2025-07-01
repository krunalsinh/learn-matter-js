// module aliases
const {
  Engine, Render, Runner, Bodies, Composite,
  MouseConstraint, Mouse, Events, Body: MatterBody
} = Matter;

let engine, world, grounds = [], fixedWalls = [], targetWalls = [], dividerWall, mConstraint, tileSize = 32, cameraOffsetX = 0;
let player1, playerImg, flagRedImg, flagGreenImg, wallImage, animatedFlagImgGreen, animatedFlagImgRed, pattern;
let boomParticles = [], collideParticles = [], collideParticlesColor = ["#c85256", "#ca4979", "#ba4d9f", "#935dc2", "#406fdc"];
let reached = false;
let gameStartButton = document.querySelector("#startGameButton");
let gameStartPopup = document.querySelector("#gameStartPopup");

let gameRestartButton = document.querySelector("#restartGameButton");
let gameEndPopup = document.querySelector("#gameEndPopup");

let gameWonRestartGameButton = document.querySelector("#gameWonRestartGameButton");
let gameWonPopup = document.querySelector("#gameWonPopup");

const labels = {
  wall: "wall",
  finalWall: "finalWall",
  player: "Player1",
  boomParticle: "boomParticle",
  flagObstacle: "flagObstacle",
  subParticle: "subParticle"
};

const categories = {
  walls: 0x0001,
  boom: 0x0002,
  flag: 0x0003,
  player: 0x0004,
  subParticle: 0x0005
};


//p5 functions
function setup() {
  initSetup();
   noSmooth();
}

function draw() {
  clear();

  push();
  translate(-cameraOffsetX, 0);
  for (let index = 0; index < grounds.length; index++) {
    const element = grounds[index];
    element.show();
  }
  for (let index = 0; index < targetWalls.length; index++) {
    const element = targetWalls[index];
    element.show();
  }
  for (let index = 0; index < fixedWalls.length; index++) {
    const element = fixedWalls[index];
    element.show();
  }
  for (let index = 0; index < boomParticles.length; index++) {
    const element = boomParticles[index];
    element.showBooParticle();
  }
  for (let index = 0; index < collideParticles.length; index++) {
    const element = collideParticles[index];
    element.update();
  }
  dividerWall.show();
  player1.show();
  pop();
  updateCamera();

}

function preload() {
  playerImg = loadImage('../../../common/images/other/box1.png');
  flagRedImg = loadImage('../../../common/images/other/flag-red.png');
  flagGreenImg = loadImage('../../../common/images/other/flag-green.png');
  wallImage = loadImage('../../../common/images/other/wall.png');
  animatedFlagImgGreen = loadImage('../../../common/images/other/flag-img-green.png');
  animatedFlagImgRed = loadImage('../../../common/images/other/flag-img-red.png');
}

function mouseClicked() {
  if (isMobile()) return;
  
  boxPopAction();
}

function touchEnded() {
  if (!isMobile()) return;
  
  boxPopAction();
}

//custom functions


function boxPopAction() {
  const { x: px, y: py } = player1.body.position;
  const distX = px - mouseX;
  const velocityX = distX < 0 ? -5 : 5;
  const angularVelocity = player1.body.angularVelocity + (distX < 0 ? -0.08 : 0.08);

  MatterBody.setVelocity(player1.body, { x: velocityX, y: -10 });
  MatterBody.setAngularVelocity(player1.body, angularVelocity);

  const boomParticleOption = {
    label: labels.boomParticle,
    render: { fillStyle: "#EBB978", strokeStyle: "#EBB978", lineWidth: 0 },
    collisionFilter: { category: categories.boom }
  };

  const boom = new BoomParticle({ x: px, y: py, r: 6, bodyOption: boomParticleOption });
  MatterBody.setVelocity(boom.body, { x: -velocityX, y: 10 });
  boomParticles.push(boom);
}

function initSetup() {
  reached = false;

  createCanvas(innerWidth, innerHeight);
  pattern = createPattern();

  engine = Engine.create();
  world = engine.world;

  initGroundsAndWalls();
  initPlayer();
  initMouse();
  initCollisions();

}

function startGame() {
  Runner.run(Runner.create(), engine);
  loop();
}

function stopGame() {
  noLoop();
  Composite.clear(engine.world, false);
}

function initCollisions() {
  Events.on(engine, 'collisionStart', handleBoomCollision);
  Events.on(engine, 'collisionActive', handleFinalWallCollision);
}

function initMouse() {
  const canvasMouse = Mouse.create(canvas.elt);
  canvasMouse.pixelRatio = pixelDensity();
  mConstraint = MouseConstraint.create(engine, { mouse: canvasMouse });
  Composite.add(world, mConstraint);
}

function initPlayer() {
  const playerOptions = {
    density: 1,
    friction: 0.8,
    restitution: 0.5,
    label: labels.player,
    collisionFilter: { category: categories.player, mask: categories.walls }
  };

  player1 = new Player({ x: 100, y: 50, w: 50, h: 50, bodyOption: playerOptions });
}

function initGroundsAndWalls() {

  const staticOptions = {
    isStatic: true,
    friction: 1,
    restitution: 0,
    label: labels.wall,
    render: { fillStyle: "#abdeed", strokeStyle: "#01368a", lineWidth: 3, },
    collisionFilter: { category: categories.walls }
  };

  const wallOptions = { ...staticOptions, label: labels.wall };

  const finalOptions = { ...staticOptions, label: labels.finalWall };

  const bodyData = [
    { x: width / 2, y: height, w: width, h: tileSize * 2, opt: wallOptions },
    { x: 300, y: 350, w: tileSize * 8, h: tileSize * 3, opt: wallOptions },
    { x: 750, y: 580, w: tileSize * 11, h: tileSize * 4, opt: wallOptions },
    { x: 1500, y: 400, w: tileSize * 3, h: tileSize * 3, opt: wallOptions },
    { x: 1800, y: 500, w: tileSize * 3, h: tileSize * 3, opt: wallOptions },
    { x: 2000, y: 700, w: tileSize * 3, h: tileSize * 3, opt: wallOptions },

  ];

  grounds = bodyData.map(d => new Wall({ x: d.x, y: d.y, w: d.w, h: d.h, bodyOption: d.opt }));


  const targetWallsData = [
    { x: 1200, y: 200, w: tileSize * 9, h: tileSize * 1, opt: finalOptions },
    { x: 2500, y: 200, w: tileSize * 9, h: tileSize * 1, opt: finalOptions },
  ];

  targetWalls = targetWallsData.map(d => new TargetWall({ x: d.x, y: d.y, w: d.w, h: d.h, bodyOption: d.opt }));

  dividerWall = new DividerWall({ x: 2200, y: height / 2 - 50, w: tileSize * 1, h: height + 200, bodyOption: wallOptions });

  const fixedWallsData = [
    { x: 0 - tileSize / 2 + 5, y: height / 2 - 50, w: tileSize, h: height + 150, opt: wallOptions },
    { x: width / 2 - 50, y: 0 - tileSize / 2 - 50, w: width + 150, h: tileSize, opt: wallOptions },
  ]
  fixedWalls = fixedWallsData.map(d => new Wall({ x: d.x, y: d.y, w: d.w, h: d.h, bodyOption: d.opt }));
}

function handleBoomCollision(event) {
  for (const pair of event.pairs) {
    if ([labels.wall, labels.finalWall].includes(pair.bodyA.label) &&
      pair.bodyB.label === labels.boomParticle) {


      boomParticles = boomParticles.filter(particle => {
        if (particle.body.id === pair.bodyB.id) {
          particle.removeFromWorld()
        } else {
          return particle;
        }
      })

      const origin = pair.bodyB.position;

      for (let i = 0; i < 10; i++) {
        const angle = random(TWO_PI);
        const speed = random(2, 4);
        const velocity = { x: cos(angle) * speed, y: sin(angle) * speed };
        const collideParticleColor = collideParticlesColor[Math.floor(random(collideParticlesColor.length))];

        const bodyOption = {
          friction: 0,
          frictionAir: 0.01,
          restitution: 0.9,
          label: labels.subParticle,
          render: { fillStyle: collideParticleColor, strokeStyle: collideParticleColor, lineWidth: 0 },
          collisionFilter: { category: categories.boom }
        };

        const particle = new CollideParticle({ x: origin.x, y: origin.y, r: 3, bodyOption });
        MatterBody.setVelocity(particle.body, velocity);
        collideParticles.push(particle);
      }
    }
  }
}

function handleFinalWallCollision(event) {
  for (const pair of event.pairs) {
    
    if (pair.bodyA.label === labels.finalWall && pair.bodyB.label === labels.player) {
      console.log(pair);
      if (pair.bodyB.velocity.x === 0 && pair.bodyB.velocity.y < 1.2) {

        // targetWalls.forEach(w => {
        //   if (w.body.id === pair.bodyA.id && !w.checked) w.checked = true;
        // });

        for (let index = 0; index < targetWalls.length; index++) {
          const w = targetWalls[index];
          if (w.body.id === pair.bodyA.id && !w.checked) w.checked = true;
        }

        if (targetWalls.every(w => w.checked) && !reached) {
          startConfetti();
          reached = true;
          stopGame();
          gameWonPopup.classList.add("show");
        }
      }
    }
  }
}



function startConfetti() {
  const duration = 5000;
  const end = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const interval = setInterval(() => {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: random() - 0.2 } });
  }, 250);
}



function updateCamera() {
  const threshold = width / 2;
  const playerX = player1.body.position.x;
  if (playerX > threshold) {
    const desiredOffset  = playerX - threshold;
    cameraOffsetX = lerp(cameraOffsetX, desiredOffset, 0.1);
    MatterBody.setPosition(player1.body, { x: threshold, y: player1.body.position.y });

    for (let index = 0; index < grounds.length; index++) {
      updateElementPos(grounds[index],desiredOffset);
    }
    for (let index = 0; index < targetWalls.length; index++) {
      updateElementPos(targetWalls[index],desiredOffset);
    }
    
    for (let index = 0; index < boomParticles.length; index++) {
      updateElementPos(boomParticles[index],desiredOffset);
    }
    for (let index = 0; index < collideParticles.length; index++) {
      updateElementPos(collideParticles[index],desiredOffset);
    }
    for (let index = 0; index < collideParticles.length; index++) {
      updateElementPos(collideParticles[index],desiredOffset);
    }
    updateElementPos(dividerWall, desiredOffset);
  }
}

function updateElementPos(element, desiredOffset) {
  element.x = element.body.position.x - desiredOffset;
  element.y = element.body.position.y;
  MatterBody.setPosition(element.body, { x: element.body.position.x - desiredOffset, y: element.body.position.y });
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

//custom events
["click", "touchend"].forEach(event => {
  gameStartButton.addEventListener(event, (e) => {
    gameStartPopup.classList.remove("show");
    startGame();
  });
});

["click", "touchend"].forEach(event => {
  gameRestartButton.addEventListener(event, (e) => {
    gameEndPopup.classList.remove("show");
    initSetup();
    startGame();
  });
});

["click", "touchend"].forEach(event => {
  gameWonRestartGameButton.addEventListener(event, (e) => {
    gameWonPopup.classList.remove("show");
    initSetup();
    startGame();
  });
});

//custom classes
class BaseBody {
  constructor({ x, y, r = 0, w = 0, h = 0, bodyOption }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = r;

    // Create a unique color only if render styles are not predefined
    if (!bodyOption?.render) {
      const color = `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;
      bodyOption.render = {
        fillStyle: color,
        strokeStyle: color,
        lineWidth: 3,
      };
    }

    this.body = r === 0
      ? Bodies.rectangle(x, y, w, h, bodyOption)
      : Bodies.circle(x, y, r, bodyOption);

    Composite.add(engine.world, this.body);
  }

  removeFromWorld() {
    Composite.remove(engine.world, this.body);
  }

  setBodyProps() { }

  show() {
    const { position, angle } = this.body;

    push();
    translate(position.x, position.y);
    rotate(angle);

    this.setBodyProps();

    pop();
  }

  checkOutOfWorld() {
    const { y } = this.body.position;
    if (y > height + 150 + this.h) {
      return true;
    }
    return false;
  }
}

class Box extends BaseBody {
  constructor(config) {
    super({ ...config });
  }
  setBodyProps() {
    const { fillStyle, strokeStyle, lineWidth } = this.body.render;

    fill(fillStyle);
    stroke(strokeStyle);
    strokeWeight(lineWidth);
    rectMode(CENTER);

    rect(0, 0, this.w, this.h);
  }
}

class Circle extends BaseBody {
  constructor(config) {
    super({ ...config, label: labels.finalWall });
  }
  setBodyProps() {
    const { fillStyle, strokeStyle, lineWidth } = this.body.render;

    fill(fillStyle);
    stroke(strokeStyle);
    strokeWeight(lineWidth);
    rectMode(CENTER);

    rect(0, 0, this.w, this.h);
  }
}

class Player extends BaseBody {
  constructor(config) {
    super({ ...config });
  }

  setBodyProps() {
    imageMode(CENTER);
    image(playerImg, 0, 0, this.w, this.h);
    // rectMode(CENTER);
    // rect(0, 0, this.w, this.h);
  }

  show() {
    super.show();
    this.update();
  }

  update() {
    if (this.checkOutOfWorld()) {
      stopGame();
      gameEndPopup.classList.add("show");
    }
  }
}

class Wall extends BaseBody {
  constructor(config) {

    // Snap width and height to multiples of tileSize
    const snappedWidth = Math.floor(config.w / tileSize) * tileSize;
    const snappedHeight = Math.floor(config.h / tileSize) * tileSize;

    super({
      ...config,
      w: snappedWidth,
      h: snappedHeight,
      bodyOption: { ...config.bodyOption }
    });

    this.tileSize = tileSize;


  }
  setBodyProps() {
    const cols = this.w / this.tileSize;
    const rows = this.h / this.tileSize;

    imageMode(CORNER);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        image(
          wallImage,
          -this.w / 2 + i * this.tileSize,
          -this.h / 2 + j * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
    // rectMode(CENTER);
    // rect(0, 0, this.w, this.h);
  }

}

class DividerWall extends Wall {
  constructor(config) {
    super(config);
  }
  show() {
    super.show();

    this.update();
  }
  update() {
    if (targetWalls[0].checked && this.y > -height) {
      this.y -= 2;
      MatterBody.setPosition(this.body, { y: this.y, x: this.x });

    }

  }

}

class TargetWall extends Wall {
  constructor(config) {
    super({ ...config });
    this.checked = false;
    this.flagW = tileSize * 3;
    this.flagH = tileSize * 3;

    this.flagMaxFrameX = 7;
    this.flagMaxFrameY = 1;
    this.flagFrameX = 0;
    this.flagFrameY = 0;
    this.flagTimerCounter = 0;
    this.animatedFlagImg = animatedFlagImgRed;

  }

  animateFlag() {

    if (this.checked) {
      this.animatedFlagImg = animatedFlagImgGreen;
    } 
    
    if (this.flagTimerCounter > 100) {
      this.flagFrameX += 1;
      if (this.flagFrameX >= this.flagMaxFrameX) {
        this.flagFrameX = 0;
      }
      this.flagTimerCounter = 0;
    } else {
      this.flagTimerCounter += deltaTime;
    }

    imageMode(CORNER);
    image(
      this.animatedFlagImg,
      this.x,
      this.y - (this.animatedFlagImg.height * 0.75) - this.h * 0.5,
      (this.animatedFlagImg.width / this.flagMaxFrameX) * 0.75,
      (this.animatedFlagImg.height / this.flagMaxFrameY) * 0.75,
      this.flagFrameX * (this.animatedFlagImg.width / this.flagMaxFrameX),
      this.flagFrameY * (this.animatedFlagImg.height / this.flagMaxFrameY),
      this.animatedFlagImg.width / this.flagMaxFrameX,
      this.animatedFlagImg.height / this.flagMaxFrameY
    );
  }

 
  
  show() {
    super.show();
    this.animateFlag();
  }

}

class BoomParticle extends BaseBody {
  constructor(config) {
    super({ ...config, label: labels.boomParticle });
    this.history = [];
  }

  showBooParticle() {
    this.show();
    const pos = this.body.position;
    this.history.push(createVector(pos.x, pos.y));

    for (let i = 0; i < this.history.length; i++) {
      noStroke();
      fill(this.body.render.fillStyle);
      circle(this.history[i].x, this.history[i].y, (this.r * (i * 0.2)) * 2);
    }

    if (this.history.length > 5) this.history.shift();
  }
}

class CollideParticle extends BaseBody {
  constructor(config) {
    super({ ...config, label: "subParticle" });
    this.scale = 1;
  }

  setBodyProps() {
    const { fillStyle, strokeStyle, lineWidth } = this.body.render;

    fill(fillStyle);
    stroke(strokeStyle);
    strokeWeight(lineWidth);
    rectMode(CENTER);

    circle(0, 0, this.body.circleRadius * 2);
  }

  update() {
    this.show();
    this.scale -= 0.001;

    if (this.scale > 0) {
      MatterBody.scale(this.body, this.scale, this.scale);
    }

    if (this.body.circleRadius < 0.9) {
      this.removeFromWorld();
      collideParticles = collideParticles.filter(p => p.body.id !== this.body.id);
    }
  }
}
