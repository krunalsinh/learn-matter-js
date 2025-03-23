
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

function createPuppet(x = 100, y = 100, bodyGrp = Body.nextGroup(true)) {
    const charBody = Composite.create({ label: 'charBody' });
    //face 
    const faceBg = Bodies.circle(x, y, 50, {
        isStatic: false,
        render: { fillStyle: "#666" }
    });
    const eyeL = Bodies.circle(x - 17, y - 10, 15, { render: { fillStyle: "#fff" } });
    const eyeR = Bodies.circle(x + 20, y - 10, 10, { render: { fillStyle: "#fff" } });
    const face = Body.create({
        label: "face",
        isStatic: false,
        density: 1,
        collisionFilter: { group: bodyGrp },
        parts: [faceBg, eyeL, eyeR]
    })
    //hands
    const handR = Bodies.rectangle(x + 60, y - 38, 70, 10, {
        label: "handR",
        friction: 0,
        density: 0.0002,
        isStatic: false,
        collisionFilter: { group: bodyGrp },
        render: { fillStyle: "#ff00ff" }
    });

    const constraintHandR = Constraint.create({
        bodyA: handR,
        pointA: { x: -25, y: 0 },
        bodyB: face,
        pointB: { x: 35, y: -35 },
    });

    const handL = Bodies.rectangle(x - 56, y - 38, 70, 10, {
        label: "handL",
        friction: 0,
        density: 0.0002,
        isStatic: false,
        collisionFilter: { group: bodyGrp },
        render: { fillStyle: "#ff00ff" }
    });
    const constraintHandL = Constraint.create({
        bodyA: handL,
        pointA: { x: 32, y: 0 },
        bodyB: face,
        pointB: { x: -25, y: -35 }
    });

    //legs
    const LegR = Bodies.rectangle(x + 60, y + 35, 70, 10, {
        label: "legR",
        friction: 0,
        density: 0.0002,
        isStatic: false,
        collisionFilter: { group: bodyGrp },
        render: { fillStyle: "#ff00ff" }
    });
    const constraintLegR = Constraint.create({
        bodyA: LegR,
        pointA: { x: -35, y: 0 },
        bodyB: face,
        pointB: { x: 25, y: 35 }
    });

    const LegL = Bodies.rectangle(x - 56, y + 35, 70, 10, {
        label: "legL",
        friction: 0,
        density: 0.0002,
        isStatic: false,
        collisionFilter: { group: bodyGrp },
        render: { fillStyle: "#ff00ff" }
    });
    const constraintLegL = Constraint.create({
        bodyA: LegL,
        pointA: { x: 32, y: 0 },
        bodyB: face,
        pointB: { x: -25, y: 35 }
    });

    Composite.addBody(charBody, face);
    Composite.addBody(charBody, handL);
    Composite.addBody(charBody, handR);
    Composite.addBody(charBody, LegL);
    Composite.addBody(charBody, LegR);
    Composite.addConstraint(charBody, constraintHandL);
    Composite.addConstraint(charBody, constraintHandR);
    Composite.addConstraint(charBody, constraintLegL);
    Composite.addConstraint(charBody, constraintLegR);

    return charBody;
}
const collisionGrp1 = Body.nextGroup(true);
const puppetA = createPuppet(200, 100, collisionGrp1);
const pointALH = puppetA.bodies.find(body => body.label === "handL");
const pointARL = puppetA.bodies.find(body => body.label === "legR");
const puppetB = createPuppet(300, 300, collisionGrp1);
const pointBLH = puppetB.bodies.find(body => body.label === "handL");


const mainPoint = Constraint.create({
    bodyA: pointALH,
    pointB: Vector.clone(pointALH.position),
    stiffness: 1,
    length: 0
})

const connectPoint = Constraint.create({
    bodyA: pointBLH,
    bodyB: pointARL,
    stiffness: 1,
    length: 0
})


console.log(puppetA);
Composite.add(world, [puppetA, puppetB, mainPoint, connectPoint]);

Composite.add(world, [
    // walls
    Bodies.rectangle(400, 0, 800, 50, { friction: 1, restitution: 0.8, isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { friction: 1, restitution: 0.8, isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { friction: 1, restitution: 0.8, isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { friction: 1, restitution: 0.8, isStatic: true })
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

