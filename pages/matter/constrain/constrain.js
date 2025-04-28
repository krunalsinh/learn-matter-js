
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

// add revolute constraint


// Rectangle dimensions
const rectWidth = 180;
const rectHeight = 10;

// Stack position
const startX = innerWidth / 2 - 400 ;
const startY = 200;

// Create a stack of rectangles with constraints
const stack = Composites.stack(startX, startY, 3, 3, 200, 200, (x, y) => {
    const newX = x + (Math.random() * 200)
    const rect = Bodies.rectangle(newX, y, rectWidth, rectHeight, {
        rendDir: Math.random() > 0.5 ? 1 : -1,
        render: {
            fillStyle: "blue",
            strokeStyle: "black",
            lineWidth: 2
        }
    });

    // Create a constraint at the center of each rectangle
    const constraint = Constraint.create({
        bodyB: rect,
        pointA: { x : newX, y }, // Anchor point at the rectangle's center
        pointB: { x: 0, y: 0 }, // Attach to the center of the body
        stiffness: 0.7, // Adjust stiffness for flexibility
        damping: 0.1
    });

    // Add both the rectangle and constraint to the world
    Composite.add(world, constraint);

    return rect;
});

console.log(stack, stack);


// Add the stack to the world
Composite.add(world, stack);

// add damped soft global constraint
var bodyA = Bodies.polygon(500, 400, 6, 30);
var bodyB = Bodies.polygon(600, 400, 7, 60);

var constraint = Constraint.create({
    bodyA: bodyA,
    pointA: { x: -10, y: -10 },
    bodyB: bodyB,
    pointB: { x: -10, y: -10 },
    stiffness: 0.001,
    damping: 0.1
});

Composite.add(world, [bodyA, bodyB, constraint]);

Composite.add(world, [
    // walls
    Bodies.rectangle(960 - 100, 0, innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(960 - 100, innerHeight, innerWidth / 2, 50, { isStatic: true }),
    Bodies.rectangle(0, 450, 50, innerHeight, { isStatic: true }),
    Bodies.rectangle(innerWidth, 450, 50, innerHeight, { isStatic: true }),
]);

var lastTime = Common.now();
Events.on(engine, 'afterUpdate', function (event) {

    // Body.rotate(body, 1 * Math.PI * 0.01, null, true);
    if (Common.now() - lastTime >= 500) {
        let color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);
        const rendX = (Math.random() * innerWidth - 150)+100;
        const circle1 = Matter.Bodies.circle(rendX, Math.random() * 100 + 60, Math.random() * 35, {
            isStatic: false,
            render: {
                fillStyle: color,
                strokeStyle: '#fff',
                lineWidth: 1
            },

        }, [1])
        Composite.add(world, circle1);
        lastTime = Common.now();
    }
    
    const allBodies = Composite.allBodies(world);
    
    for (let i = 0; i < allBodies.length; i++) {
        const body = allBodies[i];
        if (body.position.y > innerHeight) {
            Composite.remove(world, body);
        }
    }

    const allStackBodies = Composite.allBodies(stack);

    for (let i = 0; i < allStackBodies.length; i++) {
        const body = allStackBodies[i];
        
        Body.rotate(body, 1 * Math.PI * 0.02 * body.rendDir, null, true);
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

