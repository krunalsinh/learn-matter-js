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

if (typeof fetch !== 'undefined') {
    var select = function(root, selector) {
        return Array.prototype.slice.call(root.querySelectorAll(selector));
    };

    var loadSvg = function(url) {
        return fetch(url)
            .then(function(response) { return response.text(); })
            .then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); });
    };

    loadSvg('../../../common/images/svg/map.svg')
        .then(function(root) {
            var paths = select(root, 'path');

            var vertexSets = paths.map(function(path) { return Svg.pathToVertices(path, 30); });

            var terrain = Bodies.fromVertices(400, 350, vertexSets, {
                isStatic: true,
                render: {
                    fillStyle: '#060a19',
                    strokeStyle: '#fff',
                    lineWidth: 2
                }
            }, true);

            Composite.add(world, terrain);

            var bodyOptions = {
                frictionAir: 0, 
                friction: 0.0001,
                restitution: 0.6
            };
            
            Composite.add(world, Composites.stack(80, 100, 20, 20, 10, 10, function(x, y) {
                if (Query.point([terrain], { x: x, y: y }).length === 0) {
                    return Bodies.polygon(x, y, 5, 12, bodyOptions);
                }
            }));
        });
} else {
    Common.warn('Fetch is not available. Could not load SVG.');
}

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
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });
};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
handleWindowResize();

