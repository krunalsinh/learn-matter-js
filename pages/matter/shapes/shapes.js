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
const rect1 = Bodies.rectangle(450, 0, 80, 80, {
    label: "box1",
    isStatic: false,
    angle: Math.PI / 4,
    density: 1,
    friction: 0.5,
    restitution: 0.8,
    render: {
        fillStyle: '#e67e22',
        strokeStyle: '#fff',
        lineWidth: 3
    },
    chamfer: {
        radius: 5
    },
})
Composite.add(world, rect1);

/* 2) circle -----------------------------*/
const circle1 = Matter.Bodies.circle(60, 0, 60, {
    isStatic: false,
    angle: Math.PI / 4,
    density: 1,
    friction: 0.5,
    restitution: 0.8,
    render: {
        fillStyle: '#3498db',
        strokeStyle: '#fff',
        lineWidth: 3
    },
    chamfer: {
        radius: 5
    },
    label: "box1"
}, [1])
Composite.add(world, circle1);

/* 3) Polygon -----------------------------*/
const polygon1 = Bodies.polygon(100, 0, 3, 50, {
    angle: Math.PI / 4,
    density: 1,
    friction: 0.5,
    restitution: 0.8,
    render: {
        fillStyle: '#1abc9c',
        strokeStyle: '#fff',
        lineWidth: 3
    },
    chamfer: {
        radius: 3
    },
});
Composite.add(world, polygon1);

/* 4) Polygon 2-----------------------------*/
const polygon2 = Bodies.polygon(200, 0, 5, 50, {
    angle: Math.PI / 4,
    density: 1,
    friction: 0.5,
    restitution: 0.8,
    render: {
        fillStyle: '#e74c3c',
        strokeStyle: '#fff',
        lineWidth: 3
    },
    chamfer: {
        radius: 3
    },
});
Composite.add(world, polygon2);


/* 5) Custom shapes from Vertices-----------------------------*/
let arrowShape = Bodies.fromVertices(300, 50, arrow, {
    render: {
        fillStyle: "#9b59b6",
        strokeStyle: "#9b59b6",
        lineWidth: 1
    }
}, true);

let chevronShape = Bodies.fromVertices(400, 50, chevron, {
    render: {
        fillStyle: "#c0392b",
        strokeStyle: "#c0392b",
        lineWidth: 1
    }
}, true);

let starShape = Bodies.fromVertices(500, 50, star, {
    render: {
        fillStyle: "#16a085",
        strokeStyle: "#16a085",
        lineWidth: 1
    }
}, true);

let horseShoeShape = Bodies.fromVertices(300, 100, horseShoe, {
    render: {
        fillStyle: "#e84393",
        strokeStyle: "#e84393",
        lineWidth: 1
    }
}, true);
Composite.add(world, [arrowShape, chevronShape, starShape, horseShoeShape]);

/* 6) Custom shapes using external SVG Images-----------------------------*/
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
    './images/svg/hand-right.svg', 
    './images/svg/mark.svg',
    './images/svg/puzzle.svg',
    './images/svg/u-pin.svg'
]).forEach(function(path, i) { 
    loadSvg(path).then(function(root) {
        var color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

        var vertexSets = select(root, 'path')
            .map(function(path) { return Vertices.scale(Svg.pathToVertices(path, 30), 0.3, 0.3); });

        Composite.add(world, Bodies.fromVertices(100 + i * 150, 200 + i * 50, vertexSets, {
            render: {
                fillStyle: color,
                strokeStyle: color, 
                lineWidth: 1
            }
        }, true));
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
    Render.lookAt(render, Composite.allBodies(engine.world), {
        x: 50,
        y: 50
    });
};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
handleWindowResize();

