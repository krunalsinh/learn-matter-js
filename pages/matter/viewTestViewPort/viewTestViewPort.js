// const decomp = require("poly-decomp");

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const size = { width: innerWidth, height: innerHeight };


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

console.log(Composite);


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
        // hasBounds: Renders only objects within a specific boundary.
        // enabled: Toggles rendering on/off.
        wireframeBackground: "#000",
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
let wallArr = [];

function createAndAddWalls() {
    
    wallArr = [
        createWall(innerWidth / 2, 0, innerWidth, 50),
        createWall(innerWidth / 2, innerHeight, innerWidth, 50),
        createWall(innerWidth, innerHeight / 2, 50, innerHeight), 
        createWall(0, innerHeight / 2, 50, innerHeight)
    ]
    Composite.add(world, wallArr);
    console.log(wallArr);
}

function removeWalls() {
    wallArr.forEach(wall => {
        Composite.remove(world, wall);
    });
    wallArr = [];
}


var stack = Composites.stack(200, 606 - 25.25 - 5 * 40, 10, 5, 0, 0, function (x, y) {
    return Bodies.rectangle(x, y, 40, 40);
});

Composite.add(world, stack);




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

    // console.log(topWall);

    // get the current window size
    var width = window.innerWidth,
        height = window.innerHeight;

        removeWalls();
        createAndAddWalls();

    // set the render size to equal window size
    Render.setSize(render, width, height);

    // update the render bounds to fit the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: innerWidth, y: innerHeight }
    });
};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
handleWindowResize();

