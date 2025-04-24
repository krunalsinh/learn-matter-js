// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Body = Matter.Body,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Events = Matter.Events;

var world,
  engine,
  grounds = [], rect1, mConstraint, reached = false, playerImg, boomParticles = [], collideParticles = [], pattern, flagImg;
const labelWall = "wall", labelFinalWall = "finalWall", labelPlayer = "Player1", labelBoomParticle = "boomParticle", labelFlagObstacle = "flagObstacle";
const wallsCategory = 0x0001, boomParticleCategory = 0x0002, flagObstacleCategory = 0x0003, playerCategory = 0x0004;

//p5 functions
function setup() {
  var canvas = createCanvas(innerWidth, innerHeight);

  pattern = createPattern(); // create the pattern
  // noLoop(); // stop draw() since background is static

  engine = Engine.create();
  world = engine.world;

  var runner = Runner.create();
  Runner.run(runner, engine);

  const groundOptions = {
    isStatic: true,
    density: 1,
    friction: 0.8,
    restitution: 0.5,
    label: labelWall,
    render: {
      fillStyle: "#abdeed",
      strokeStyle: "#01368a",
      lineWidth: 3,
    },
    collisionFilter: {
      category: wallsCategory
    }
  };
  const finalBoxOptions = {
    ...groundOptions, label: labelFinalWall,
  };

  const flagObstacleOption = {
    ...groundOptions, 
    label: labelFlagObstacle,
    collisionFilter: {
      category: flagObstacleCategory,
      mask: wallsCategory
    }
  }

  // console.log(finalBoxOptions);

  grounds = [
    new CreateBody({ x: width / 2, y: height, w: width, h: 60, bodyOption: groundOptions }),
    new CreateBody({ x: 300, y: 350, w: 300, h: 30, bodyOption: groundOptions }),
    new CreateBody({ x: 750, y: 580, w: 300, h: 150, bodyOption: groundOptions }),
    new CreateBody({ x: 1200, y: 200, w: 300, h: 30, bodyOption: finalBoxOptions }),
    new CreateBody({ x: 1200, y: 135, w: 100, h: 100, bodyOption: flagObstacleOption }),
  ];

  const playerOptions = {
    density: 1,
    friction: 0.8,
    restitution: 0.5,
    label: labelPlayer,
    collisionFilter: {
      mask: wallsCategory,
      category: playerCategory
    }

  };
  rect1 = new CreateBody({ x: width / 2, y: 50, w: 50, h: 50, bodyOption: playerOptions });

  // console.log(rect1);



  //create mouse constraint
  const canvasMouse = Mouse.create(canvas.elt);
  const options = {
    mouse: canvasMouse
  }
  mConstraint = MouseConstraint.create(engine, options)
  Composite.add(world, mConstraint);

  console.log(mConstraint);

  //set pixel ratio
  canvasMouse.pixelRatio = pixelDensity();

  //check collision for red box and player
  Events.on(engine, 'collisionStart', function (event) {
    var pairs = event.pairs;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      if ((pair.bodyA.label === labelWall || pair.bodyA.label === labelFinalWall) && pair.bodyB.label === labelBoomParticle) {

        boomParticles = boomParticles.filter(particle => {
          if (particle.body.id === pair.bodyB.id) {
            particle.removeFromWorld()
          } else {
            return particle;
          }
        })

        for (let i = 0; i < 10; i++) {
          const angle = random(TWO_PI); // 0 to 2π radians
          const speed = random(3, 6);   // Random speed
          const velocity = {
            x: cos(angle) * speed,
            y: sin(angle) * speed
          };

          const bodyOption = {
            friction: 0,
            frictionAir: 0.01,
            restitution: 0.9,
            label: "subParticle",
            collisionFilter: {
              category: boomParticleCategory
            }
          };

          const particle = new CollideParticle({
            x: pair.bodyB.position.x,
            y: pair.bodyB.position.y,
            r: 3,
            bodyOption
          });

          // Apply velocity to simulate explosion
          Body.setVelocity(particle.body, velocity);

          collideParticles.push(particle);
        }

      }
    }
  });

  Events.on(engine, 'collisionActive', function (event) {
    var pairs = event.pairs;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      if (pair.bodyA.label === labelFinalWall && pair.bodyB.label === labelPlayer) {
        if (pair.bodyB.velocity.x === 0 && pair.bodyB.velocity.y === 0) {
          pair.bodyA.render.fillStyle = 'green';
          if (!reached) {
            startConfetti()
            reached = true;
          }
        }
      }
    }
  });




}

function draw() {
  console.log(grounds);
  
  for (let x = 0; x < width; x += pattern.width) {
    for (let y = 0; y < height; y += pattern.height) {
      image(pattern, x, y);
    }
  }

  for (let i = 0; i < grounds.length; i++) {
    grounds[i].show();
  }

  rect1.show();

  for (let i = 0; i < boomParticles.length; i++) {
    boomParticles[i].showBooParticle();
  }

  for (let i = 0; i < collideParticles.length; i++) {
    collideParticles[i].update();
    // console.log(collideParticles);

  }

  updateCamera(); // 👈 call the camera update here
}

//custom functions
class CreateBody {
  constructor({ x, y, r = 0, w = 0, h = 0, bodyOption }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = r;
    this.color = `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;
    this.strokeColor = `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;
    this.bodyOption1 = {
      isStatic: "false",
      density: 0.1,
      friction: 0.8,
      restitution: 0.5,
      angle: 0,
      label: "body",
      render: {
        fillStyle: this.color,
        strokeStyle: this.color,
        lineWidth: 3,
      },
      collisionFilter: {
        category: 0x0001
      },
    };
    this.bodyOption = bodyOption !== undefined ? bodyOption : this.bodyOption1;
    this.body = this.r === 0 ? Bodies.rectangle(x, y, w, h, this.bodyOption) : Bodies.circle(x, y, r, this.bodyOption);

    Composite.add(engine.world, this.body);
  }

  isOffScreen() {
    return this.body.position.y > height + 100;
  }

  removeFromWorld() {
    Composite.remove(engine.world, this.body);
  }

  show() {
    var pos = this.body.position;
    var angle = this.body.angle;
    // console.log(typeof this.body.render.lineWidth);

    fill(this.body.render.fillStyle);
    strokeWeight(this.body.render.lineWidth);
    stroke(this.body.render.strokeStyle);
    push();
    translate(pos.x, pos.y);
    if (this.body.label === labelPlayer) {
      rotate(angle);
      imageMode(CENTER);
      image(playerImg, 0, 0, this.w, this.h);
    }else if (this.body.label === labelFlagObstacle) {
      fill("transparent");
      strokeWeight(0);
      stroke("transparent");
      rotate(angle);
      imageMode(CENTER);
      image(flagImg, 0, 0, this.w, this.h);
    }else if (this.r === 0) {
      rotate(angle);
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
    } else {
      circle(0, 0, this.body.circleRadius * 2);
    }

    pop();
  }

}

class BoomParticle extends CreateBody {
  constructor({ x, y, r, w, h, bodyOption }) {
    super({ x, y, r, w, h, bodyOption })

    this.history = [];
  }
  showBooParticle() {
    this.show();

    this.history.push(createVector(this.body.position.x, this.body.position.y))

    for (let i = 0; i < this.history.length; i++) {

      fill(this.body.render.fillStyle);
      circle(this.history[i].x, this.history[i].y, (this.r * (i * 0.2)) * 2);
    }

    if (this.history.length > 5) {
      this.history.splice(0, 1);


    }
  }
}

class CollideParticle extends CreateBody {
  constructor({ x, y, r, w, h, bodyOption }) {
    super({ x, y, r, w, h, bodyOption });
    this.scale = 1;
  }
  update() {
    // console.log(this.body);


    this.show();

    this.scale -= 0.001;

    Matter.Body.scale(this.body, this.scale, this.scale, { x: this.body.position.x, y: this.body.position.y });

    // this.body.circleRadius -= 0.1;
    if (this.body.circleRadius < 0.9) {
      this.removeFromWorld();
      collideParticles = collideParticles.filter(particle => {
        return particle.body.id !== this.body.id
      })

    }

  }
}

function mouseClicked() {
  const distX = rect1.body.position.x - mouseX, maxVelocity = 5, incrAngleVelocity = 0.08;
  const currentVelocity = rect1.body.angularVelocity;
  const bodyCurrentPos = rect1.body.position;
  console.log(bodyCurrentPos);



  let velocityX, angularVelocity;

  if (distX < 0) {
    velocityX = Math.min(Math.abs(distX), maxVelocity * -1);
    angularVelocity = currentVelocity - incrAngleVelocity;
  } else {
    velocityX = Math.max(distX * -1, maxVelocity);
    angularVelocity = currentVelocity + incrAngleVelocity;
  }

  Body.setVelocity(rect1.body, { x: velocityX, y: -10 });
  Body.setAngularVelocity(rect1.body, angularVelocity);

  const booParticleOption = {
    density: 1,
    friction: 0.8,
    restitution: 0.5,
    label: labelBoomParticle,
    render: {
      fillStyle: "#EBB978",
      strokeStyle: "#EBB978",
      lineWidth: 3,
    },
    collisionFilter: {
      category: boomParticleCategory
    }

  };

  const boomParticle = new BoomParticle({ x: bodyCurrentPos.x, y: bodyCurrentPos.y, r: 5, bodyOption: booParticleOption });
  Body.setVelocity(boomParticle.body, { x: velocityX * -1, y: -10 * -1 });
  boomParticles.push(
    boomParticle
  )
}

function startConfetti() {
  var duration = 5 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function () {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

function preload() {
  playerImg = loadImage('../images/other/box1.png');
  flagImg = loadImage('../images/other/flag.png');
}

function createPattern() {
  let pg = createGraphics(50, 50); // pattern size

  pg.background("#f7eed7"); // base color
  pg.stroke("#edddb9");
  pg.strokeWeight(12);
  pg.line(25, 25, 10, 10); // diagonal line

  return pg;
}

function updateCamera() {
  const threshold = width / 2; // Player stays near center
  const playerX = rect1.body.position.x;

  // If player moves beyond center, start shifting the world
  if (playerX > threshold) {
    const offset = playerX - threshold;

    // Move player back to center
    Body.setPosition(rect1.body, { x: threshold, y: rect1.body.position.y });

    // Shift all ground bodies left
    for (let i = 0; i < grounds.length; i++) {
      const b = grounds[i].body;
      Body.setPosition(b, { x: b.position.x - offset, y: b.position.y });
    }

    // Optional: move other entities like boomParticles or collideParticles
    boomParticles.forEach(p => {
      const b = p.body;
      Body.setPosition(b, { x: b.position.x - offset, y: b.position.y });
    });

    collideParticles.forEach(p => {
      const b = p.body;
      Body.setPosition(b, { x: b.position.x - offset, y: b.position.y });
    });
  }
}