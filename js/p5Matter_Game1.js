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
  grounds = [], rect1, mConstraint, reached = false, playerImg, boomParticles = [], collideParticles = [];
const labelRedBox = "redBox", labelPlayer = "Player1", labelBoomParticle = "boomParticle";

//p5 functions
function setup() {
  var canvas = createCanvas(innerWidth, innerHeight);

  engine = Engine.create();
  world = engine.world;

  var runner = Runner.create();
  Runner.run(runner, engine);

  grounds = [
    new CreateBody({ x: width / 2, y: height, w: width, h: 60, angle: 0, isStatic: true, color: "#abdeed", strokeColor: "#01368a" }),
    new CreateBody({ x: 300, y: 200, w: 300, h: 30, angle: 0, isStatic: true, color: "#abdeed", strokeColor: "#01368a" }),
    new CreateBody({ x: 500, y: 400, w: 300, h: 30, angle: 0, isStatic: true, color: "#abdeed", strokeColor: "#01368a" }),
    new CreateBody({ x: 1200, y: 200, w: 300, h: 30, angle: 0, isStatic: true, color: "#abdeed", strokeColor: "#01368a", label: labelRedBox })
  ];

  rect1 = new CreateBody({ x: width / 2, y: 50, w: 50, h: 50, angle: 0, isStatic: false, color: "#111", label: labelPlayer });


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

  Events.on(engine, 'collisionActive', function (event) {
    var pairs = event.pairs;

    // change object colours to show those starting a collision
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      if (pair.bodyA.label === labelRedBox && pair.bodyB.label === labelPlayer) {
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

  background("#fffbe8");

  for (let i = 0; i < grounds.length; i++) {
    grounds[i].show();
  }

  rect1.show();

  for (let i = 0; i < boomParticles.length; i++) {
    boomParticles[i].show();
  }


}

//custom functions
class CreateBody {
  constructor({ x, y, r = 0, w = 0, h = 0, isStatic = false, angle = 0, color = "", label = "body", strokeColor = "", collisionCategory = 0x0001 }) {
    // console.log(color);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = r;
    this.color = color !== "" ? color : `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;
    this.strokeColor = strokeColor !== "" ? strokeColor : `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;
    this.bodyOption = {
      isStatic: isStatic,
      density: 0.1,
      friction: 0.8,
      restitution: 0.5,
      angle: angle,
      label: label,
      render: {
        fillStyle: this.color,
        strokeStyle: this.strokeColor,
        lineWidth: 3,
      },
      collisionFilter: {
        category: collisionCategory
      },
    };
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
      // console.log("called");
      rotate(angle);
      // image(playerImg, 0, 0, this.w, this.h);
      // image(playerImg, 0, 0, this.w, this.h, 0, 0,  playerImg.width,  playerImg.height, COVER);
      // image(playerImg, -this.w, -this.h, this.w * 2, this.h * 2)
      imageMode(CENTER);
      image(playerImg, 0, 0, this.w, this.h);
    }
    else if (this.r === 0) {
      rotate(angle);
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
    } else {
      circle(0, 0, this.r * 2);
    }

    pop();
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

  const boomParticle = new CreateBody({ x: bodyCurrentPos.x, y: bodyCurrentPos.y, r: 5, w: 300, h: 30, angle: 0, isStatic: false, color: "#abdeed", strokeColor: "#01368a", label: labelBoomParticle, collisionCategory : 0x0002 });
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
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

function preload() {
  playerImg = loadImage('../images/other/box1.png');
}