// const decomp = require("poly-decomp");

const canvas = document.getElementById('canvas');
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;


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
        width: innerWidth,
        height: innerHeight,
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

const group = Body.nextGroup(true);
const circleA = Bodies.circle(500, 180, 25,{ friction: 0, isStatic: false, render : { fillStyle: "#666" } });
const circleB = Bodies.circle(550, 250, 25,{ friction: 0, isStatic: false, render: circleA.render });
const circleC = Bodies.circle(450, 250, 25,{ friction: 0, isStatic: false, render: circleA.render });

const rectA = Bodies.rectangle(485, 200, 10, 90, { isStatic: false, angle: Math.PI / 5, render: circleA.render })
const rectB = Bodies.rectangle(515, 200, 10, 90, { isStatic: false, angle: -Math.PI / 5, render: circleA.render })
const rectC = Bodies.rectangle(500, 250, 10, 100, { isStatic: false, angle: Math.PI / 2, render: circleA.render })


const compoundBody1 = Body.create({
    isStatic: false,
    density: 1,
    friction: 0,
    restitution: 0.8,
    parts : [circleA, circleB, circleC, rectA, rectB, rectC]
})


const circleGrp1 = Bodies.circle(400, 150, 25,{ friction: 0, isStatic: false, render : { fillStyle: "#666" } });


const constraint1 = Constraint.create({
    bodyA: circleGrp1,
    pointA: { x: 0, y: 0 },
    bodyB: compoundBody1,
    pointB: { x: 0, y: 0 }
});

Composite.add(world, [circleGrp1, compoundBody1, constraint1]);


const circleD = Bodies.circle(800, 160, 20,{ friction: 0, isStatic: false, render : { fillStyle: "#666" } });
const circleD1 = Bodies.circle(800, 300, 20,{ friction: 0, isStatic: false, render : { fillStyle: "#666" } });
const circleE = Bodies.circle(800, 230, 35,{ friction: 0, isStatic: false, render: circleD.render });
const compoundBody2 = Body.create({
    isStatic: false,
    density: 1,
    friction: 0,
    restitution: 0.8,
    parts : [circleD,circleD1, circleE]
})

const constraint2 = Constraint.create({
    pointA: { x: 800, y: 10 },
    bodyB: compoundBody2,
    pointB: { x: 0, y: 0 }
});

Composite.add(world, [compoundBody2, constraint2]);


Composite.add(world, [
    // walls
    Bodies.rectangle(960, 0, innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(960,  innerHeight , innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(0, 450, 50, innerHeight, { isStatic: true }),
    Bodies.rectangle(960 + 960, 450, 50, innerHeight, { isStatic: true }),
    //ramp
    Bodies.rectangle(400, 300, 500, 5, { isStatic: true, angle: Math.PI / 8 })
  
]);

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
    // Render.lookAt(render, Composite.allBodies(engine.world), {
    //     x: 50,
    //     y: 50
    // });
};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
setTimeout(handleWindowResize, 1000);

