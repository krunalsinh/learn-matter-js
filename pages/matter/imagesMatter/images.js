// const decomp = require("poly-decomp");

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const minSize = Math.min(innerHeight, innerWidth);


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
    Events = Matter.Events;



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
        width: 800,
        height: 600,
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

Composite.add(world, [
    // walls
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
]);

/* 1) rectangle -----------------------------*/
const rect1 = Bodies.rectangle(450, 0, 64, 64, {
    label: "box1",
    isStatic: false,
    angle: Math.PI / 4,
    density: 1,
    friction: 0.5,
    restitution: 0.8,
    render: {
        fillStyle: '#e67e22',
        strokeStyle: '#fff',
        lineWidth: 3,
        sprite: {
            texture: '../../../common/images/other/box.png'
        }
       
    },
    chamfer: {
        radius: 5
    },
})
Composite.add(world, rect1);

/* 2) circle -----------------------------*/
const circle1 = Matter.Bodies.circle(60, 0, 46, {
    isStatic: false,
    angle: Math.PI / 4,
    density: 1,
    friction: 0.5,
    restitution: 0.8,
    render: {
        fillStyle: '#3498db',
        strokeStyle: '#fff',
        lineWidth: 3,
        sprite: {
            texture: '../../../common/images/other/ball.png'
        }
    },
    chamfer: {
        radius: 5
    },
    label: "box1"
}, [1])
Composite.add(world, circle1);




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
    var width = window.innerWidth,
        height = window.innerHeight;

    // set the render size to equal window size
    Render.setSize(render, width, height);

    // update the render bounds to fit the scene
    Render.lookAt(render, Composite.allBodies(engine.world), {
        x: 50,
        y: 50
    });
};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
handleWindowResize();

