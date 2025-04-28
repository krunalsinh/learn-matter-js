
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

const box = Bodies.rectangle(innerWidth / 2 - 200, 300, 150, 10, {
    density: 1,
    render: {
        fillStyle: 'red',
        strokeStyle: 'black',
        lineWidth: 1
    }
})
const boxPos = Vector.clone(box.position);

const boxConstraint = Constraint.create({
    pointA: Vector.clone(box.position),
    bodyB: box,
    stiffness: 1
})

const box2 = Bodies.rectangle(innerWidth / 2 - 200, 300, 150, 10, {
    density: 1,
    render: {
        fillStyle: 'red',
        strokeStyle: 'black',
        lineWidth: 1
    }
})
const boxPos2 = Vector.clone(box.position);
const boxConstraint2 = Constraint.create({
    pointA: Vector.clone(box.position),
    bodyB: box2,
    stiffness: 1
})


// console.log(boxConstraint.pointA);
// console.log(box.position);
Composite.add(world, [box, boxConstraint, box2, boxConstraint2]);

Composite.add(world, [
    // walls
    Bodies.rectangle(960 - 100, 0, innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(960 - 100, innerHeight, innerWidth / 2, 50, { isStatic: true }),
    Bodies.rectangle(0, 450, 50, innerHeight, { isStatic: true }),
    Bodies.rectangle(innerWidth, 450, 50, innerHeight, { isStatic: true }),
]);




var lastTime = Common.now();
Events.on(engine, 'afterUpdate', function (event) {

    var time = engine.timing.timestamp,
        timeScale = (event.delta || (1000 / 60)) / 1000;


    // Body.rotate(body, 1 * Math.PI * 0.01, null, true);
    if (Common.now() - lastTime >= 500) {
        let color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);
        const rendX = (Math.random() * innerWidth - 150) + 100;
        const circle1 = Matter.Bodies.circle(rendX, Math.random() * 100 + 60, Math.random() * 35, {
            isStatic: false,
            render: {
                fillStyle: color,
                strokeStyle: '#fff',
                lineWidth: 1,
                density: 0.001
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
    // console.log(Math.sin(time * 0.0005));

    boxConstraint.pointA.x = boxPos.x + Math.sin(time * 0.0005) * 200;
    boxConstraint.pointA.y = boxPos.y + Math.cos(time * 0.0005) * 200;
    Body.rotate(box, 0.05);
    Body.rotate(box2, -0.05);



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

};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
setTimeout(handleWindowResize, 1000);


//add keyboard events
// boxConstraint.pointA.x = boxPos.x + Math.sin(time * 0.0005) * 200;
//     boxConstraint.pointA.y = boxPos.y + Math.cos(time * 0.0005) * 200;
window.addEventListener('keydown', e => {
    console.log(e.key);

    switch (e.key) {
        case 'w':
            boxConstraint2.pointA.y = boxConstraint2.pointA.y - 5;
            break;
        case 's':
            boxConstraint2.pointA.y = boxConstraint2.pointA.y + 5;
            break;
        case 'a':
            boxConstraint2.pointA.x = boxConstraint2.pointA.x - 5;
            break;
        case 'd':
            boxConstraint2.pointA.x = boxConstraint2.pointA.x + 5;
            break;

        default:
            break;
    }

})

