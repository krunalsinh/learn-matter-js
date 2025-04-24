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
const labelWall = "wall", labelFinalWall = "finalWall", labelPlayer = "Player1", labelBoomParticle = "boomParticle";
const wallsCategory = 0x0001, boomParticleCategory = 0x0002;

//p5 functions
function setup() {
  var canvas = createCanvas(innerWidth, innerHeight);

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

  // console.log(finalBoxOptions);

  grounds = [
    new CreateBody({ x: width / 2, y: height, w: width, h: 60, bodyOption: groundOptions }),
    new CreateBody({ x: 300, y: 200, w: 300, h: 30, bodyOption: groundOptions }),
    new CreateBody({ x: 500, y: 400, w: 300, h: 30, bodyOption: groundOptions }),
    new CreateBody({ x: 1200, y: 200, w: 300, h: 30, bodyOption: finalBoxOptions })
  ];

  const playerOptions = {
    density: 1,
    friction: 0.8,
    restitution: 0.5,
    label: labelPlayer,
    collisionFilter: {
      mask: wallsCategory
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
  Events.on(engine, 'collisionActive', function (event) {
    var pairs = event.pairs;

    // change object colours to show those starting a collision

    // console.log(pairs);
    
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
      if (pair.bodyA.label === labelWall && pair.bodyB.label === labelBoomParticle) {
        
        boomParticles = boomParticles.filter(particle => {
          if(particle.body.id === pair.bodyB.id){
            particle.removeFromWorld()
          }else{
            return particle;
          }
        })

        for (let i = 0; i < 5; i++) {
          const particle = new CollideParticle({ x: pair.bodyB.position.x, y: pair.bodyB.position.y, r: pair.bodyB.circleRadius});
          var forceMagnitude = (0.03 * particle.body.mass) + Math.random() * 0.03;

          // apply the force over a single update
          Body.applyForce(particle.body, particle.body.position, { 
              x: (forceMagnitude + Math.random() * forceMagnitude) * random([1, -1]), 
              y: -forceMagnitude + Math.random() * -forceMagnitude
          });
          Body.setVelocity(particle.body, { x: Math.random() *  random(-5, 5), y: Math.random() * random(-5, 5)});
          collideParticles.push(particle);
        }
        
      }
    }
  });
}

function draw() {
  // console.log(rect1);
  
  background("#fffbe8");

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
    }
    else if (this.r === 0) {
      rotate(angle);
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
    } else {
      circle(0, 0, this.body.circleRadius * 2);
    }

    pop();
  }

}

class BoomParticle extends CreateBody{
  constructor({ x, y, r , w, h , bodyOption }){
    super({ x, y, r , w, h , bodyOption })

    this.history = [];
  }
  showBooParticle(){
    this.show();

    this.history.push(createVector(this.body.position.x, this.body.position.y))

    for (let i = 0; i < this.history.length; i++) {
      
      fill(this.body.render.fillStyle);
      circle(this.history[i].x, this.history[i].y, (this.r * (i * 0.2) ) * 2);
    }

    if(this.history.length > 5){
      this.history.splice(0, 1);
      
      
    }
  }
}

class CollideParticle extends CreateBody{
  constructor({ x, y, r , w, h , bodyOption }){
    super({ x, y, r , w, h , bodyOption });
    this.scale = 1;
  }
  update(){
    // console.log(this.body);
    
    
    this.show();

    this.scale -= 0.001;
    
    // Matter.Body.scale(this.body, this.scale, this.scale, {x : this.body.position.x, y : this.body.position.y});

    // this.body.circleRadius -= 0.1;
    if(this.body.circleRadius < 0.9){
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
    collisionFilter : {
      category: boomParticleCategory
    }
    
  };

  const boomParticle = new BoomParticle({ x: bodyCurrentPos.x, y: bodyCurrentPos.y, r: 5, bodyOption : booParticleOption });
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
}