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
    Bodies.rectangle(840, innerHeight, innerWidth, 50, { isStatic: true }),
]);

// add bodies
var rockOptions = { density: 0.004 },
rock = Bodies.polygon(170, 450, 8, 20, rockOptions),
anchor = { x: 170, y: 450 },
elastic = Constraint.create({ 
    pointA: anchor, 
    bodyB: rock, 
    length: 0.01,
    damping: 0.01,
    stiffness: 0.05
});

var pyramid = Composites.pyramid(500, 300, 9, 10, 0, 0, function(x, y) {
return Bodies.rectangle(x, y, 25, 40);
});

var ground2 = Bodies.rectangle(610, 250, 200, 20, { isStatic: true, render: { fillStyle: '#666' } });

var pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, function(x, y) {
return Bodies.rectangle(x, y, 25, 40);
});

Composite.add(engine.world, [ pyramid, ground2, pyramid2, rock, elastic]);

Events.on(engine, 'afterUpdate', function() {
    
    console.log(rock.position.x, rock.position.y);
    if (mouseConstraint.mouse.button === -1 && (rock.position.x < 90 || rock.position.y > 520)) {

        elastic.bodyB = null;
        elastic.pointB = {x: anchor.x, y: anchor.y};
        rock = Bodies.polygon(170, 450, Common.random(3, 6), 40, rockOptions);
        setTimeout(function() {

            Composite.add(engine.world, rock);
            elastic.pointB = {x: 0, y: 0};
            elastic.bodyB = rock;
        }, 1000);
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

