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


/* -------------- rope 1 -------------- */
//add bodies
const groupA = Body.nextGroup(true);

const ropeA = Composites.stack(100, 0, 1, 8, 10, 10, function (x, y) {
    return Bodies.circle(x, y, 25, { collisionFilter: { group: groupA } })
})

const ropeAConstraint = Constraint.create({
    pointA: {x: ropeA.bodies[0].position.x, y: ropeA.bodies[0].position.y},
    pointB: {x: -25, y : 0},
    bodyB: ropeA.bodies[0],
    stiffness: 0.1
})

Composites.chain(ropeA, 0.5, 0,-0.5, 0, {
    stiffness: 0.1,
    length: 10,
    render: {
        type: "line"
    }
})

Composite.add(world,[ropeA, ropeAConstraint]);

/* -------------- rope 2 -------------- */

var select = function(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
};

var loadSvg = function(url) {
    return fetch(url)
        .then(function(response) { 
            return response.text(); 
        })
        .then(function(raw) { 
            return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); 
        });
};
([
    './images/svg/u-pin.svg'
]).forEach(function(path, i) { 
    loadSvg(path).then(function(root) {
        var color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

        var vertexSets = select(root, 'path')
            .map(function(path) { return Vertices.scale(Svg.pathToVertices(path, 30), 0.3, 0.3); });

            const groupB = Body.nextGroup(true);

            const ropeB = Composites.stack(500, 0, 1, 1, 2, 50, function (x, y) {
                return Bodies.fromVertices(x, y, vertexSets, {
                    render: {
                        fillStyle: color,
                        strokeStyle: color, 
                        lineWidth: 1
                    },
                    collisionFilter: { group: groupB }
                }, true);
            })

            const ropeBConstraint = Constraint.create({
                pointA: {x: ropeB.bodies[0].position.x, y: ropeB.bodies[0].position.y},
                pointB: {x: -100, y : 0},
                bodyB: ropeB.bodies[0],
                stiffness: 0.1
            })

            Composites.chain(ropeB, 2, 0, 2, 0, { stiffness: 0.8, length: 2, render: { type: 'line' } });
            
            Composite.add(world,[ropeB, ropeBConstraint]);
    });
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
    // Render.lookAt(render, Composite.allBodies(engine.world), {
    //     x: 50,
    //     y: 50
    // });
};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
setTimeout(handleWindowResize, 1000);

