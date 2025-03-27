
const canvas = document.getElementById('canvas');


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
    World = Matter.World;

// provide concave decomposition support library
Common.setDecomp(decomp);

// create an engine
const engine = Engine.create();

//world
const world = engine.world;

// create a renderer
const render = Render.create({
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

//cradle
function createCradle(x, y, size, count, length){
    const cradleWrapper = Composite.create({label : "cradle"});

    for (let i = 0; i < count; i++) {
        
        const newX = x + i * (size * 2);
        const circle = Bodies.circle(newX, y + length, size, { 
            inertia: Infinity,
            restitution: 1, 
            friction: 0,
            frictionAir: 0,
            slop: size * 0.02
        });
        const circleConstraint = Constraint.create({
            pointA: { x : newX, y : y},
            bodyB : circle
        })
        Composite.addBody(cradleWrapper, circle);
        Composite.addConstraint(cradleWrapper, circleConstraint);
    }

    return cradleWrapper;

}

const cradle1 = createCradle(300, 300, 30, 5, 200);
Composite.add(world, cradle1);
Body.translate(cradle1.bodies[0], {x: -140, y : -100})


const cradle2 = createCradle(800, 300, 15, 7, 100);
Composite.add(world, cradle2);
Body.translate(cradle2.bodies[0], {x: -140, y : -100})


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

};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
setTimeout(handleWindowResize, 1000);



