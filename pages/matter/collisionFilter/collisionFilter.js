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

    var arrow = Vertices.fromPath('40 0 40 20 100 20 100 80 40 80 40 100 0 50'),
    chevron = Vertices.fromPath('100 0 75 50 100 100 25 100 0 50 25 0'),
    star = Vertices.fromPath('50 0 63 38 100 38 69 59 82 100 50 75 18 100 31 59 0 38 37 38'),
    horseShoe = Vertices.fromPath('35 7 19 17 14 38 14 58 25 79 45 85 65 84 65 66 46 67 34 59 30 44 33 29 45 23 66 23 66 7 53 7');


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

 // define our categories (as bit fields, there are up to 32 available)
 var defaultCategory = 0x0001,
 redCategory = 0x0002,
 greenCategory = 0x0004,
 blueCategory = 0x0008;

var colorA = '#f55a3c',
 colorB = '#063e7b',
 colorC = '#f5d259';

  // create a stack with varying body categories (but these bodies can all collide with each other)
  Composite.add(world,
    Composites.stack(275, 100, 5, 9, 10, 10, function(x, y, column, row) {
        var category = redCategory,
            color = colorA;

        if (row > 5) {
            category = blueCategory;
            color = colorB;
        } else if (row > 2) {
            category = greenCategory;
            color = colorC;
        }

        return Bodies.circle(x, y, 20, {
            collisionFilter: {
                category: category
            },
            render: {
                strokeStyle: color,
                fillStyle: 'transparent',
                lineWidth: 1
            }
        });
    })
);

// this body will only collide with the walls and the green bodies
Composite.add(world,
    Bodies.fromVertices(300, 40, arrow, {
        collisionFilter: {
            mask: defaultCategory | greenCategory
        },
        render: {
            fillStyle: colorC,
            strokeStyle: colorC,
            lineWidth: 1
        }
    }, true)
);



 // this body will only collide with the walls and the red bodies
Composite.add(world,
    Bodies.fromVertices(400, 40, chevron, {
        collisionFilter: {
            mask: defaultCategory | redCategory
        },
        render: {
            fillStyle: colorA,
            strokeStyle: colorA,
            lineWidth: 1
        }
    }, true)
);

Composite.add(world,
    Bodies.fromVertices(480, 40, star, {
        collisionFilter: {
            mask: defaultCategory | blueCategory
        },
        render: {
            fillStyle: colorB,
            strokeStyle: colorB,
            lineWidth: 1
        }
    }, true)
);


Composite.add(world, [
    // walls
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
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

