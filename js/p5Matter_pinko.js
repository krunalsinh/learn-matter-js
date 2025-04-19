// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Composites = Matter.Composites;

var world,
  engine,
  boxes = [],
  grounds = [],
  pinkoDots;

//p5 functions
function setup() {
  createCanvas(innerWidth, innerHeight);

  engine = Engine.create();
  world = engine.world;

  var runner = Runner.create();
  Runner.run(runner, engine);

  grounds = [
    new CreateBody({x : width / 2, y : height, w : width, h : 30, angle : 0, isStatic: true, color: "blue"})
  ];

  pinkoDots = new createStack({initX : 0, initY : 100});

}

// function mouseDragged() {
//   Math.random() > 0.5
//     ? boxes.push(
//         new CreateBody({
//           x: mouseX,
//           y: mouseY,
//           w: random(10, 50),
//           h: random(10, 50)
//         })
//       )
//     : boxes.push(
//         new CreateBody({
//           x: mouseX,
//           y: mouseY,
//           r: random(10, 25)
//         })
//       );
// }

function draw() {
  
  background(111);
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
  
  if(frameCount % 60 == 0){
    boxes.push(
      new CreateBody({
        x: Math.random() * width,
        y: 20,
        r: 10,
      })
    );
    
  }
  pinkoDots.show();
}

//custom functions
class CreateBody {
  constructor({ x, y, r = 0, w = 0, h = 0, isStatic = false, angle = 0, color = "" }) {
    // console.log(color);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = r;
    this.bodyOption = {
      isStatic: isStatic,
      density: 0.1,
      friction: 0.1,
      restitution: 0.5,
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


class createStack {
  constructor({initX, initY, rows, cols}) {
    
    this.radius = 15;
    this.spacingX = this.radius * 4 + 10;
    this.spacingY = this.radius * 4 + 20;
    
    this.cols = Math.floor(width / this.spacingX);
    this.rows = Math.floor((height - 100) / this.spacingY);
    
    this.dotsStack = Composite.create();

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let offsetX = (row % 2 === 1) ? this.spacingX / 2 : 0;
        let x = col * this.spacingX + offsetX + initX;
        let y = row * this.spacingY + initY;
        
        let fillStyle =  "#fff";

        let dot = Bodies.circle(x, y, this.radius, {
          isStatic: true,
          render: { fillStyle }
        });

        Composite.add(this.dotsStack, dot);
      }
    }

    Composite.add(engine.world, this.dotsStack);
  }

  show() {
    for (let i = 0; i < this.dotsStack.bodies.length; i++) {
      let body = this.dotsStack.bodies[i];
      let pos = body.position;
      let label = body.label;
      let bounds = body.bounds;
      let width = bounds.max.x - bounds.min.x;
      let height = bounds.max.y - bounds.min.y;

      fill(body.render.fillStyle);
      stroke("white");
      strokeWeight(1);
      push();
      translate(pos.x, pos.y);

      if (label === "Rectangle Body") {
        rotate(body.angle);
        rectMode(CENTER);
        rect(0, 0, width, height);
      } else {
        circle(0, 0, this.radius * 2);
      }
      pop();
    }
  }
}