
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

function createHandLeg({ x1, y1, x2, y2, labelPrefix, color, bodyGrp, isStatic }) {
    const handLegRElbow = Bodies.rectangle(x1, y1, 70, 10, { label: `${labelPrefix}Elbow`, render: { fillStyle: color }, chamfer: { radius: 5 }, });
    const handLegRPam = Bodies.circle(x2, y2, 15, { label: `${labelPrefix}Pam`, density: 0.00001, render: { fillStyle: color }, });
    const handLegR = Body.create({
        label: labelPrefix,
        friction: 0,
        density: 0.0002,
        isStatic: isStatic,
        angle: Math.PI / 2,
        collisionFilter: { group: bodyGrp },
        parts: [handLegRElbow, handLegRPam]
    })

    return handLegR;
}

function createPuppet({ x = 100, y = 100, bodyGrp = Body.nextGroup(true), color = "#666", isStatic = false }) {
    console.log(bodyGrp);

    const charBody = Composite.create({ label: 'charBody' });
    //face 
    const faceBg = Bodies.circle(x, y, 50, { render: { fillStyle: "#666" } });
    const eyeL = Bodies.circle(x - 17, y - 10, 15, { render: { fillStyle: "#fff" } });
    const eyeR = Bodies.circle(x + 20, y - 10, 10, { render: { fillStyle: "#fff" } });
    const face = Body.create({
        label: "face",
        isStatic: isStatic,
        density: 1,
        collisionFilter: { group: bodyGrp },
        parts: [faceBg, eyeL, eyeR]
    })
    //hands

    const handR = createHandLeg({x1 : x + 57, y1 : y - 35, x2 : x + 77, y2 : y - 35, y, labelPrefix: "handR", color, bodyGrp, isStatic});

    const constraintHandR = Constraint.create({
        bodyA: handR,
        pointA: { x: -38, y: 0 },
        bodyB: face,
        pointB: { x: 20, y: -34 },
    });

    const handL = createHandLeg({x1 : x - 52, y1 : y - 36, x2 : x - 76, y2 : y - 36, y, labelPrefix: "handL", color, bodyGrp, isStatic});

    const constraintHandL = Constraint.create({
        bodyA: handL,
        pointA: { x: 37, y: 0 },
        bodyB: face,
        pointB: { x: -15, y: -35 }
    });

    //legs
    const legR = createHandLeg({x1 : x + 57, y1 : y + 34, x2 : x + 77, y2 : y + 34, y, labelPrefix: "legR", color, bodyGrp, isStatic});

    const constraintLegR = Constraint.create({
        bodyA: legR,
        pointA: { x: -38, y: 0 },
        bodyB: face,
        pointB: { x: 20, y: 35 }
    });

    const legL = createHandLeg({x1 : x - 52, y1 : y + 34, x2 : x - 76, y2 : y + 34, y, labelPrefix: "legL", color, bodyGrp, isStatic});

    const constraintLegL = Constraint.create({
        bodyA: legL,
        pointA: { x: 37, y: 0 },
        bodyB: face,
        pointB: { x: -15, y: 35 }
    });

    
    Composite.add(charBody, [face, handL, handR, legL, legR, constraintHandL, constraintHandR, constraintLegL, constraintLegR]);
    return charBody;
}
const collisionGrp1 = Body.nextGroup(true);

const puppetCount = 4;
const puppetArr = [];

for(let i = 0; i < puppetCount; i++) {
    puppetArr.push(createPuppet({ x: i * 150 + 500, y: i * 150 + 80, bodyGrp: collisionGrp1, color: `hsl(${Math.random() * 360},50%, 50%)`, isStatic: false }));
}

puppetArr.forEach((puppet,index) => {   
    
    if(index === 0) {
        const pointALH = puppet.bodies.find(body => body.label === "handL");
        const mainPoint = Constraint.create({
            bodyA: pointALH,
            pointB: Vector.clone(pointALH.position),
            stiffness: 1,
            length: 0
        })
        
        Composite.add(world, [mainPoint, puppet]);
    }else{
        const pointARL = puppetArr[index - 1].bodies.find(body => body.label === "legR");
        const pointBRL = puppet.bodies.find(body => body.label === "handL");
        const connectPoint = Constraint.create({
            bodyA: pointARL,
            pointA : { x: 25, y: 0 },
            bodyB: pointBRL,
            pointB : { x: -25, y: 0 },
            stiffness: 1,
            length: 0
        })
        Composite.add(world, [connectPoint, puppet]);
    }
})

// const mainPoint = Constraint.create({
//     bodyA: pointALH,
//     pointB: Vector.clone(pointALH.position),
//     stiffness: 1,
//     length: 0
// })

// const connectPoint = Constraint.create({
//     bodyA: pointARL,
//     pointA : { x: 25, y: 0 },
//     bodyB: pointBRL,
//     pointB : { x: -25, y: 0 },
//     stiffness: 1,
//     length: 0
// })

// Composite.add(world, [puppetA, puppetB, mainPoint, connectPoint]);

Composite.add(world, [
    // walls
    Bodies.rectangle(960 - 100, 0, innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(960 - 100, innerHeight , innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(0, 450, 50, innerHeight, { isStatic: true }),
    Bodies.rectangle( innerWidth , 450, 50, innerHeight, { isStatic: true }),
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

