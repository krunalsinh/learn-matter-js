// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Body = Matter.Body,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Constraint = Matter.Constraint,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Common = Matter.Common;

var world,
  engine,
  mConstraint,
  chain,
  grounds = [];

//p5 functions
function setup() {
  // create p5 canvas
  var canvas = createCanvas(innerWidth, innerHeight);

  //matter engine and world setup
  engine = Engine.create();
  world = engine.world;

  var runner = Runner.create();
  Runner.run(runner, engine);

  //create ground
  grounds = [
    new CreateBody({ x: width / 2, y: height, w: width, h: 30, angle: 0, isStatic: true, color: "blue" }),
  ];

  //create chain and chain hook constraint
  chain = new CreateChain(200, 100, 10);

  const chainConst = Constraint.create({
    pointA: {
      x: 300,
      y: 0
    },
    bodyB: chain.bodiesStack.bodies[0]
  })
  Composite.add(world, chainConst);
  
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


}



function draw() {
  background(220);

  for (let i = 0; i < grounds.length; i++) {
    grounds[i].show();
  }

  chain.show();

  if(mConstraint.body){
    var pos = mConstraint.body.position;
    var offset = mConstraint.constraint.pointB;
    var m = mConstraint.mouse.position;
    stroke(0,255,0);
    
    // console.log(pos, m);
    console.log(mConstraint);
    line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
  }

  // console.log("world bodies => " + (world.bodies.length - 3),", boxes Arr => "+ boxes.length);
}

//custom functions
class CreateBody {
  constructor({ x, y, r = 0, w = 0, h = 0, isStatic = false, angle = 0, color = "" }) {
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

  removeFromWorld() {
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

class CreateChain {
  constructor(x, y, count) {
    this.x = x;
    this.y = y;
    this.count = count;
    this.group = Body.nextGroup(true);
    this.color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);
    this.bodyOption = {
      density: 1,
      friction: 0.1,
      restitution: 0.1,
      collisionFilter: { group: this.group }
    };
    this.bodiesStack = Composites.stack(this.x, this.y, this.count, 1, 10, 10, (x, y, col, row) => {

      const body = Math.random() < 0.5 ?
        Bodies.rectangle(x, y, random(10, 50), random(10, 50), this.bodyOption) :
        Bodies.circle(x, y, random(10, 20), this.bodyOption);
      return body;
    });
    Composites.chain(this.bodiesStack, 0.5, 0, -0.5, 0, {
      stiffness: 0.1,
      length: 5,

    })
    Composite.add(world, this.bodiesStack);

  }

  show() {

    for (let i = 0; i < this.bodiesStack.bodies.length; i++) {
      var body = this.bodiesStack.bodies[i];
      var pos = body.position;
      var angle = body.angle;
      var bounds = body.bounds;
      var label = body.label;
      var width = bounds.max.x - bounds.min.x;
      var height = bounds.max.y - bounds.min.y;

      fill(body.render.fillStyle);
      stroke("white");
      strokeWeight(1);
      push();
      translate(pos.x, pos.y);

      if (label === "Rectangle Body") {
        rotate(angle);
        rectMode(CENTER);
        rect(0, 0, width, height);
      } else {
        circle(0, 0, 25 * 2);
      }
      pop();
    }
  }

}