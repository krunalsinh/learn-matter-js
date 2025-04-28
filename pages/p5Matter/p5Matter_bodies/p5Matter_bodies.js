// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

var world,
  engine,
  boxes = [],
  grounds = [];

//p5 functions
function setup() {
  createCanvas(innerWidth, innerHeight);

  engine = Engine.create();
  world = engine.world;

  var runner = Runner.create();
  Runner.run(runner, engine);

  grounds = [
    new CreateBody({x : width / 2, y : height, w : width, h : 30, angle : 0, isStatic: true, color: "blue"}),
    new CreateBody({x : width / 1.5, y : 450, w : width / 1.5, h : 15, angle : -0.5, isStatic: true, color: "blue"}),
    new CreateBody({x : width / 2 / 2, y : 200, w : width / 2, h : 15, angle : 0.5, isStatic: true, color: "blue"}),
  ];
}

function mouseDragged() {
  Math.random() > 0.5
    ? boxes.push(
        new CreateBody({
          x: mouseX,
          y: mouseY,
          w: random(10, 50),
          h: random(10, 50)
        })
      )
    : boxes.push(
        new CreateBody({
          x: mouseX,
          y: mouseY,
          r: random(10, 25)
        })
      );
}

function draw() {
  background(220);
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].show();

    if (boxes[i].isOffScreen()) {
      boxes[i].removeFromWorld();
      boxes.splice(i, 1);
      i--;
    }
  }
  for (let i = 0; i < grounds.length; i++) {
    grounds[i].show();
  }
  
  // console.log("world bodies => " + (world.bodies.length - 3),", boxes Arr => "+ boxes.length);
}

//custom functions
class CreateBody {
  constructor({ x, y, r = 0, w = 0, h = 0, isStatic = false, angle = 0, color = "" }) {
    console.log(color);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = r;
    this.bodyOption = {
      isStatic: isStatic,
      density: 1,
      friction: 0.1,
      restitution: 0.1,
      angle: angle
    };
    this.color = color !== "" ? color : `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;
    this.body = this.r === 0 ? Bodies.rectangle(x, y, w, h, this.bodyOption) : Bodies.circle(x, y, r, this.bodyOption);
    
    Composite.add(engine.world, this.body);
  }

  isOffScreen() {
    return this.body.position.y > height + 100;
  }
  
  removeFromWorld(){
    Composite.remove(engine.world, this.body);
  }

  show() {
    var pos = this.body.position;
    var angle = this.body.angle;
    fill(this.color);
    stroke("white");
    strokeWeight(1);
    push();
    translate(pos.x, pos.y);
    if (this.r === 0) {
      rotate(angle);
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
    } else {
      circle(0, 0, this.r * 2);
    }
    pop();
  }
}
