window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const size = { width: 1000, height: 1000 };
  
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
      Common = Matter.Common,
      Mouse = Matter.Mouse,
      Vector = Matter.Vector,
      Vertices = Matter.Vertices,
      Svg = Matter.Svg,
      Events = Matter.Events,
      Query = Matter.Query;
  
    // provide concave decomposition support library
  
    // create an engine
    var engine = Engine.create();
  
    //world
    var world = engine.world;
  
    // create a renderer
    var render = Render.create({
      element: document.body,
      canvas: canvas,
      engine: engine,
      options: {
        width: size.width,
        height: size.height,
        background: "#111",
        pixelRatio: window.devicePixelRatio,
        wireframes: false,
        showVelocity: false,
        showCollisions: false,
        showAngleIndicator: false,
        showBounds: false,
        showDebug: false,
        showSleeping: false,
        showAxes: false,
        wireframeBackground: "#111",
        lineWidth: 1
      }
    });
  
    const wallView = {
      fillStyle: "#3498db",
      strokeStyle: "#fff",
      lineWidth: 3
    };
  
    function createWall(x, y, width, height) {
      return Bodies.rectangle(x, y, width, height, {
        isStatic: true,
        render: wallView
      });
    }
  
    Composite.add(world, [
      createWall(size.width / 2, 0, size.width, 50),
      createWall(size.width / 2, size.height, size.width, 50),
      createWall(size.width, size.height / 2, 50, size.height),
      createWall(0, size.height / 2, 50, size.height)
    ]);
  
    var player = Bodies.circle(400, 100, 20, {
      density: 1,
      frictionAir: 0,
      label: "player"
    });
  
    Composite.add(world, player);
  
    var gate1 = Bodies.rectangle(132, 290, 68, 20, {
      isStatic: true,
      render: {
        fillStyle: "transparent"
      },
      label: "gate1"
    });
    var gate2 = Bodies.rectangle(640, 675, 80, 20, {
      isStatic: true,
      render: wallView,
      label: "gate2"
    });
    Composite.add(world, [gate1, gate2]);
  
    var select = function (root, selector) {
      return Array.prototype.slice.call(root.querySelectorAll(selector));
    };
  
    const root = document.getElementById("mazeSVG");
    var color = Common.choose([
      "#f19648",
      "#f5d259",
      "#f55a3c",
      "#063e7b",
      "#ececd1"
    ]);
  
    var vertexSets = select(root, "path").map(function (path) {
      return Svg.pathToVertices(path, 30);
    });
  
    Composite.add(
      world,
      Bodies.fromVertices(
        400,
        400,
        vertexSets,
        {
          isStatic: true,
          render: {
            fillStyle: color,
            strokeStyle: color,
            lineWidth: 1
          }
        },
        true
      )
    );
  
    // run the renderer
    Render.run(render);
  
    // create runner
    var runner = Runner.create();
  
    // run the engine
    Runner.run(runner, engine);
  
    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });
  
    Composite.add(world, mouseConstraint);
  
    // keep the mouse in sync with rendering
    render.mouse = mouse;
  
    // resize event handler
    var handleWindowResize = function () {
      // get the current window size
      var width = Math.min(innerHeight, innerWidth),
        height = Math.min(innerHeight, innerWidth);
  
      // set the render size to equal window size
      Render.setSize(render, width, height);
  
      // update the render bounds to fit the scene
      Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: size.width, y: size.height }
      });
    };
  
    // add window resize handler
    window.addEventListener("resize", handleWindowResize);
  
    // update canvas size to initial window size
    handleWindowResize();
  
    function reverseMap(value, inMin, inMax, outMin, outMax) {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
  
    let gravitySensor = new GravitySensor({ frequency: 60 });
  
    const xaxis = document.getElementById("xaxis");
    const yaxis = document.getElementById("yaxis");
    const zaxis = document.getElementById("zaxis");
  
    gravitySensor.addEventListener("reading", (e) => {
      engine.gravity.x = reverseMap(gravitySensor.x, -10, 10, 1, -1);
      engine.gravity.y = reverseMap(-gravitySensor.y, -10, 10, 1, -1);
      xaxis.innerText = gravitySensor.x;
      yaxis.innerText = gravitySensor.y;
      zaxis.innerText = gravitySensor.z;
  
      console.log(`Gravity along the X-axis ${gravitySensor.x}`);
      console.log(`Gravity along the Y-axis ${gravitySensor.y}`);
      console.log(`Gravity along the Z-axis ${gravitySensor.z}`);
    });
  
    gravitySensor.start();
  
    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
  
        if (labels.includes("player") && labels.includes("gate1")) {
          console.log("collide");
  
          const closedGate1 = Bodies.rectangle(
            gate1.position.x,
            gate1.position.y - 120,
            68,
            20,
            {
              isStatic: true,
              label: "gate1-closed",
              render: {
                fillStyle: "red"
              }
            }
          );
  
          Composite.remove(world, gate1);
          Composite.add(world, closedGate1);
        }
  
        if (labels.includes("player") && labels.includes("gate2")) {
          Composite.remove(world, gate2);
        }
      });
    });
  
    // an example of using beforeUpdate event on an engine
    Events.on(engine, "afterUpdate", function (event) {});
  });
  