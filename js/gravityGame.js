
const canvas = document.getElementById('canvas');
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
Common.setDecomp(decomp);


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
        background: "#666",
        pixelRatio: window.devicePixelRatio,
        wireframes: false,
        showVelocity: false,
        showCollisions: false,
        showAngleIndicator: false,
        showBounds: false,
        showDebug: false,
        showSleeping: false,
        showAxes: false,
        // hasBounds: Renders only objects within a specific boundary.
        // enabled: Toggles rendering on/off.
        wireframeBackground: "#666",
        lineWidth: 1
    },
});

const wallView = {
    fillStyle: '#3498db',
    strokeStyle: '#fff',
    lineWidth: 3
};


function createWall(x, y, width, height) {
    return Bodies.rectangle(x, y, width, height, { isStatic: true, render: wallView });
}

Composite.add(world, [
    createWall(size.width / 2, 0, size.width, 50),
    createWall(size.width / 2, size.height, size.width, 50),
    createWall(size.width, size.height / 2, 50, size.height), 
    createWall(0, size.height / 2, 50, size.height)
]);

var stack = Composites.stack(200, 606 - 25.25 - 5 * 40, 10, 5, 0, 0, function (x, y) {
    return Bodies.rectangle(x, y, 40, 40);
});

Composite.add(world, stack);

var select = function(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
};

// var loadSvg = function(url) {
//     return fetch(url)
//         .then(function(response) { 
//             return response.text(); 
//         })
//         .then(function(raw) { 
//             return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); 
//         });
// };

// loadSvg("./images/svg/maze1.svg").then(function(root) {
//     var color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

//     var vertexSets = select(root, 'path')
//         .map(function(path) { 
//             // return Vertices.scale(Svg.pathToVertices(path, 30), 0.3, 0.3); 
//             return Svg.pathToVertices(path, 30); 
//         });

    
    
//     Composite.add(world, Bodies.fromVertices(300 , 400 , vertexSets, {
//         isStatic: true,
//         render: {
//             fillStyle: color,
//             strokeStyle: color, 
//             lineWidth: 1
//         }
//     }, true));
// });


    const root = document.getElementById("mazeSVG");
    var color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

    var vertexSets = select(root, 'path')
        .map(function(path) { 
            // return Vertices.scale(Svg.pathToVertices(path, 30), 0.3, 0.3); 
            return Svg.pathToVertices(path, 30); 
        });

    
    
    Composite.add(world, Bodies.fromVertices(300 , 400 , vertexSets, {
        isStatic: true,
        render: {
            fillStyle: color,
            strokeStyle: color, 
            lineWidth: 1
        }
    }, true));



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
  var width = innerHeight,
    height = innerHeight;

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

  // engine.gravity.x = -1;

  console.log(`Gravity along the X-axis ${gravitySensor.x}`);
  console.log(`Gravity along the Y-axis ${gravitySensor.y}`);
  console.log(`Gravity along the Z-axis ${gravitySensor.z}`);
});

gravitySensor.start();
