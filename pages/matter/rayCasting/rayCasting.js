// const decomp = require("poly-decomp");

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


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


// add bodies
var stack = Composites.stack(20, 20, 12, 4, 0, 0, function(x, y) {
    switch (Math.round(Common.random(0, 1))) {

    case 0:
        if (Common.random() < 0.8) {
            return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
        } else {
            return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
        }
    case 1:
        var sides = Math.round(Common.random(1, 8));
        sides = (sides === 3) ? 4 : sides;
        return Bodies.polygon(x, y, sides, Common.random(20, 50));
    }
});
Composite.add(world, stack);


var collisions = [], startPoint = { x: 400, y: 100 };

Events.on(engine, 'afterUpdate', function() {
    var mouse = mouseConstraint.mouse,
        bodies = Composite.allBodies(engine.world),
        endPoint = mouse.position || { x: 100, y: 600 };

    collisions = Query.ray(bodies, startPoint, endPoint);
    console.log(collisions.length);
    
});


Events.on(render, 'afterRender', function() {
    console.log(mouseConstraint?.mouse);
    
    var mouse = mouseConstraint?.mouse,
        context = render.context,
        endPoint = mouse?.position || { x: 100, y: 600 };

    Render.startViewTransform(render);

    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(endPoint.x, endPoint.y);
    if (collisions.length > 0) {
        context.strokeStyle = '#fff';
    } else {
        context.strokeStyle = '#555';
    }
    context.lineWidth = 0.5;
    context.stroke();

    for (var i = 0; i < collisions.length; i++) {
        var collision = collisions[i];
        context.rect(collision.bodyA.position.x , collision.bodyA.position.y, 3, 3);
    }

    context.fillStyle = 'rgba(255,165,0,0.7)';
    context.fill();

    Render.endViewTransform(render);
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

