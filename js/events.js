
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
    Events = Matter.Events;


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

function shakeScene(engine) {
    var timeScale = (1000 / 60) / engine.timing.lastDelta;
    var bodies = Composite.allBodies(engine.world);

    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];

        if (!body.isStatic && body.position.y >= 500) {
            // scale force for mass and time applied
            var forceMagnitude = (0.03 * body.mass) * timeScale;

            // apply the force over a single update
            Body.applyForce(body, body.position, { 
                x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
                y: -forceMagnitude + Common.random() * -forceMagnitude
            });
        }
    }
};

const stack = Composites.stack(70, 100, 15, 50, 50, 50, function(x,y){
    let color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);
    return Bodies.circle(x, y, 15, { restitution: 1, render : {fillStyle: color}});
});

Composite.add(world, stack);

Composite.add(world, [
    // walls
    Bodies.rectangle(960 - 100, 0, innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(960 - 100, innerHeight, innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(0, 450, 50, innerHeight, { isStatic: true }),
    Bodies.rectangle(innerWidth, 450, 50, innerHeight, { isStatic: true }),
]);

let lastTime = Common.now();;
let counter = 0;
Events.on(engine, 'beforeUpdate', function (event) {
    if (Common.now() - lastTime >= 5000) {
        shakeScene(engine);
        lastTime = Common.now();
    }


});

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

